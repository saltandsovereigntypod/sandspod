import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-tyr',
  kind: 'deity',
  paths: ['norse'],
  deityRef: 'traditional/deity/tyr',
  title: 'Tyr, the One-Handed God',
  summary:
    'A lunar month with Týr, the Norse god of law, oaths and courage: the hand he gave to the wolf, the ancient sky-god *Tīwaz behind him, the Thing and the oath ring, and a practice built on keeping your word.',
  welcome: `This journey spends about a month with Týr. You will read his one great myth closely, follow his name back thousands of years, learn how the Norse world swore oaths and settled disputes at the Thing, set up a shrine, keep nine days of small promises kept, and decide at the end whether to dedicate yourself to him.

It is a self-dedication, not an initiation, and it does not replace the rites of any Heathen group. It will also ask more of you than most journeys, because Týr is honoured above all through deeds: telling the truth, keeping promises, standing up for fairness. Before you begin, know this: the vows in this journey are meant to be kept. Make them small.`,
  about: `Týr (Old English Tīw, from Proto-Germanic *Tīwaz) is one of the oldest gods of the Germanic peoples. His name shares a root with Greek Zeus, Sanskrit Dyaus and Latin deus, the old Indo-European word for a god of the bright sky, and in Old Norse týr can simply mean “god.” By the Viking Age he was a lesser figure than Odin and Thor, but still remembered as the bravest of the gods, the one who laid his right hand in the wolf Fenrir’s mouth as a pledge so that the wolf could be bound, and lost it. Snorri says warriors should call on him and that he is “called a peacemaker among men,” though he adds the joke that he is no reconciler. Romans equated him with Mars, so Tuesday (Tīwesdæg, Týsdagr) is his day; an altar on Hadrian’s Wall names Mars Thingsus, “Mars of the Thing,” the assembly where law was spoken. The rune ᛏ bears his name, and the poem Sigrdrífumál tells warriors to carve it on a sword and “twice call on Tyr.” Today Heathens honour him as god of law, justice, oaths and courage, call on him to witness vows at sumbel and at assemblies, and give him mead, ale and, above all, promises kept.`,
  notes: [
    'Oaths matter in Heathenry. A vow sworn in Týr’s name, or at a sumbel horn, is treated as binding on the one who swears it. This journey asks only for small, specific, keepable promises. Never swear rashly, and never swear while drunk.',
    'Devotion to Týr is strength for honest action; it never replaces legal advice, a lawyer or proper process. If you are in a legal dispute, get real help.',
    'The ᛏ (Tiwaz or Týr) rune was used in Nazi Germany, notably as the badge of SA leadership schools, and appears today in some white-supremacist iconography. It is also an ordinary letter of every runic alphabet and is used innocently by most Heathens and rune-workers. Know its history, use it with care in public, and never pair it with hate symbols.',
    'This app is inclusive. Týr, the god of fair law, is for everyone, of any ancestry, gender or orientation. Folkish groups that make the gods a matter of race are not the tradition taught here, and a god of justice is a poor fit for them.',
    'Týr’s story involves a wolf, and many devotees love wolves. Admire them from a distance and support conservation; do not buy wolf parts of unknown origin.',
    'Alcohol is traditional for blót and sumbel but never required. Apple juice, non-alcoholic beer or water are always acceptable.',
  ],
  holyDays: ['sigrblot', 'midsummer', 'vetrnaetur', 'jol'],
  stages: [
    {
      kind: 'threshold',
      title: 'The Pledge',
      intro:
        'Týr is known by one act: a hand given as a pledge. These first days are about making a place for him and making the smallest possible pledge, then keeping it.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'tyr-shrine',
          title: 'Set up a shrine',
          instructions: `Choose a plain, orderly place: a shelf at eye level, the corner of a desk where you deal with letters and bills, somewhere you will see each day. Lay down a red, white or grey cloth, or simply clean wood. Add a cup or horn and one candle in a holder.

For images: the ᛏ rune carved, burned or painted on a piece of wood or a flat stone; a sword or spear (a letter-opener, a small model, or a drawing is fine); a pair of scales; an empty glove for the hand; a wolf figure if you like. A plain ring or bracelet laid on the shrine will become your oath ring later in the journey.

Keep it tidy. Many devotees say a cluttered, neglected shrine to Týr is a broken promise in itself.`,
          times: 1,
          prompt: 'What on your shrine reminds you to keep your word?',
        },
        {
          id: 'tyr-one-promise',
          title: 'One small promise',
          instructions:
            'Each morning for three days, make one tiny, specific promise to yourself, out loud, at the shrine: “Today I will reply to that message,” “Today I will not say anything I know to be untrue.” In the evening, tell Týr honestly whether you kept it.',
          times: 3,
          every: 'day',
          prompt: 'What did you promise, and did you keep it? If not, what got in the way?',
        },
      ],
      rite: {
        title: 'Greeting the Wolf’s Pledge',
        summary:
          'A short first greeting: hallow the space, hail Týr with mead or ale, tell him plainly why you have come, make one small pledge, and pour his share.',
        minutes: 20,
        ingredients: [
          { name: 'A cup or horn of mead, ale or apple juice' },
          { name: 'A candle in a safe holder', ref: 'traditional/candle/red' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A piece of wood or stone marked with the ᛏ rune', optional: true },
          { name: 'A sprig of oak or a few oak leaves', ref: 'traditional/herb/oak', optional: true },
        ],
        preparation: 'Wash your hands. Tidy the shrine. Pour the drink. Decide beforehand on one small promise you can keep in the next week.',
        steps: [
          {
            title: 'Hallow the space',
            instructions:
              'Light the candle. Walk once sunwise (clockwise) around the room, or trace the ᛏ rune in the air before the shrine with your right hand.',
            spoken: 'I hallow this place. Let only true words be spoken here.',
            light: true,
          },
          {
            title: 'Hail him',
            instructions: 'Stand straight before the shrine and lift the cup with both hands.',
            spoken:
              'Týr, bravest of the gods, who laid your hand in the wolf’s mouth so the gods could be safe. God of the Thing, witness of oaths, keeper of fair dealing. I bring you mead. Hear me.',
          },
          {
            title: 'Say why you have come',
            instructions:
              'Tell him plainly, without decoration, why you are here: a need for courage, a sense of injustice, a wish to be more honest, a promise you have struggled to keep. Speak for a few minutes. Týr is said to prefer few words, truly meant.',
            minutes: 4,
          },
          {
            title: 'Make your pledge',
            instructions: 'Say your one small promise aloud, and when you will have kept it by.',
            spoken: 'Before Týr I pledge this, and I will keep it.',
          },
          {
            title: 'Share and pour',
            instructions: 'Drink one sip. Then pour the rest into the offering bowl.',
            spoken: 'Gift for gift. This is yours. Hail Týr!',
          },
          {
            title: 'Close',
            instructions:
              'Stand a moment in silence. Thank him. Snuff the candle. Later, pour the drink onto the earth outside, at the foot of a tree if you can, ideally an oak.',
            spoken: 'Thank you, Týr. I will come back with my pledge kept.',
            snuff: true,
          },
        ],
        closing: 'Write down your promise and its deadline. When you have kept it, write that too, and tell Týr at the shrine.',
        safety:
          'Never leave a candle burning unattended, and keep it away from wood and dry leaves on the shrine. If you use a real blade on the shrine, keep it sheathed and out of reach of children. Pour drink outside or down a drain, not into houseplants, and keep alcohol away from pets.',
      },
    },
    {
      kind: 'study',
      title: 'The Hand and the Name',
      intro:
        'Twelve days of reading: who Týr is in the sources, the binding of Fenrir and what it means, and the long trail of his name from the sky-god *Tīwaz to Tuesday.',
      days: 12,
      lessons: [
        {
          id: 'tyr-who',
          title: 'The Bravest of the Gods',
          summary: 'Týr as Snorri and the Eddic poems give him: his courage, his wisdom, his family, and the jokes told at his expense.',
          minutes: 6,
          sections: [
            {
              heading: 'Snorri’s portrait',
              body: `Snorri Sturluson, writing in Iceland in the 1220s, gives Týr a short, vivid entry in Gylfaginning. In Rasmus Anderson’s 1880 translation: “He is very daring and stout-hearted. He sways victory in war, wherefore warriors should call on him. There is a saw, that he who surpasses others in bravery, and never yields, is Tyr-strong. He is also so wise, that it is said of anyone who is specially intelligent, that he is Tyr-learned.”

So Týr is not just a fighter. He is brave and wise together, and his name became a byword for both. Snorri then tells the story of the wolf, and ends with a line that has puzzled readers for centuries: “From that time Tyr is one-handed, and he is now called a peacemaker among men.” The Old Norse has a dry joke in it, closer to “he is not called a reconciler of men.” A god who lost his hand in a broken promise does not easily make peace between people who distrust each other.`,
            },
            {
              heading: 'Two fathers',
              body: `Snorri calls Týr a son of Odin. The Eddic poem Hymiskviða, which is older, gives him a different family: the giant Hymir is his father, and his grandmother is a monstrous giantess with nine hundred heads, while his mother is kind and helps Thor and Týr hide from her husband. Týr goes with Thor to fetch Hymir’s great brewing cauldron so the gods can hold a feast, and tries twice to lift it, and fails.

The sources disagree, and both versions are honest witnesses to a god whose place in the family of the Æsir had shifted over time. Many modern devotees accept both: Týr as a god with giant kin, who chose the side of the gods and paid for it.`,
            },
            {
              heading: 'Loki’s insults',
              body: `In Lokasenna, Loki insults every god at a feast. Týr speaks up to defend Freyr, and Loki turns on him: “Be silent, Tyr! for between two men / Friendship thou ne’er couldst fashion; / Fain would I tell how Fenrir once / Thy right hand rent from thee.” Týr answers with dignity: “My hand do I lack, but Hrothvitnir thou, / And the loss brings longing to both; / Ill fares the wolf who shall ever await / In fetters the fall of the gods.” (Henry Adams Bellows’ 1923 translation, stanzas 38–39.)

Notice what Týr does not do. He does not deny the loss. He names the cost on both sides. Loki then claims to have fathered a son on Týr’s wife, about whom we know nothing else. The poem is meant to wound, but it also shows the god as the sources imagined him: plain-spoken, steady and unashamed of what he gave.`,
            },
            {
              heading: 'At the end',
              body: `At Ragnarök, Snorri says, Týr fights the hound Garmr, “the greatest plague,” and they kill each other. It is a strange fate for the god who bound the wolf, and some scholars think it once belonged to Fenrir rather than Garmr. Either way, the one-handed god goes to the last battle and does not come back.`,
            },
          ],
          knowAndDont: {
            known:
              'Snorri’s Gylfaginning (ch. 25, 35 and the Ragnarök chapters) gives Týr’s character, the binding of Fenrir and his death at Ragnarök. Hymiskviða makes him Hymir’s son; Lokasenna 37–40 gives his exchange with Loki. Týr’s name is used in kennings for other gods and for warriors.',
            unknown:
              'Why his parentage differs between sources is unknown. Snorri’s “peacemaker” line can be read straight or as a joke, and translators differ. Who Týr’s wife was, if the story is more than an insult, is not recorded anywhere.',
          },
          inPractice:
            'Modern Heathens often hail Týr as “Týr-strong” and “Týr-wise” in their toasts, and call on him for courage in hard conversations, in court, in medical procedures, and in standing up for someone else.',
          reflect: [
            'Týr is both brave and wise. Which of those do you need more of right now?',
            'Týr answers Loki by naming the cost honestly. Is there a loss in your life you have been avoiding naming?',
          ],
          further: [
            'Gylfaginning ch. 25 and 35 in Rasmus B. Anderson, The Younger Edda (1880), public domain.',
            'Lokasenna and Hymiskviða in Henry Adams Bellows, The Poetic Edda (1923), public domain.',
            'John Lindow, Norse Mythology: A Guide to the Gods, Heroes, Rituals, and Beliefs (2001), “Týr.”',
          ],
          library: ['traditional/deity/tyr', 'traditional/deity/loki', 'traditional/deity/thor'],
        },
        {
          id: 'tyr-wolf',
          title: 'The Binding of Fenrir',
          summary: 'Týr’s great myth told closely: the wolf, the fetter Gleipnir, the hand in the mouth, and what the story says about pledges, law and cost.',
          minutes: 7,
          sections: [
            {
              heading: 'The wolf in the gods’ house',
              body: `Fenrir is the son of Loki and the giantess Angrboða, brother of Hel and the Midgard Serpent. Prophecies said great harm would come from him, but the gods did not kill him. Instead they raised him in their own home, and, in Snorri’s words, “Tyr was the only one who had the courage to go to him and give him food.”

That detail is easy to skip. Týr is the one who feeds the wolf. Before he is the god who loses a hand, he is the god who looks after something dangerous that everyone else is afraid of.`,
            },
            {
              heading: 'Three fetters',
              body: `As Fenrir grew, the gods decided to bind him. Twice they made great iron chains, Lœðingr and Drómi, and challenged him to break them as a test of his strength. Twice he burst them. Then Odin sent to the dwarves, who made Gleipnir out of six things that do not exist: the sound of a cat’s footfall, the beard of a woman, the roots of a mountain, the sinews of a bear, the breath of a fish and the spittle of a bird. It was smooth and soft as silk ribbon.

Fenrir was suspicious. A ribbon that thin, offered by people who had already tried to chain him? He agreed, but on one condition. In Anderson’s translation: “let some one of you lay his hand in my mouth as a pledge that this is done without deceit. The one asa looked at the other, and thought there now was a choice of two evils, and no one would offer his hand, before Tyr held out his right hand and laid it in the wolf’s mouth.”`,
            },
            {
              heading: 'The cost',
              body: `Fenrir strained against the ribbon, and the harder he pulled, the tighter it held. “They all laughed except Tyr; he lost his hand.” The gods fixed the fetter to a rock deep in the earth and wedged a sword in the wolf’s jaws to keep them open. He lies there, howling, until Ragnarök.

There is no comfortable reading of this. The gods tricked the wolf, and Týr knew they would. His pledge was true in one sense, a real hand really given, and false in another, because the release it promised was never going to come. He paid for the lie with his own body, and he paid knowing what it would cost. Some readers see a god of law who accepts a terrible price to keep the community safe. Others see a god who knows that justice and fairness are not always the same thing, and carries the wound of that knowledge.`,
            },
            {
              heading: 'A pledge in the old world',
              body: `In the Norse world a pledge, a veð, was a real thing handed over as security for a promise, to be returned when the promise was fulfilled. Law, trade and peace-making all depended on such pledges and on the oaths that went with them. The wolf’s demand was entirely lawful.

The French scholar Georges Dumézil, in the mid-twentieth century, compared Týr to the Roman hero Mucius Scaevola, who burned off his right hand to convince an enemy king of Rome’s resolve, and argued that both preserve an old idea of a god of contract and sovereignty who guarantees the community by sacrifice. Many scholars find this too neat; it remains a stimulating idea, not an established fact.

For a devotee, the lesson is practical. Your word is a pledge. Give it as if it could cost you your hand.`,
            },
          ],
          knowAndDont: {
            known:
              'The full story is told by Snorri in Gylfaginning ch. 35 (Anderson’s numbering). The Eddic poems refer to it in Lokasenna 38–39 and elsewhere. The Old Norse legal concept of veð, pledge or security, is well attested in the law codes.',
            unknown:
              'Snorri is our only detailed source, and he may have elaborated it. Dumézil’s comparisons with Mucius Scaevola and the Indian god Mitra are influential but contested. We do not know whether the myth was ever recited in a rite.',
          },
          inPractice:
            'Some devotees keep an empty glove or a carved hand on Týr’s shrine, and touch it before making any promise. Others feed a dog or volunteer at an animal shelter in Týr’s honour, remembering that he was the one who fed the wolf.',
          reflect: [
            'Have you ever kept a promise that cost you more than you expected? Was it worth it?',
            'Týr fed the wolf before he bound it. What dangerous thing in your life needs care, not only control?',
          ],
          further: [
            'Gylfaginning ch. 35 in Anderson (1880).',
            'Georges Dumézil, Gods of the Ancient Northmen (1973), essays on Týr.',
            'Carolyne Larrington, The Norse Myths: A Guide to the Gods and Heroes (2017).',
          ],
          library: ['traditional/deity/tyr', 'traditional/deity/odin', 'traditional/deity/hel'],
        },
        {
          id: 'tyr-tiwaz',
          title: '*Tīwaz, Tuesday and the T-Rune',
          summary: 'How Týr was worshipped, from Roman altars to runic swords: the evidence of names, inscriptions, place names and the ᛏ rune.',
          minutes: 7,
          sections: [
            {
              heading: 'A god older than the Vikings',
              body: `Linguists reconstruct Týr’s Proto-Germanic name as *Tīwaz (the asterisk means a reconstructed word, not one found written down). It comes from the Indo-European *deiwos, “god, heavenly one,” and is related to Greek Zeus, Sanskrit Dyaus pitar, Latin deus and the first part of Iuppiter. That has led many scholars to suggest that *Tīwaz was once a chief sky-god of the Germanic peoples, later overshadowed by Odin. It is a reasonable theory, but the shift itself is not recorded anywhere.

In Old Norse týr also became a common noun meaning “god.” Odin is called Sigtýr, “victory-god,” and Hangatýr, “god of the hanged.” The plural tívar simply means “the gods.”`,
            },
            {
              heading: 'Mars of the Thing',
              body: `Roman writers translated Germanic gods into their own. Tacitus, around 98 CE, says the Germans honoured Mars with animal sacrifices; most scholars think this Mars was *Tīwaz. When the days of the week were named in the Germanic languages, the day of Mars, dies Martis, became Tīwesdæg in Old English and Týsdagr in Old Norse: our Tuesday.

The most striking evidence is a third-century altar found at Housesteads on Hadrian’s Wall, set up by Frisian soldiers from Twenthe serving in the Roman army. It is dedicated to Mars Thingsus and two goddesses called the Alaisiagae. Thingsus almost certainly means “of the Thing,” the assembly where free people met to make law and settle disputes. Here, eighteen centuries ago, is Týr as god of the assembly.`,
            },
            {
              heading: 'Places, urns and swords',
              body: `In Denmark, place names such as Tissø (“Týr’s lake”) and Tisvilde (“Týr’s spring”) probably preserve his name; Tissø was the site of a great Viking Age hall and cult place. Similar names are rarer in Norway and Sweden, which suggests his cult was strongest in the south.

The rune ᛏ, shaped like an upward arrow, is called Tiwaz in the older futhark and Týr in the younger. It was stamped or scratched on Anglo-Saxon cremation urns of the fifth and sixth centuries and appears on weapons and amulets. The Eddic poem Sigrdrífumál gives this advice: “Winning-runes learn, if thou longest to win, / And the runes on thy sword-hilt write; / Some on the furrow, and some on the flat, / And twice shalt thou call on Tyr.” (Bellows, stanza 6.)`,
            },
            {
              heading: 'The rune poems',
              body: `Three medieval rune poems give a verse for each rune. The Norwegian and Icelandic poems both call Týr the one-handed among the gods; the Icelandic adds that he is what the wolf left and a ruler of temples. The Old English poem, oddly, describes the rune as a star. In Bruce Dickins’ 1915 translation: it “is a (guiding) star; well does it keep faith with princes; it is ever on its course over the mists of night and never fails.”

Faithful, steady, never failing: whether or not the poet still thought of the god, that is a fair summary of what Týr asks of his devotees.`,
            },
          ],
          knowAndDont: {
            known:
              'The derivation of Týr from *Tīwaz and *deiwos is standard linguistics. Tuesday’s name, Tacitus, the Housesteads altar to Mars Thingsus, the runic urns, Sigrdrífumál 6 and the three rune poems are all real and dated sources.',
            unknown:
              'That *Tīwaz was once the chief Germanic god is a theory. The identification of Tacitus’ Mars with *Tīwaz is likely but not proven. The Danish place-name etymologies are probable, not certain. Why the Old English poem calls the rune a star is unknown; it may refer to the Pole Star or a constellation.',
          },
          inPractice:
            'Many Heathens carve or paint the ᛏ rune on a piece of oak as their first offering to Týr, and keep Tuesday as his day for a short offering or a moment of reflection on their promises.',
          reflect: [
            'Týr’s name once simply meant “god.” What does it mean to you that the god of law is so old?',
            'The Old English poem calls his rune a star that never fails. What in your life could others steer by?',
          ],
          further: [
            'Sigrdrífumál in Bellows (1923).',
            'Bruce Dickins, Runic and Heroic Poems of the Old Teutonic Peoples (1915), public domain.',
            'Rudolf Simek, A Dictionary of Northern Mythology (1993), “Týr” and “Mars Thingsus.”',
          ],
          library: ['traditional/deity/tyr', 'traditional/herb/oak', 'traditional/crystal/hematite'],
          premade: ['cosmic-tuesday-mars-courage'],
        },
      ],
      practices: [
        {
          id: 'tyr-truth',
          title: 'A day of plain truth',
          instructions:
            'Twice a week during this stage, choose one day to speak no untruths at all, not even the small social ones. Be kind about it; truth is not cruelty. In the evening, note where it was hard.',
          times: 4,
          every: 'week',
          prompt: 'Where was it hardest to be plainly truthful today, and how did you manage it kindly?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine Days at the Thing',
      intro:
        'The Thing was where people met to speak law and settle what was owed. In this stage you learn how oaths and sumbel work, Týr’s tides and offerings, and keep nine days of promises kept.',
      days: 9,
      lessons: [
        {
          id: 'tyr-oaths',
          title: 'The Thing, the Oath Ring and the Sumbel',
          summary: 'How law and oaths worked in the Norse world, what the old oath ring was, how a modern sumbel runs, and how to swear well.',
          minutes: 7,
          sections: [
            {
              heading: 'The Thing',
              body: `The Thing (þing) was the assembly of free people. Local Things met through the year; in Iceland the national Althing met each June at Þingvellir from about 930. The law was recited aloud by a lawspeaker, cases were heard, judgments given and feuds settled with payments. The place was sacred: the Thing was opened by marking out its bounds, and violence there was a serious crime.

Týr as Mars Thingsus belongs here, at the place where a community holds itself together by agreement. Many Heathens see his sphere as wider than courts: any fair process, any meeting where people decide things together and keep to what was decided.`,
            },
            {
              heading: 'Swearing on the ring',
              body: `Icelandic sources describe a large arm-ring, a baugr, kept in the temple and worn by the chieftain at gatherings, on which oaths were sworn. Eyrbyggja saga describes one on the altar of a temple; Landnámabók, the Book of Settlements, gives an oath formula in which a man swears on the ring and calls on “Freyr and Njörðr and the almighty god” to help him. Who the “almighty god” (hinn almáttki áss) was is debated: Thor, Odin, Týr, or a Christian addition.

There is no source that puts Týr’s name on the oath ring. But modern Heathens very often call on him to witness oaths, because he is the god whose own pledge is the most famous in the myths. A plain ring or bracelet kept on his shrine, used only for vows, is a widespread modern custom.`,
            },
            {
              heading: 'How a sumbel runs',
              body: `A sumbel is a ritual round of drinking and speaking, attested in Old English (symbel) and Norse (sumbl) sources, most vividly in Beowulf. The modern form, kept by most Heathen groups, usually goes like this. The hall is hallowed. A horn of mead or juice is carried round, often by a woman of the household, as Wealhþeow carries the cup in Beowulf. In the first round, each person hails a god. In the second, an ancestor or hero. In the third round and after, people may toast, boast of deeds done, or swear an oath of something they will do.

Words spoken over the horn go into the well of what has been, and those who drink after you share in them. That is why groups take sumbel oaths so seriously, and why a rash oath can be a burden on everyone present. Many groups have a person, sometimes called the thyle, whose job is to challenge a boast that seems untrue or an oath that seems unwise.`,
            },
            {
              heading: 'How to swear well',
              body: `Make oaths small, specific and time-limited: “I will visit my grandmother every week until midsummer,” not “I will always be a better person.” Write them down beforehand. Swear them sober. Do not swear anything on behalf of another person, and do not swear what depends on luck. If something truly outside your control makes an oath impossible, many Heathens hold that you go back before the god or the group, say so honestly and make what amends you can.

Remember the Hávamál: “Better no prayer than too big an offering, / By thy getting measure thy gift” (Bellows, stanza 146). The same holds for vows. A small oath kept is worth a great deal more to Týr than a grand one broken.`,
            },
          ],
          knowAndDont: {
            known:
              'The Thing and the Althing are thoroughly documented in law codes and sagas. Eyrbyggja saga and Landnámabók describe the temple ring and the oath formula. Sumbel is described in Beowulf and in Norse sources such as Heimskringla’s account of the Jómsvikings’ vows.',
            unknown:
              'No source names Týr as witness of oaths or links him to the oath ring; that is modern. The three-round sumbel is a modern structure drawn from several sources, not a recorded medieval order. The thyle’s role is reconstructed from the Old English þyle and Norse þulr.',
          },
          inPractice:
            'Many solitary Heathens hold a small sumbel at home at the holy tides: three toasts, to a god, to an ancestor, and a third for a boast or a modest oath, with Týr often hailed as witness.',
          reflect: [
            'What is the smallest oath you could swear and keep this month?',
            'What “Things” do you belong to: a workplace, a household, a community group? How fair are they, and what is your part in that?',
          ],
          further: [
            'Beowulf, trans. Francis B. Gummere (1910), public domain, for the hall and the cup.',
            'Paul Bauschatz, The Well and the Tree (1982), the source of much modern thinking about sumbel.',
            'The Troth, Our Troth, vol. 2, on sumbel and oaths.',
          ],
          library: ['traditional/deity/tyr', 'traditional/deity/freyr', 'traditional/tool/chalice'],
          premade: ['folk-havamal-reflection', 'folk-simple-blot'],
        },
        {
          id: 'tyr-days',
          title: 'Tuesday, the Tides and What Not to Do',
          summary: 'Týr’s days through the week and the year, his offerings and how to give them, his place in modern Heathenry, and the respectful use of his rune.',
          minutes: 6,
          sections: [
            {
              heading: 'His days',
              body: `Tuesday is Týr’s day, the only day in the calendar with a firm link to him. A short offering or a few minutes at his shrine each Tuesday is the simplest way to keep the relationship.

Through the year, Sigrblót, the first day of summer in the Icelandic calendar in late April, was a sacrifice “for victory” and suits him well. Midsummer was when the Althing met; many Heathens hail Týr at midsummer as god of the Thing, and some groups hold their own yearly business meetings then. Winter Nights and Yule are the great feasts of the year and the usual times for sumbel, and so for oaths.`,
            },
            {
              heading: 'What to offer',
              body: `Mead and ale are the standard drink offerings, as for most Norse gods. A carved or painted ᛏ rune on a piece of oak is a common first gift. Bread, meat and a portion of a feast are traditional for any blót.

The offerings devotees most associate with Týr are acts. A promise kept. An honest account of a mistake. Speaking up for someone treated unfairly. Serving on a jury, volunteering for a legal advice centre, mediating a dispute, paying a debt you have been putting off. The Hávamál’s rule holds: “gifts with gifts requite” (stanza 42). Týr gives courage and clarity; give him integrity in return.`,
            },
            {
              heading: 'How to offer',
              body: `Stand before the shrine, straight and plainly. Name him and what you bring, briefly. Drink a sip and pour the rest into the bowl, then onto the earth outside, ideally at the foot of an oak. If your offering is a deed, tell him what you did, simply, as if giving testimony.

Devotees widely say Týr dislikes flattery and long speeches. Say what is true and stop.`,
            },
            {
              heading: 'Týr in modern Heathenry, and his rune',
              body: `Týr is widely honoured in inclusive Heathenry, in Iceland’s Ásatrúarfélagið, The Troth and many kindreds, and is especially close to people who work in law, the military, policing, social work, advocacy and medicine: anyone who must act under rules and carry the cost of hard decisions. He is also a favourite of those who have lost a limb or live with disability; the one-handed god is a reminder that wholeness is not the measure of worth.

His rune needs care. The ᛏ was used in Nazi Germany, and some racist groups use it now. Most rune-workers and Heathens use it simply as a letter and a sign of the god, and this app does too. Wear or display it with awareness of its context, never alongside hate symbols, and be ready to explain what it means to you. Groups that use Týr as an emblem of racial struggle have misunderstood a god of fair law entirely.`,
            },
            {
              heading: 'What not to do',
              body: `Don’t swear in his name lightly, in anger or while drinking. Don’t ask him to punish someone; this journey has no curses, and justice is not revenge. Don’t use devotion to Týr in place of a lawyer, a union or proper process. Don’t lie at his shrine, even to yourself. And don’t keep a sharp blade on a shrine where children or pets can reach it.`,
            },
          ],
          knowAndDont: {
            known:
              'Tuesday is named for Týr. Sigrblót, Winter Nights and Yule are attested as seasonal sacrifices; the Althing met in June. Hávamál 42 gives the gift-for-gift principle. The Nazi use of the Tiwaz rune is documented, and it is listed in hate-symbol databases with the caution that most uses are innocent.',
            unknown:
              'No feast is recorded for Týr himself in the Viking Age, and his colours, stones and plants are modern associations. How widely he was worshipped in Scandinavia by the Viking Age is uncertain; the evidence suggests he had faded in the north.',
          },
          inPractice:
            'A common modern pattern: a small Tuesday offering with an honest review of the week’s promises; Týr hailed as witness at every sumbel; a carved ᛏ rune given at Sigrblót or midsummer; acts of fairness dedicated to him through the year.',
          reflect: [
            'Which of your weekly obligations could become a Tuesday offering to Týr if you did it well?',
            'How will you explain the ᛏ rune if someone asks you about it?',
          ],
          further: ['Hávamál in Bellows (1923).', 'Anti-Defamation League, Hate Symbols Database, entries on runes, for context.'],
          library: ['traditional/deity/tyr', 'traditional/candle/red', 'traditional/crystal/bloodstone', 'traditional/herb/nettle'],
          premade: ['kitchen-courage-brew', 'folk-simple-blot'],
        },
      ],
      practices: [
        {
          id: 'tyr-nine-days',
          title: 'Nine days of promises kept',
          instructions: `For nine days, at the shrine each morning, light the candle and make one small, specific promise for the day, touching the ring on the shrine as you say it. Pour a little mead or juice into the bowl.

Each evening, return, tell Týr plainly whether you kept it, and if not, why, and what you will do to make it right. Snuff the candle. Pour the drink outside.

On the ninth day, make one promise that will take longer, a week or a month, and write it down.`,
          times: 9,
          every: 'day',
          prompt: 'What did you promise today, and did you keep it?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Before the Lawspeaker',
      intro:
        'At the Thing, a case was weighed before judgment. Weigh your month the same way, honestly. Pausing, stopping, honouring Týr at Tuesday and at sumbel without a vow, or turning to another god are all good outcomes.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'tyr-reread',
          title: 'Read your record',
          instructions: 'Read everything you have written since the first rite, especially the record of promises kept and broken.',
          times: 1,
          prompt: 'What does your record of promises say about you this month? Be fair, not harsh.',
        },
      ],
      questions: [
        'How many of your small promises did you keep? What does that tell you about the size of vow you can carry?',
        'Did this feel like a relationship with Týr, or like self-improvement with a god attached? Both are honest.',
        'Are you drawn to justice, or to warrior imagery? Týr is far more the first than the second.',
        'How do you feel about the trickery in the binding of Fenrir?',
        'Is there any vow you are tempted to make that you are not ready to keep?',
        'If you stop here, what will you keep from this month?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The Oath on the Ring',
      intro: `If you have chosen to go on, this is the dedication: a blót and a vow, written in advance and sworn on a ring before Týr. It is a self-dedication between you and Týr. It is not an initiation into any group, and it does not replace a group’s own rites. Of all the journeys, this is the one where the vow matters most. Make it modest, specific and true.`,
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'tyr-write-vow',
          title: 'Write the vow',
          instructions:
            'A day before, write your vow: the offering you will keep (for example, mead and an honest account of your promises each Tuesday), the deed you will keep (for example, one act of fairness each month), how long (a year and a day is common), and what you ask (courage, clarity, steadiness). Read it aloud three times and cut anything you are not sure you can keep.',
          times: 1,
          prompt: 'Write the final vow here.',
        },
      ],
      rite: {
        title: 'Dedication to Týr',
        summary:
          'A blót of mead in which you hallow the space as a Thing, hail Týr, swear your written vow on a ring, and give him his share.',
        minutes: 40,
        ingredients: [
          { name: 'A horn or cup of mead (or apple juice or non-alcoholic beer)' },
          { name: 'A ring or bracelet to serve as your oath ring' },
          { name: 'A piece of oak or stone marked with the ᛏ rune' },
          { name: 'A candle in a safe holder', ref: 'traditional/candle/white' },
          { name: 'An offering bowl', ref: 'traditional/vessel/offering_bowl' },
          { name: 'A token: a hematite or bloodstone, or a small ᛏ pendant', ref: 'traditional/crystal/hematite', optional: true },
          { name: 'Your written vow' },
        ],
        preparation:
          'Clean the shrine and room. Lay the ring on the rune-stave. Set out the cup and the token. A Tuesday, Sigrblót, midsummer, or the day after your ninth day are good times. Be sober and rested.',
        steps: [
          {
            title: 'Hallow the Thing',
            instructions:
              'Light the candle. Walk sunwise around the room, and at each of the four sides say the words. This marks the space as a place of law, as the old Things were marked out.',
            spoken: 'Here is a holy place of law. Let no false word be spoken here, and no oath sworn lightly.',
            light: true,
          },
          {
            title: 'Hail him',
            instructions: 'Stand straight and raise the horn.',
            spoken:
              'Týr, bravest of the gods, Týr-strong and Týr-wise. You who fed the wolf when others were afraid, and laid your hand in his mouth as pledge. Mars of the Thing, god of fair law, steady star that never fails. I come to swear before you. Hear me and witness.',
          },
          {
            title: 'Share the horn',
            instructions: 'Drink one sip.',
            spoken: 'I drink with you, and my words go into the horn.',
          },
          {
            title: 'Swear on the ring',
            instructions:
              'Take up the ring in your right hand, or lay your right hand on it. Read your vow aloud, once, clearly and slowly. Then put on the ring, or set it back on the stave.',
            spoken: 'This I swear on the ring, before Týr. Let it hold as long as I keep it, and let me keep it.',
          },
          {
            title: 'Hallow the token',
            instructions:
              'Hold the token over the rune-stave, then pass it over the candle at a safe height. Wear or carry it, or keep it on the shrine.',
            spoken: 'Let this be a sign of my troth to Týr. When I see it, let me remember my word.',
          },
          {
            title: 'Pour his share',
            instructions: 'Pour the rest of the horn into the offering bowl.',
            spoken: 'Gift for gift. This is yours. Give me courage to keep faith, and to stand for what is fair.',
          },
          {
            title: 'Close',
            instructions:
              'Stand in silence for a minute. Thank him. Snuff the candle. Take the bowl outside and pour it onto the earth, at an oak if you can.',
            spoken: 'Hail Týr, and thanks. The oath is sworn.',
            snuff: true,
          },
        ],
        closing:
          'Write the date and your vow in your journal and keep the paper copy with the ring for your rededication. Keep the ring for oaths only, or wear it as a daily reminder.',
        safety:
          'Keep the candle away from the wooden stave and any cloth, and never leave it burning. If you use a real blade, keep it sheathed and away from children. Pour drink outside or down a drain, and keep alcohol away from pets.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping Faith',
      intro: `Keep the offering and the deeds you vowed. Give Týr a short offering each Tuesday, hail him at Sigrblót, at midsummer as god of the Thing, and at Winter Nights and Yule at sumbel. Each year, read your vow, give an honest account of how you kept it, and renew it.`,
      days: 365,
      lessons: [],
      practices: [
        {
          id: 'tyr-weekly',
          title: 'Tuesday reckoning',
          instructions:
            'Each Tuesday, light a candle at the shrine, pour a little mead or juice, and give Týr an honest account of your week’s promises: kept, broken, and what you will do about the broken ones.',
          times: 52,
          every: 'week',
          prompt: 'What did you keep this week, and what needs making right?',
          premade: 'cosmic-tuesday-mars-courage',
        },
        {
          id: 'tyr-tides',
          title: 'Keep the holy tides',
          instructions:
            'At Sigrblót, midsummer, Winter Nights and Yule, hold a blót or sumbel with Týr hailed. At Yule, swear one small oath for the year on your ring.',
          times: 4,
          every: 'holy-day',
          prompt: 'What did you offer at this tide, and what did you swear?',
          premade: 'folk-simple-blot',
        },
        {
          id: 'tyr-rededicate',
          title: 'Yearly rededication',
          instructions:
            'On the anniversary of your dedication, or at midsummer, repeat the rite. Read last year’s vow first and give an honest account of it before swearing the new one.',
          times: 1,
          prompt: 'How did last year’s vow go, and what will this year’s be?',
        },
      ],
    },
  ],
  sources: [
    'Rasmus B. Anderson, trans., The Younger Edda (1880), public domain: Gylfaginning ch. 25 (“He is very daring and stout-hearted…”, “he is now called a peacemaker among men”) and ch. 35 (“Tyr was the only one who had the courage…”, “let some one of you lay his hand in my mouth…”, “They all laughed except Tyr”), quoted from Project Gutenberg ebook #18947 (https://www.gutenberg.org/ebooks/18947).',
    'Henry Adams Bellows, trans., The Poetic Edda (1923), public domain: Lokasenna 38–39, Sigrdrífumál 6, Hávamál 42 and 146, quoted from Project Gutenberg ebook #73533 (https://www.gutenberg.org/ebooks/73533); Hymiskviða paraphrased.',
    'Bruce Dickins, trans., Runic and Heroic Poems of the Old Teutonic Peoples (1915), public domain: Old English Rune Poem, Tir stanza, quoted from Wikisource (https://en.wikisource.org/wiki/Runic_and_Heroic_Poems_of_the_Old_Teutonic_Peoples/The_Runic_Poems/The_Anglo-Saxon_Runic_Poem). Norwegian and Icelandic rune poems paraphrased.',
    'Tacitus, Germania 9; the Housesteads altar to Mars Thingsus (RIB 1593); Eyrbyggja saga and Landnámabók on the temple ring and oath formula; Beowulf: paraphrased.',
    'Scholarship: Georges Dumézil, Gods of the Ancient Northmen (1973); Rudolf Simek (1993); John Lindow (2001); Paul Bauschatz (1982). Anti-Defamation League, Hate Symbols Database, on the Tiwaz rune.',
  ],
};
