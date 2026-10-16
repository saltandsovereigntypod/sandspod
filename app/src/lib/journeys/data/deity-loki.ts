import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-loki',
  kind: 'deity',
  paths: ['norse'],
  deityRef: 'traditional/deity/loki',
  title: 'Loki, the Unbound Question',
  summary:
    'A lunar month with Loki: the shapeshifter who gets the gods into trouble and out of it, Odin’s blood-brother and Baldr’s bane. An honest look at the missing evidence for his worship, the living Heathen debate about him, and a careful, private practice.',
  welcome: `This journey spends about a month with Loki. It is written a little differently from the others, because Loki is different. There is no evidence that he was ever worshipped in pre-Christian Scandinavia, and modern Heathens disagree sharply about whether he should be honoured at all. Many groups do not hail him and do not want his name spoken at their blót or sumbel. Others honour him openly. This journey sets out both views fairly, and keeps the practice private, careful and grounded.

It is a self-dedication, not an initiation, and it does not replace the customs of any Heathen group. It is also fine, and quite common, to finish this month understanding Loki much better and choosing not to dedicate to him. If you are going through a crisis right now, you may want to come back to this journey later; Loki’s stories are about upheaval, and a time of upheaval is not always the best time to invite more.`,
  about: `Loki is one of the most vivid figures in Norse myth: the son of the giant Fárbauti and of Laufey, counted among the Æsir yet not quite one of them, Odin’s blood-brother, Sigyn’s husband, and the father of the wolf Fenrir, the World Serpent and Hel, as well as the mother of Odin’s eight-legged horse Sleipnir. Snorri calls him fair to look at but evil in disposition, a master of cunning who often brings the gods into trouble and often helps them out of it. He gets Thor his hammer and the gods their treasures; he also contrives the death of Baldr, insults every god at Ægir’s feast, and is bound beneath dripping venom until Ragnarök, when he steers a ship of their enemies against the gods. Unlike Thor, Odin or Freyr, Loki left no trace in place names, personal names, offerings or any account of cult; he may have been a figure of myth and story rather than a god who received worship. Today some Heathens honour him, often privately and often alongside Sigyn, as a god of change, wit, outsiders and uncomfortable truth; many Heathen groups do not, and some bar his name from their rites. Both positions are held in good faith.`,
  notes: [
    'There is no evidence of a historical cult of Loki: no place names, no Loki- personal names, no recorded offerings, no temples. Everything in modern Loki devotion is modern. This journey says so plainly.',
    'Many Heathen groups do not hail Loki, and some ask that his name not be spoken at blót or sumbel, often because of Baldr’s death and because Lokasenna shows him wrecking a feast. Others welcome him. Before mentioning Loki in any shared rite, ask the host. In someone else’s hall, their custom rules.',
    'People who honour Loki have sometimes been mocked or excluded in Heathen spaces, and people who don’t have sometimes been dismissed as narrow. This journey asks for courtesy both ways.',
    'Loki’s modern popularity owes a lot to Marvel films and television. That is a fine way to arrive, but the Loki of the Eddas is older, stranger and less charming. This journey works from the sources.',
    'Loki is linked in modern practice with fire and disruption. Keep flames small and watched, and do not invite chaos into a life that is already unstable. Changing things on purpose, with a plan, is a better offering than blowing things up.',
    'This app is inclusive. Many queer, trans and neurodivergent devotees feel close to Loki the shapeshifter, and their devotion is as welcome here as anyone’s.',
  ],
  holyDays: ['jol', 'vetrnaetur'],
  stages: [
    {
      kind: 'threshold',
      title: 'A Seat at the End of the Bench',
      intro:
        'In Lokasenna, Loki arrives uninvited, and Odin makes room for him because of an old oath. These first days are about making a small, private place for Loki, setting your terms honestly, and greeting him with clear boundaries.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'loki-shrine',
          title: 'Set up a private shrine',
          instructions: `Most Loki devotees keep his shrine separate from any shared or family shrine, out of respect for housemates and for gods or people who may not want him there. A small shelf, a box with a lid, or a corner of a desk works well.

Lay down a cloth. Add a cup, a small dish and one candle in a sturdy holder, on a heatproof tile or plate. For images: a knot or a tangle of thread, a fox, a salmon, a spider, a mask, a net, or a picture of the Snaptun stone, a Danish hearth stone carved with a face whose lips are stitched shut.

Many devotees also keep a small bowl for Sigyn, Loki’s faithful wife, beside his. It is a good balance: change on one side, steadfastness on the other.`,
          times: 1,
          prompt: 'Where did you put the shrine, and why there? Who did you consider when choosing?',
        },
        {
          id: 'loki-terms',
          title: 'Write your terms',
          instructions:
            'Before the opening rite, write down plainly what you are willing to invite and what you are not. For example: “I welcome honesty, humour, and help seeing what I have been avoiding. I do not welcome chaos at work, in my relationships or in my health.” Read it aloud at the rite. Keep it.',
          times: 1,
          prompt: 'Write your terms here.',
        },
      ],
      rite: {
        title: 'An Honest Welcome',
        summary:
          'A short, private greeting: hallow the space, set your terms aloud, offer a drink and a sweet, and invite Loki to the edge of your hall on clear conditions.',
        minutes: 20,
        ingredients: [
          { name: 'A small cup of something strong-tasting: whisky, spiced cider, strong coffee or ginger beer' },
          { name: 'A sweet or something spicy: cinnamon candy, ginger biscuit, chilli chocolate' },
          { name: 'A candle in a sturdy holder on a heatproof plate', ref: 'traditional/candle/orange', optional: true },
          { name: 'Your written terms' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
        ],
        preparation:
          'Choose a time when you are calm and not in crisis. Wash your hands. Set the cup and sweet on the shrine. Have your terms ready. Silence your phone.',
        steps: [
          {
            title: 'Hallow the space',
            instructions:
              'Light the candle. Walk once around the room sunwise and name it holy. If you usually hallow with Thor’s hammer sign, you may; many Loki devotees do.',
            spoken: 'I hallow this place. Here only what I invite may stay, and only on the terms I give.',
            light: true,
          },
          {
            title: 'Set your terms',
            instructions: 'Read your written terms aloud, clearly. This is not rudeness; it is good guesting on both sides.',
          },
          {
            title: 'Greet him',
            instructions: 'Lift the cup. Speak plainly, with some humour if it comes naturally.',
            spoken:
              'Loki, Laufey’s son, Odin’s blood-brother, Sigyn’s husband. Sly one, shapeshifter, who got the gods into trouble and out again. I have read your stories and I have come to listen. I offer you a drink at the end of my bench, on the terms I have said.',
          },
          {
            title: 'Say why you have come',
            instructions:
              'Tell him, honestly, what drew you: a story, a feeling of kinship, a need for change, curiosity. Say also what makes you wary. Be brief.',
            minutes: 4,
          },
          {
            title: 'Share, and greet Sigyn',
            instructions:
              'Drink a sip and eat a little of the sweet. If you keep a bowl for Sigyn, pour a little water or mead into it and greet her too.',
            spoken: 'I drink with you. Hail Loki. And hail Sigyn, who holds the bowl.',
          },
          {
            title: 'Sit a while',
            instructions: 'Sit a few minutes. Notice your mood honestly. If you feel unsettled, that is information, not failure.',
            minutes: 4,
            timed: true,
          },
          {
            title: 'Close firmly',
            instructions:
              'Thank him. Say clearly that the rite is over. Snuff the candle. Within a few hours, pour the drink outside on the earth and dispose of the sweet.',
            spoken: 'Thank you, Loki. The rite is ended; go in peace, and I go in peace.',
            snuff: true,
          },
        ],
        closing:
          'Write down what you said and how you felt afterwards, and again the next day. Note anything unusual, without leaping to conclusions.',
        safety:
          'Keep the candle on a heatproof surface, away from paper, cloth, curtains and pets, and never leave it burning. Coffee, chocolate, xylitol-sweetened sweets and alcohol are toxic to dogs and cats. Pour offerings outside or down a drain, not into houseplants. If you are in recovery, use a non-alcoholic drink; Loki devotion does not require alcohol.',
      },
    },
    {
      kind: 'study',
      title: 'The Stories and the Silence',
      intro:
        'Twelve days of reading: who Loki is in the sources, the long chain of stories in which he helps and harms, and the honest question of whether he was ever worshipped at all.',
      days: 12,
      lessons: [
        {
          id: 'loki-who',
          title: 'Laufey’s Son',
          summary: 'Loki’s family, names and character as Snorri and the Eddic poems give them.',
          minutes: 6,
          sections: [
            {
              heading: 'Snorri’s portrait',
              body: `Snorri introduces Loki at the end of his list of the gods, with obvious unease. In Rasmus Anderson’s 1880 translation of the Prose Edda:

“Loke is fair and beautiful of face, but evil in disposition, and very fickle-minded. He surpasses other men in the craft called cunning, and cheats in all things. He has often brought the asas into great trouble, and often helped them out again, with his cunning contrivances.”

That sentence holds the whole puzzle of Loki. He is counted among the Æsir and lives with them, but he is the son of a giant, Fárbauti (“cruel striker”), and of Laufey (“leafy island”) or Nál (“needle”). Unusually, he is often named after his mother: Loki Laufeyjarson. His brothers are Býleistr and Helblindi, of whom almost nothing is known.`,
            },
            {
              heading: 'His families',
              body: `Loki’s wife is Sigyn, whose name may mean “victory-friend.” Their sons are Narfi (or Nari) and Váli. With the giantess Angrboða, “she who brings grief,” Loki fathers three terrible children: the wolf Fenrir, the World Serpent Jörmungandr, and Hel, ruler of the dead. And when a giant builder’s stallion threatened to finish Asgard’s wall in time to win Freyja, Loki turned himself into a mare, lured the stallion away, and later gave birth to Sleipnir, Odin’s eight-legged horse.

So Loki is father of the monsters who end the world and mother of the finest horse in it. He crosses lines of gender and species as easily as he changes shape: a mare, a salmon, a fly, a seal, an old woman, a falcon in Freyja’s feather cloak.`,
            },
            {
              heading: 'Odin’s blood-brother',
              body: `The most important thing about Loki, for the modern debate, is his oath with Odin. In Lokasenna, Loki arrives uninvited at the sea-giant Ægir’s feast and is refused a seat. He reminds Odin:

“Remember, Othin, in olden days / That we both our blood have mixed; / Then didst thou promise no ale to pour, / Unless it were brought for us both.” (Henry Adams Bellows’ 1923 translation, stanza 9)

And Odin, honour-bound, tells his son Víðarr to make room: “Stand forth then, Vithar, and let the wolf’s father / Find a seat at our feast” (stanza 10). The blood-brotherhood is mentioned nowhere else, but within the poem it binds Odin to share his drink with Loki. Some modern devotees take this as a reason to pour Loki a share whenever Odin is toasted. Others note that the same poem shows what happens next: Loki insults everyone in the hall.`,
            },
            {
              heading: 'His names',
              body: `Loki is also called Loptr, perhaps “airy one,” and Hveðrungr, a name of unclear meaning. Snorri gives him kennings: Sigyn’s husband, the thief of Iðunn’s apples, the slanderer of the gods, the sly god, the bound god. Völuspá names a god Lóðurr who, with Odin and Hœnir, gives the first humans warmth or blood and good colour; some scholars, including Bellows in his notes, think Lóðurr is Loki under an older name. Others disagree. If they are right, Loki helped make humanity.`,
            },
          ],
          knowAndDont: {
            known:
              'Loki’s parents, wife, children and shapeshifts are given in Snorri’s Gylfaginning and Skáldskaparmál and in the Eddic poems Lokasenna, Þrymskviða, Völuspá, Hyndluljóð and others. The blood-brotherhood with Odin is in Lokasenna 9.',
            unknown:
              'The meaning of Loki’s name is unknown; suggestions link it with “lock,” “close,” “end,” “spider-web,” or “light.” Whether Lóðurr is Loki is debated. Útgarða-Loki and Logi (“flame,” who out-eats Loki in the Útgarða-Loki story) are separate figures, though modern books often merge them with Loki.',
          },
          inPractice:
            'Devotees often address Loki as Laufeyjarson, honouring his mother, and some hail Laufey and Sigyn alongside him. Many keep the stories close by reading Lokasenna slowly, since it is the poem in which Loki is most fully himself.',
          reflect: [
            'Loki is both father of the world’s destroyers and mother of its best horse. What do you make of that?',
            'Odin keeps his oath to Loki even when it costs him. What oaths of yours have become awkward to keep?',
          ],
          further: [
            'Gylfaginning ch. 33 and 49–50 in Rasmus B. Anderson, The Younger Edda (1880), public domain.',
            'Lokasenna in Henry Adams Bellows, The Poetic Edda (1923), public domain.',
            'John Lindow, Norse Mythology: A Guide (2001), entry on Loki.',
          ],
          library: ['traditional/deity/loki', 'traditional/deity/odin', 'traditional/deity/hel'],
        },
        {
          id: 'loki-myths',
          title: 'Trouble and Rescue',
          summary: 'The chain of Loki stories, from the gods’ treasures to Baldr’s death and the binding, and what they say about him.',
          minutes: 7,
          sections: [
            {
              heading: 'The helper',
              body: `Many Loki stories follow a pattern: he causes a disaster, and then he solves it, usually because the gods threaten him. He cuts off Sif’s golden hair as a prank. Thor threatens to break every bone in his body. Loki goes to the dwarves and returns with new hair of real gold, Odin’s spear Gungnir and Freyr’s ship Skíðblaðnir, and then bets his head that another pair of dwarves cannot do better. They make Draupnir, Gullinbursti and Mjölnir. Loki, as a fly, bites the smith to spoil the work, which is why the hammer’s handle is short. He loses the bet, and saves his head with a technicality: they may have his head, but not his neck. The dwarves sew his lips shut instead.

Nearly every great treasure of the gods comes to them through Loki’s mischief. He also lures away the builder’s stallion, saving Freyja, the sun and the moon; goes with Thor to Þrymr and talks them through the wedding feast; and makes the grieving giantess Skaði laugh, as part of the gods’ atonement for her father, by tying his genitals to a goat.`,
            },
            {
              heading: 'The harm',
              body: `Other stories have no rescue. Loki is forced by the giant Þjazi to lure the goddess Iðunn out of Asgard with her apples of youth, and the gods begin to grow old; he gets her back in falcon shape, but only under threat. In Lokasenna he insults every god and goddess at the feast, accusing them of cowardice, adultery and worse, often with an uncomfortable grain of truth, until Thor arrives and threatens him with the hammer.

Worst of all is Baldr. Snorri says that when Frigg took oaths from every thing not to harm her son, Loki, disguised as an old woman, learned that the mistletoe had been left out, made a dart of it and guided blind Höðr’s hand to throw it. When Hel offered to release Baldr if everything wept for him, a giantess named Þökk refused, and Snorri says people believed Þökk was Loki.`,
            },
            {
              heading: 'The binding and the end',
              body: `The gods hunted Loki down. He hid as a salmon in a waterfall, and they caught him in a net, the net he himself had invented. Snorri tells how they turned his son Váli into a wolf, who tore apart his brother Narfi, and bound Loki with Narfi’s entrails across three stones. Skaði hung a serpent over his face. In Anderson’s translation: “But Sigyn, his wife, stands by him, and holds a dish under the venom-drops. Whenever the dish becomes full, she goes and pours away the venom, and meanwhile the venom drops onto Loke’s face. Then he twists his body so violently that the whole earth shakes, and this you call earthquakes.”

At Ragnarök Loki breaks free. Völuspá has him at the helm of a ship sailing against the gods (Snorri instead gives Naglfar, the ship made of dead men’s nails, to the giant Hrymr). He and the god Heimdallr kill each other.`,
            },
            {
              heading: 'Reading Loki',
              body: `Scholars have proposed many keys to Loki: a fire god (from a confusion with Logi), a spider-like weaver of nets, a shaman, a mere literary device, or a figure whose role is to make the story move. The French scholar Georges Dumézil saw him as the necessary disturber of the gods’ order. None of these readings has won.

Devotees often read him as a god of necessary change, of the truth nobody wants spoken, and of the outsider who is inside. Heathens who decline to honour him read the same stories and see a figure who betrays his friends, murders the gods’ beloved son and leads the dead at the end of the world. Both are honest readings of the same texts.`,
            },
          ],
          knowAndDont: {
            known:
              'The treasures, Iðunn, the builder, Skaði’s laughter, Baldr and the binding are in Snorri’s Edda; Lokasenna, Þrymskviða and Völuspá are Eddic poems. The binding with Sigyn and the bowl is also told in the prose end of Lokasenna.',
            unknown:
              'Snorri is our only full source for many of these stories, including Loki’s part in Baldr’s death; in Völuspá and the older poem Baldrs draumar, Loki’s role is less explicit. Snorri may have shaped Loki partly on Christian ideas of the devil. Whether Loki was always so dark, or grew darker in Christian retellings, is debated.',
          },
          inPractice:
            'Many devotees honour Sigyn as a model of faithfulness and compassion, the one who holds the bowl, and some see the bound Loki as a figure of suffering rather than only of punishment.',
          reflect: [
            'When has trouble you caused led somewhere good? When has it not?',
            'Lokasenna’s insults often contain a grain of truth. Is there a truth about you that someone has said unkindly?',
          ],
          further: [
            'Skáldskaparmál and Gylfaginning in Anderson (1880) or Anthony Faulkes, Edda (Everyman).',
            'Georges Dumézil, Loki (1948; French), discussed in Lindow (2001).',
          ],
          library: ['traditional/deity/loki', 'traditional/deity/thor', 'traditional/deity/baldur', 'traditional/deity/skadi'],
        },
        {
          id: 'loki-cult',
          title: 'Was Loki Ever Worshipped?',
          summary: 'The honest answer about Loki’s missing cult, the few images and folk traces that survive, and what follows from that.',
          minutes: 6,
          sections: [
            {
              heading: 'What is missing',
              body: `For Thor, Odin and Freyr we have place names (Torsåker, Odense, Frøyland), personal names (Thorstein, Freysteinn), runestone prayers, amulets, saga accounts of temples and offerings, and Christian writers attacking their worship. For Loki we have none of that. No place in Scandinavia is named for him. No one is known to have been named after him. No source mentions an offering, a temple, a priest or a prayer to him.

That is a striking silence. It suggests that Loki was a figure of myth and storytelling, important in the poems but not someone people sacrificed to. It does not prove it; our evidence for many gods is patchy. But it means that every form of Loki worship today is a modern creation.`,
            },
            {
              heading: 'Stones and images',
              body: `A few objects may show him. The Snaptun stone, a hearth stone found in Denmark and dated around 1000, shows a moustached face with stitched lips, which many identify as Loki after the dwarves sewed his mouth shut. It was a bellows shield for a forge fire, which is suggestive. A carved stone at Kirkby Stephen in Cumbria shows a horned, bound figure, and the Gosforth Cross nearby, from the early 900s, shows a bound figure with a woman holding something over him, possibly Loki and Sigyn. These identifications are plausible, not certain.`,
            },
            {
              heading: 'Folklore',
              body: `Loki survives better in later folklore than in cult. In Danish and Norwegian sayings recorded in the 1800s and later, the shimmering air on a hot day is Loki sowing his oats, and a crackle or spit from the fire is Loki beating his children. A Faroese ballad, Lokka táttur, recorded in the 1800s, has Loki, after Odin and Hœnir fail, cleverly saving a farmer’s son from a giant by hiding him in a fish’s roe and luring the giant into a trap. Here he is a crafty helper of humans.

These are traces of a figure people knew and talked about, sometimes fondly. They are not signs of worship.`,
            },
            {
              heading: 'What follows',
              body: `If you honour Loki, you are doing something new, built on old stories. That is not illegitimate; much of modern Heathenry is reconstructed or newly made, and many devotees report powerful experiences. But it is honest to say so, and it is why other Heathens are entitled to say “we don’t do that here.”

It also gives you freedom. No old rule tells you what Loki likes, so be wary of anyone who tells you with certainty. Build your practice on the stories and on what actually happens when you make offerings, and write it down.`,
            },
          ],
          knowAndDont: {
            known:
              'There is no attested cult, place name, theophoric personal name or offering for Loki. The Snaptun stone, Kirkby Stephen stone and Gosforth Cross exist. Danish, Norwegian and Faroese folklore about Loki was recorded in the 19th and 20th centuries.',
            unknown:
              'Whether the silence means Loki was never worshipped, or that evidence has been lost, cannot be settled. The identifications of the stones as Loki are interpretations. How old the folklore is, and whether it continues pre-Christian belief, is unknown.',
          },
          inPractice:
            'Thoughtful Loki devotees are often careful to label their practice as modern and personal, and to share it as “what I do,” not “what was done.”',
          reflect: [
            'How does it feel to honour a god whose worship has no recorded history? Freeing, uncertain, both?',
            'Why do you think Loki was talked about so much and, as far as we know, worshipped so little?',
          ],
          further: [
            'Rudolf Simek, A Dictionary of Northern Mythology (1993), entries on Loki and Lokka táttur.',
            'Anna Birgitta Rooth, Loki in Scandinavian Mythology (1961).',
          ],
          library: ['traditional/deity/loki'],
        },
      ],
      practices: [
        {
          id: 'loki-lokasenna',
          title: 'Read Lokasenna slowly',
          instructions:
            'Over these twelve days, read Lokasenna, five or six stanzas a day. For each insult Loki makes, note whether there is any truth in it, and how the god answers.',
          times: 12,
          every: 'day',
          prompt: 'Which exchange struck you most today? Whose side were you on?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine Nights, Carefully',
      intro:
        'In this stage you learn how Loki is approached in modern Heathenry and what a safe, grounded practice looks like, and keep nine nights of short offerings with Sigyn beside him.',
      days: 9,
      lessons: [
        {
          id: 'loki-debate',
          title: 'Loki at the Sumbel: The Modern Debate',
          summary: 'Why many Heathen groups do not hail Loki, why others do, and how to behave well in either kind of hall.',
          minutes: 7,
          sections: [
            {
              heading: 'Groups that do not hail him',
              body: `Many Heathen groups, inclusive and folkish alike, do not hail Loki at blót or sumbel, and some ask that his name not be spoken in their rites at all. Their reasons vary. Loki is the slayer of Baldr and the enemy of the gods at Ragnarök. In Lokasenna, he walks into a feast and turns it into a brawl of insults; a sumbel, where words are meant to be true and weighty, is exactly the wrong place for that. There is no historical precedent for his worship. And some groups report that rites where Loki was hailed went badly: arguments, accidents, people leaving upset.

These are not irrational positions. A group is entitled to decide which gods it invites. Respecting that is basic Heathen courtesy, the same courtesy that applies to any household’s customs.`,
            },
            {
              heading: 'Those who honour him',
              body: `Other Heathens honour Loki openly, as one of the gods. They point out that he lived among the Æsir for ages and helped them countless times; that Odin himself swore to share his drink with him; that the gods’ treasures, Thor’s hammer included, came through him; that Sigyn stays faithful to him. They see him as a god of change, wit, honesty, transformation and the outsider, and many report a warm, funny, sometimes challenging relationship with him.

People who focus their devotion on Loki are often called Lokeans, a name that spread in online communities from the early 2000s. Some honour him within broader Heathenry; others work with him and with the jötnar, the giants, in a practice sometimes called Rökkatru. Many Lokeans are queer, trans or neurodivergent, and find in the shapeshifter who bore Sleipnir a god who understands them.`,
            },
            {
              heading: 'Behaving well in either hall',
              body: `If you honour Loki and attend a group that does not, do not hail him there, do not pour for him in their horn, and do not argue the point in the middle of their rite. Honour him privately at home. If the group’s policy bars you from membership, you can decide whether that group is right for you, but do not try to change it by stealth.

If you do not honour Loki and someone in your group does, you do not have to welcome him in your rites. You do owe that person ordinary courtesy. Mocking or harassing Lokeans, which has happened, is not Heathen hospitality.

When you are a guest and unsure, ask the host before the rite: “Is it all right if I mention Loki?” Hosts appreciate it, and it removes any awkwardness.`,
            },
            {
              heading: 'Blót and sumbel, briefly',
              body: `For any Heathen rite, it helps to know the forms. A blót (offering) hallows the space, calls the gods, blesses a horn of drink, shares it among those present and pours the rest out to the gods. A sumbel is a formal drinking in rounds, usually three: one to the gods, one to heroes and ancestors, one open for boasts, toasts and vows. Words spoken over the sumbel horn are held to be weighty and binding.

Loki devotees who keep a private sumbel often toast him in the first round, sometimes with Sigyn. Some add a light-hearted round, telling a joke or a true story against themselves, which suits him far better than a solemn speech.`,
            },
          ],
          knowAndDont: {
            known:
              'Heathen groups set their own policies on Loki and they differ widely. The term Lokean and online Loki devotion are documented from the early 2000s. Lokasenna shows Loki disrupting a feast; the blood-brotherhood with Odin is in the same poem.',
            unknown:
              'There is no historical guidance on Loki in rites, because there is no record of Loki in rites. Reports of rites “going wrong” when Loki is hailed are personal experience, as are reports of rites going well. The three-round sumbel is a modern formalisation.',
          },
          inPractice:
            'Most Loki devotees keep their worship of him at home, ask before mentioning him in shared spaces, and many honour Sigyn alongside him as a counterweight of constancy.',
          reflect: [
            'If you were hosting a blót, what would your policy on Loki be, and why?',
            'How would you feel being asked not to name a god you love? How would you want to respond?',
          ],
          further: [
            'Dagulf Loptson, Playing with Fire: An Exploration of Loki Laufeyjarson (2014), a devotee’s perspective.',
            'Stefanie von Schnurbein, Norse Revival (2016), for the wider landscape of modern Heathenry.',
          ],
          library: ['traditional/deity/loki', 'traditional/deity/odin'],
          premade: ['folk-simple-blot'],
        },
        {
          id: 'loki-practice',
          title: 'Offerings, Days and Safe Practice',
          summary: 'What modern devotees offer Loki, why there is no traditional day, and how to keep a practice that changes you without wrecking you.',
          minutes: 6,
          sections: [
            {
              heading: 'Offerings, honestly modern',
              body: `There are no traditional offerings to Loki, because there is no record of offerings at all. Modern devotees have settled on things that suit his character: strong drink (whisky, spiced rum, cinnamon liqueur), strong coffee, spicy food, cinnamon sweets, sweets in general, handmade crafts, knots and puzzles, jokes and songs, and a candle flame, watched. Many offer acts: telling an uncomfortable truth kindly, learning a new skill, trying something that frightens you a little, making something from scraps.

Mead and ale are fine too, as for any Norse god. Sigyn is often given water, mead or a simple bowl of something sweet, and some devotees dedicate acts of care, sitting with someone suffering, to her.

The gift-for-gift principle of the Hávamál still holds: “gifts with gifts requite” (Henry Adams Bellows’ translation, stanza 42). The relationship should feel mutual, not like a debt that keeps growing.`,
            },
            {
              heading: 'Days',
              body: `Loki has no day in the old calendar. You will often read that Saturday is “Loki’s day.” It is not: the Old Norse laugardagr, Swedish lördag and Danish lørdag mean “washing day,” and English Saturday is Saturn’s day. Some devotees keep Saturday for him anyway, knowingly; that is a modern choice.

For the year, many Loki devotees mark him privately at Yule and Winter Nights, alongside their other gods, if their household is comfortable with it. Any “Loki festival” you see online is modern.`,
            },
            {
              heading: 'Safe practice',
              body: `Be specific. If you ask Loki for change, say what change, where, and how much. “Help me find the courage to leave this job by spring” is a request; “shake up my life” is an invitation you may regret.

Keep boundaries. Open and close every rite clearly. Do not let him, or the idea of him, take over your thinking; take days off. If you start attributing every mishap to Loki, step back. And never use Loki as an excuse for your own harmful behaviour. Tricksters in myth face consequences; so do people.

Be honest about your health. If you have a history of mania, psychosis or self-destructive patterns, keep your Loki practice light and talk to someone you trust, or to your doctor or counsellor, if it starts to feel compulsive or frightening. If you are in crisis, contact a crisis line or emergency services. A good god does not need you unwell.`,
            },
            {
              heading: 'Fire',
              body: `Many devotees associate Loki with fire, partly through the old confusion with Logi and partly through folklore about the crackling hearth. If you use flame, keep it to a single candle on a heatproof plate, away from anything that burns, and never leave it. A candle is enough; there is no need for bonfires, incense clouds or anything else that could get out of hand.`,
            },
          ],
          knowAndDont: {
            known:
              'No historical offerings to Loki are recorded. Laugardagr means “washing day.” Folk sayings link Loki to the hearth fire and heat shimmer.',
            unknown:
              'All modern Loki offerings and customs are recent, mostly from the last few decades, and vary between communities. What Loki “likes” is a matter of devotees’ experience, not tradition.',
          },
          inPractice:
            'A grounded weekly Loki practice might be: a small offering, a short honest conversation at the shrine, one deliberate small change in the week, and a line in the journal. Sigyn gets a bowl too.',
          reflect: [
            'What specific change would you ask for, if you asked for one?',
            'What signs would tell you your practice had become unhealthy? Write them down now, while you are calm.',
          ],
          further: ['Hávamál in Bellows (1923).', 'Loptson, Playing with Fire (2014).'],
          library: ['traditional/deity/loki', 'traditional/herb/cinnamon', 'traditional/crystal/carnelian', 'traditional/candle/orange'],
        },
      ],
      practices: [
        {
          id: 'loki-nine-nights',
          title: 'Nine nights, with Sigyn',
          instructions: `For nine nights, at the private shrine, light the candle on its heatproof plate. Give Loki a small offering, a splash of drink, a sweet, a joke, a knot tied and untied. Pour a little water or mead into Sigyn’s bowl and greet her.

Then tell Loki one honest thing: something you have been avoiding, a truth about yourself, a change you want. Sit for five minutes. Close firmly: “The rite is ended.” Snuff the candle. Give the offerings to the earth or dispose of them the next morning.

On the ninth night, make something from leftovers or scraps, a drawing, a small craft, a meal, and offer it.`,
          times: 9,
          every: 'day',
          prompt: 'What honest thing did you say tonight? How did you feel tonight, and how did you feel the next morning?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'The Bowl and the Venom',
      intro:
        'Take more time than usual here. Read your journal carefully, including how you felt the morning after each night. Pausing, stopping, honouring Loki only occasionally without a vow, or turning to another god are all good outcomes, and common ones.',
      days: 5,
      lessons: [],
      practices: [
        {
          id: 'loki-reread',
          title: 'Read your record, and ask someone',
          instructions:
            'Read everything since the first rite. Then, if you can, talk it over with someone you trust who knows you well, Heathen or not. Ask them whether you have seemed more yourself this month, or less.',
          times: 1,
          prompt: 'What did your record and your friend tell you?',
        },
      ],
      questions: [
        'Has this month made your life clearer and more honest, or more chaotic? Look at the evidence, not the feeling.',
        'Are you drawn to the Loki of the Eddas, or to a film character? Which one did you meet?',
        'Can you accept that most Heathen groups may not welcome Loki in their rites, and keep your devotion private there without resentment?',
        'Are you hoping Loki will solve something that needs practical help, from a friend, a doctor or a counsellor?',
        'Would it be better to honour Loki occasionally, as a respected figure of the stories, without a vow?',
        'What specific, modest vow could you keep for a year?',
        'If you stop here, what will you keep from this month?',
      ],
    },
    {
      kind: 'dedication',
      title: 'A Seat, Freely Given',
      intro: `If you have decided to go on, this is the dedication: a private blót, a vow you have written in advance with clear terms, and a token. It is a self-dedication between you and Loki. It is not an initiation into any group, and it does not replace any group’s customs. Make the vow short, modest and specific, for a year and a day at most; a trickster’s vow should be one you can read without loopholes.`,
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'loki-write-vow',
          title: 'Write the vow',
          instructions:
            'A day before, write your vow. Include what you will offer (for example, a small Saturday offering), what you will practise (for example, one honest conversation or deliberate change a month), how long, what you ask (honesty, wit, the courage to change), and what you do not consent to. Read it for loopholes and close them.',
          times: 1,
          prompt: 'Write the final vow here.',
        },
      ],
      rite: {
        title: 'Dedication to Loki',
        summary:
          'A private blót in which you hallow the space, restate your terms, hail Loki and Sigyn, speak a written vow over the cup, and hallow a knotted token.',
        minutes: 30,
        ingredients: [
          { name: 'A cup of strong drink, coffee or ginger beer' },
          { name: 'A small bowl of water or mead for Sigyn' },
          { name: 'A sweet or spicy offering' },
          { name: 'A candle on a heatproof plate', ref: 'traditional/candle/orange' },
          { name: 'A length of red or orange cord, to knot', optional: true },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'Your written vow and terms' },
        ],
        preparation:
          'Choose a calm day. Clean the shrine. Set out the cup, Sigyn’s bowl, the sweet and the cord. Have your vow ready. Silence your phone and make sure you will not be interrupted.',
        steps: [
          {
            title: 'Hallow',
            instructions: 'Light the candle on its plate. Walk sunwise around the room and name it holy.',
            spoken: 'I hallow this place. Here only what I invite may stay, and only on the terms I give.',
            light: true,
          },
          {
            title: 'Restate your terms',
            instructions: 'Read aloud what you welcome and what you do not.',
          },
          {
            title: 'Hail Loki and Sigyn',
            instructions: 'Lift the cup.',
            spoken:
              'Loki Laufeyjarson, Loptr, Odin’s blood-brother. Shapeshifter, maker of nets, bringer of the gods’ treasures, teller of truths no one wanted. I have kept nine nights with you. I come again now, freely, to offer you my friendship on the terms I have said. And Sigyn, faithful one, who holds the bowl: be welcome and be witness.',
          },
          {
            title: 'Share the cup',
            instructions: 'Drink a sip and taste the sweet. Pour a little into Sigyn’s bowl.',
            spoken: 'I drink with you. Hail Loki! Hail Sigyn!',
          },
          {
            title: 'Speak the vow',
            instructions: 'Hold the cup and read your vow aloud, once, clearly. Take one sip to seal it.',
            spoken: 'These are my words, meant as I have written them, without loophole or trick. Witness them, and hold me to them.',
          },
          {
            title: 'Knot the token',
            instructions:
              'Take the cord and tie three knots in it, saying a word for each: one for what you ask, one for what you give, one for your terms. Keep it on the shrine or wear it around your wrist.',
            spoken: 'A knot for what I ask. A knot for what I give. A knot for the terms between us.',
          },
          {
            title: 'Give his share',
            instructions: 'Pour the rest of the cup into the offering bowl and lay the sweet beside it.',
            spoken: 'Gift for gift. This is yours, given gladly. Give me in return a clear eye, a quick wit and the courage to change what should change.',
          },
          {
            title: 'Close firmly',
            instructions:
              'Thank Loki and Sigyn. Say clearly that the rite is over. Snuff the candle. Take the offerings outside to the earth within a few hours.',
            spoken: 'Thank you, Loki. Thank you, Sigyn. The rite is ended; go in peace, and I go in peace.',
            snuff: true,
          },
        ],
        closing:
          'Write the date and your vow in your journal. Note how you feel the next morning, too. Keep the paper vow for your rededication next year, and reread it if you ever feel things are slipping.',
        safety:
          'Keep the candle on a heatproof plate, away from the cord, paper, cloth and pets, and never leave it burning. If you are in recovery, use a non-alcoholic drink. Coffee, chocolate, xylitol sweets and alcohol are toxic to pets. Pour offerings outside or down a drain, not into houseplants.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping Faith with a Trickster',
      intro: `Keep the offering and practice you vowed, and keep your boundaries. Many devotees honour Loki privately on Saturdays, by modern custom, and include him and Sigyn at home at Yule and Winter Nights if their household agrees. In shared rites, follow the host’s custom. Once a year, read your vow aloud, say honestly how it went, check it for loopholes, and renew it or let it end.`,
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'loki-weekly',
          title: 'Weekly offering and check-in',
          instructions:
            'Once a week, light the candle, give a small offering to Loki and to Sigyn, say one honest thing, and close firmly. Write one line about how your week has gone.',
          times: 52,
          every: 'week',
          prompt: 'What changed this week, and was it the change you asked for?',
        },
        {
          id: 'loki-tides',
          title: 'Private holy tides',
          instructions:
            'At Yule and Winter Nights, if your household is comfortable, include a small private offering to Loki and Sigyn alongside your other gods. In shared rites, follow the host’s custom.',
          times: 2,
          every: 'holy-day',
          prompt: 'How did you honour Loki at this tide, and how did it sit with your household or group?',
        },
        {
          id: 'loki-rededicate',
          title: 'Yearly review and rededication',
          instructions:
            'On the anniversary of your dedication, reread your vow and your journal. Ask honestly whether the year was better for it. Repeat the rite with a new vow, or thank Loki and close the vow with gratitude. Both are good outcomes.',
          times: 1,
          prompt: 'Was this year better for the vow? Will you renew it, change it, or close it?',
        },
      ],
    },
  ],
  sources: [
    'Rasmus B. Anderson, trans., The Younger Edda (1880), public domain: Gylfaginning ch. 33 (“Loke is fair and beautiful of face…”) and ch. 50 (Sigyn and the venom) quoted from Project Gutenberg ebook #18947 (https://www.gutenberg.org/ebooks/18947).',
    'Henry Adams Bellows, trans., The Poetic Edda (1923), public domain: Lokasenna 9 and 10 and Hávamál 42 quoted, and Bellows’ notes on Lóðurr consulted, from Project Gutenberg ebook #73533 (https://www.gutenberg.org/ebooks/73533).',
    'Snorri Sturluson, Skáldskaparmál (the treasures, Iðunn, Skaði) and Gylfaginning (the builder, Baldr, the binding), paraphrased.',
    'Archaeology: the Snaptun stone (Denmark); the Kirkby Stephen stone; the Gosforth Cross. Folklore: Danish and Norwegian Loki sayings; the Faroese ballad Lokka táttur.',
    'John Lindow, Norse Mythology (2001); Anna Birgitta Rooth, Loki in Scandinavian Mythology (1961); Georges Dumézil, Loki (1948); Rudolf Simek, A Dictionary of Northern Mythology (1993).',
  ],
};
