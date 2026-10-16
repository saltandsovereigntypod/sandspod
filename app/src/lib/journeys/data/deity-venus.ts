import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-venus',
  kind: 'deity',
  paths: ['roman'],
  deityRef: 'traditional/deity/venus',
  title: 'Venus, Mother of Rome',
  summary:
    'A month with Venus: the old Italian goddess of gardens and grace who became mother of Aeneas\'s people, her many temples from Erycina to Genetrix, the washing of her statue on 1 April, the Vinalia, and love honoured honestly.',
  welcome:
    'This journey runs about a lunar month. You will learn who Venus was before and after she met Aphrodite, the forms in which Rome built her temples, how women washed and dressed her image at the Veneralia and how working women honoured her at the Vinalia, and how people keep her today. There is a nine-night practice of beauty and kindness, an opening rite with myrtle and roses, and at the end a self-dedication.\n\nIt is a self-dedication, not an initiation, and it makes no one a priestess. Nothing here is love magic aimed at another person; Venus is approached for love that is freely given, for beauty, harmony and self-respect.',
  about:
    'Venus began as an Italian goddess, probably of gardens, growth and charm; her name is related to the Latin words for grace and favour (venia) and for worshipping (venerari). From the third century BC Romans identified her with the Greek Aphrodite, and above all with Aphrodite\'s Trojan son Aeneas, whose descendants founded Rome. So Venus became Aeneadum genetrix, mother of Aeneas\'s people, and the patron of Julius Caesar\'s family, who claimed descent from her. Rome built temples to her under many names: Venus Obsequens, the compliant; Erycina, from the mountain shrine of Eryx in Sicily; Verticordia, the turner of hearts; Victrix, the victorious; Genetrix, the mother. On 1 April women washed and adorned her statue; on the Vinalia of 23 April the women of the streets honoured her at her temple by the Colline Gate. Today Roman polytheists honour her with roses, myrtle, incense and wine, and many others know her as a goddess of love and self-worth.',
  notes: [
    'This journey uses the Roman form throughout: clean hands, head covered (capite velato), exact words read from a page, Janus first. It follows the common modern pattern of Janus first and Vesta last in prayer, with the first share of food set aside for Vesta. The ancient sources disagree on Vesta: Cicero says prayer ends with her, while Ovid (Fasti 6.303–304) says she is addressed first. Choose one and keep to it.',
    'No love spells that bend another person\'s will. Venus is asked for love freely given, for beauty and for harmony.',
    'Sex workers had their own honoured place in Venus\'s cult. The journey describes this honestly and without shame.',
    'Venus and Aphrodite overlap but are not identical. If you also honour Aphrodite in the Greek manner, keep the two settings distinct.',
    'Lilies are deadly to cats; use roses and myrtle for her flowers. Do not make Ovid\'s poppy drink from poppy heads. Essential oils and perfume can harm cats and birds.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'A fresh rose',
      intro:
        'Begin with something beautiful and freshly tended. Venus was a goddess of gardens before she was anything else. Put one fresh flower where you will see it every day, and then greet her in the Roman way.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'venus-flower',
          title: 'One fresh flower',
          instructions:
            'Put one fresh flower (a rose if you can) in a small vase where you will see it. On each of these two days, change its water and look at it properly for a minute.',
          times: 2,
          every: 'day',
          prompt: 'What did I notice about the flower, and about how I look at beautiful things?',
        },
      ],
      rite: {
        title: 'Greeting Venus',
        summary: 'Wash and veil, Janus first, a pink or green flame for Venus, an offering of roses, myrtle, incense and honey, and Vesta last.',
        minutes: 25,
        ingredients: [
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'A head covering' },
          { name: 'A pink or green candle in a stable holder', ref: 'traditional/candle/pink' },
          { name: 'Fresh roses or rose petals', ref: 'traditional/herb/rose' },
          { name: 'A sprig of myrtle, if you can find it (or another fresh green leaf)' },
          { name: 'A little honey on a clean dish', ref: 'traditional/vessel/dish' },
          { name: 'Frankincense and a burner', ref: 'traditional/herb/frankincense' },
          { name: 'A small mirror', optional: true },
          { name: 'Your words on a card' },
        ],
        preparation:
          'Clean a small space and lay a pretty cloth on it. Read the words through until you can say them smoothly: Roman prayer was read exactly, and if you stumble, you begin again. Put a drop of the honey on a separate saucer for Vesta, the first share of food.',
        steps: [
          {
            title: 'Wash and veil',
            instructions: 'Wash your hands in the clean water and dry them. Cover your head with a fold of cloth.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the incense and give a few grains to Janus.',
            spoken: 'Father Janus, opener of the way,\nbe honoured by this incense,\nand open the way to Venus.',
          },
          {
            title: 'Light her flame',
            instructions: 'Light the candle. Lay the roses and myrtle around it. Set the mirror, if you have one, facing the room.',
            spoken: 'Venus, mother of Aeneas\'s people,\ndelight of gods and mortals, kindly Venus,\nor by whatever name it pleases you to be called:\nI greet you with this light.',
            light: true,
          },
          {
            title: 'Offer',
            instructions: 'Give a few more grains of incense and set down the honey. Name each gift.',
            spoken: 'Venus, be honoured by these roses and this myrtle,\nby this incense and this honey.\nBe willing and favourable to me and my household.\nI have come to learn your ways.',
          },
          {
            title: 'Look',
            instructions: 'Sit for a few minutes. Look at the flowers, the light, and, if you like, your own face in the mirror, kindly.',
            minutes: 4,
            timed: true,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'A word or pinch of incense for Vesta. Turn to your right, uncover your head and put out the flame.',
            spoken: 'Vesta, last as always: be honoured.',
            snuff: true,
          },
        ],
        closing:
          'Leave the flowers on her shrine while they are fresh. Put the honey outside or in the compost the next day. When the flowers fade, return them to the soil and replace them.',
        safety:
          'Never leave the candle unattended; keep it away from petals, curtains and loose hair. Keep incense smoke away from birds and anyone with asthma. Do not use lilies anywhere a cat can reach them: all parts, even the pollen and vase water, can kill cats. Honey is not for infants under one.',
      },
    },
    {
      kind: 'study',
      title: 'Gardens, Troy and the turning of hearts',
      intro:
        'Five lessons, about two days each: who Venus is; her temples and names; the Veneralia and the Vinalia; how to honour her today, with her shrine; and the sensitive parts: love magic, sex work, chastity and bodies.',
      days: 11,
      lessons: [
        {
          id: 'venus-who',
          title: 'Who Venus is',
          summary: 'An Italian goddess of gardens and grace who became the mother of Rome.',
          minutes: 6,
          sections: [
            {
              heading: 'Before Aphrodite',
              body:
                'Venus was an Italian goddess before she was matched with the Greek Aphrodite. Roman antiquarians remembered her as a protector of gardens, and the oldest festival connected to her, the country Vinalia in August, belonged to vineyards and harvest. Her name is linked with the Latin word venia, the grace or favour that a god grants, and with venerari, to worship or ask favour: the same root that gives English "venerate". So the early Venus may have been less a goddess of sexual love than of charm, growth and the favour that makes things flourish.\n\nThat older layer is worth keeping. A Venus who tends gardens, gives grace and makes things grow is a goddess of beauty in a broad sense: the loveliness of a well-kept garden, a kind word, a family at peace.',
            },
            {
              heading: 'Mother of Aeneas\'s people',
              body:
                'In the third century BC, as Rome came into contact with the Greek world and fought for Sicily, Romans took up the legend that their founder Aeneas had come from Troy, and that his mother was Aphrodite. So Venus became the mother of the Roman people. The Epicurean poet Lucretius, around 55 BC, opens his great poem On the Nature of Things with her: "Aeneadum genetrix, hominum divomque voluptas, / alma Venus", "mother of Aeneas\'s people, delight of humans and of gods, nurturing Venus." He goes on to praise her as the power that fills sea and fruitful earth with life, through whom every living thing is conceived and sees the light of the sun.\n\nThe Julian family, Julius Caesar\'s, claimed descent from Aeneas\'s son Iulus and so from Venus herself. That made her, under Caesar and Augustus, a goddess of the ruling house.',
            },
            {
              heading: 'Greek myths in Roman dress',
              body:
                'With Aphrodite came her myths: born from the sea foam, married to the smith god (Vulcan in Rome), lover of Mars, mother of Cupid, the judgement of Paris. Lucretius pictures Mars lying in Venus\'s lap, conquered by love, and asks her to win peace for Rome. Apuleius, in the second century AD, tells the long tale of Cupid and Psyche, in which a jealous Venus sets Psyche impossible tasks before love wins. These stories are Greek or literary, but Romans loved them, and they belong to her too.',
            },
            {
              heading: 'Her signs',
              body:
                'Her plant above all is the myrtle, an evergreen shrub with white flowers and fragrant leaves. Her flower is the rose. Her birds are the dove, the swan and the sparrow. Her symbols are the scallop shell, the mirror and the apple. Her offerings were incense, flowers, wine, perfume and sweet things; at the Vinalia, Ovid lists mint with myrtle and rushes bound with roses. Her colours today are pink, green and white. Friday, dies Veneris (French vendredi), is hers in the later planetary week.',
            },
          ],
          knowAndDont: {
            known:
              'Lucretius 1.1–2 (verified in Latin) on Venus as mother of the Romans. Varro and Festus record her as a garden goddess; Varro links her with the country Vinalia of August (On the Latin Language 6.20), while insisting that the April Vinalia is Jupiter\'s day, not hers (6.16). The Trojan legend and the Julian claim are well attested.',
            unknown:
              'What the earliest Italian Venus was really like is reconstructed from scattered antiquarian notes; the venia etymology is likely but debated. How far ordinary Romans thought of her as the Greek Aphrodite or as their own goddess varied.',
          },
          inPractice:
            'Find out whether myrtle grows near you or can be bought as a pot plant. A small myrtle bush on a sunny windowsill is the best living shrine to Venus you can have.',
          reflect: [
            'What does "grace" mean to me, and where have I received it?',
            'Which Venus draws me: the garden goddess, the mother of Rome, or the goddess of love?',
          ],
          further: [
            'Lucretius, On the Nature of Things 1.1–43 (Latin at The Latin Library; public-domain translations by Munro and Leonard)',
            'Robert Schilling, La religion romaine de Vénus (1954; the classic study, in French)',
          ],
          library: ['traditional/deity/venus', 'traditional/deity/aphrodite', 'traditional/deity/mars', 'traditional/herb/rose'],
        },
        {
          id: 'venus-forms',
          title: 'Her temples and names',
          summary: 'Obsequens, Erycina, Verticordia, Victrix, Genetrix, Cloacina and Venus and Rome: what each name meant and when it came.',
          minutes: 7,
          sections: [
            {
              heading: 'Compliant and from Eryx',
              body:
                'Rome\'s first known temple of Venus was built in 295 BC by Quintus Fabius Gurges near the Circus Maximus, paid for with fines levied on married women convicted of adultery (Livy 10.31). She was called Venus Obsequens, "the compliant" or "indulgent", the goddess who grants favour.\n\nIn 217 BC, after the disaster at Lake Trasimene in the war with Hannibal, the Sibylline Books told the Romans to vow a temple to Venus Erycina, the goddess of the great shrine on Mount Eryx in western Sicily, a sanctuary the Romans had come to control (Livy 22.9–10). It was dedicated on the Capitol in 215. A second temple of Venus Erycina was built outside the Colline Gate and dedicated in 181 BC; this is the one Ovid sends the women of the streets to on the Vinalia.',
            },
            {
              heading: 'Turner of hearts',
              body:
                'Venus Verticordia, "she who turns hearts", was meant to turn women\'s hearts from lust to chastity. Valerius Maximus says a statue was dedicated to her by Sulpicia, chosen from all Roman matrons as the most chaste (8.15.12). A temple followed in 114 BC, after three Vestals were condemned for unchastity. Ovid writes of her: "templa iubet fieri Veneri: quibus ordine factis / inde Venus verso nomina corde tenet", "[the Sibyl] ordered a temple to be built to Venus; when it was duly done, Venus took her name from the turned heart" (Fasti 4.159–160). This is Venus as guardian of a married woman\'s good name: "sub illa / et forma et mores et bona fama manet", "under her, beauty, character and good reputation endure" (4.155–156).',
            },
            {
              heading: 'Victorious and mother',
              body:
                'Generals took her up. Sulla called himself Felix, lucky, and favoured Venus. Pompey built his great theatre in 55 BC with a temple of Venus Victrix, the victorious, at the top of its seats. Julius Caesar vowed a temple to Venus Genetrix, the mother, before the battle of Pharsalus and dedicated it in his new forum in 46 BC, on 26 September; her statue there stood as the ancestress of his family. In AD 135 Hadrian dedicated a vast double temple to Venus and Rome, Venus Felix and Roma Aeterna, back to back, and its feast was the city\'s birthday, 21 April.',
            },
            {
              heading: 'Cloacina and the myrtle',
              body:
                'In the Forum stood a small round shrine of Venus Cloacina, at the point where the great drain, the Cloaca Maxima, ran beneath. Pliny says that this was where the Romans and Sabines, after their war, purified themselves with myrtle branches (Natural History 15.119). Cloacina may first have been a separate goddess of cleansing, later merged with Venus. Either way, she is a reminder that Venus\'s myrtle purifies and reconciles: after the fight, the washing and the peace.',
            },
          ],
          knowAndDont: {
            known:
              'The temple foundations and dates come from Livy (10.31, 22.9–10, 23.31, 40.34), Valerius Maximus 8.15.12, Ovid, Fasti 4.155–162 (verified in Latin), and Pliny, Natural History 15.119–120. Remains of the temples of Venus Genetrix and of Venus and Rome stand in Rome today.',
            unknown:
              'Whether Cloacina was originally a separate goddess is debated. The exact date and circumstances of Sulpicia\'s dedication are uncertain. How the Roman Erycina related to the older Sicilian goddess of Eryx is not fully known.',
          },
          inPractice:
            'Choose the name under which you will most often call her: Venus Genetrix if you think of her as mother, Verticordia if you want help turning your heart, Victrix for courage, or simply Venus. Use it in your prayers this month.',
          reflect: [
            'Which of her names speaks to what I need right now?',
            'What does it mean that the goddess of love was also a goddess of victory and of reconciliation?',
          ],
          further: [
            'Livy 22.9–10 and 23.31 (public-domain translations on Gutenberg)',
            'Mary Beard, John North and Simon Price, Religions of Rome (1998)',
          ],
          library: ['traditional/deity/venus', 'traditional/herb/rose'],
        },
        {
          id: 'venus-days',
          title: 'The Veneralia and the Vinalia',
          summary: 'Washing the goddess on 1 April, the working women\'s day on 23 April, the country Vinalia, and how to keep them.',
          minutes: 7,
          sections: [
            {
              heading: 'Washing the goddess',
              body:
                'On the Kalends of April, Roman women honoured Venus (in Ovid, specifically Verticordia) together with Fortuna Virilis, the Fortune of men. Ovid gives instructions in the Fasti (4.133–162): "Rite deam colitis, Latiae matresque nurusque / et vos, quis vittae longaque vestis abest", "Worship the goddess duly, Latin mothers and brides, and you who do not wear the fillets and the long dress", that is, women who were not respectable matrons. "aurea marmoreo redimicula demite collo, / demite divitias: tota lavanda dea est", "take the golden necklaces from her marble neck, take off her riches: the goddess must be washed entire." Then dry her and put her necklaces back: "nunc alii flores, nunc nova danda rosa est", "now give her other flowers, now a new rose."\n\nThe women themselves bathed wreathed in myrtle, Ovid says, because Venus, drying her hair on the shore, hid from staring satyrs behind a myrtle bush. They gave incense to Fortuna Virilis in the men\'s baths, so that she would hide their bodies\' flaws from men. A calendar from Praeneste says that the women of lower rank bathed in the men\'s baths on this day.',
            },
            {
              heading: 'The working women\'s Vinalia',
              body:
                'On 23 April, the Vinalia, the new wine was opened and the first of it offered, Ovid says, to Jupiter. But the day also belonged to Venus Erycina outside the Colline Gate, and Ovid speaks to the women who worked the streets: "numina, volgares, Veneris celebrate, puellae: / multa professarum quaestibus apta Venus", "common girls, celebrate Venus\'s divinity: Venus suits the earnings of women who profess her trade" (4.865–866). "poscite ture dato formam populique favorem", "give incense and ask for beauty and the people\'s favour." And give the goddess her mint, with myrtle and rushes bound with roses (4.869–870).\n\nSex workers in Rome were legally and socially lowly, but they had a festival, a temple and a goddess who did not turn them away. That is part of Venus\'s story.',
            },
            {
              heading: 'The country Vinalia',
              body:
                'A second Vinalia, the Vinalia Rustica, fell on 19 August, before the grape harvest. Varro connects it with Venus, as goddess of gardens and vineyards, and with temples of Venus dedicated on that day. It is a day for gardens, for the vines and fruit about to ripen, and for asking for a good harvest.',
            },
            {
              heading: 'Keeping her days',
              body:
                'A modern Veneralia on 1 April: if you have an image of Venus, take off any jewellery, wash it gently in clean water, dry it, put the jewellery back, and give it fresh roses. Have a bath with a sprig of myrtle or rose petals in it (not floating candles in the bath). Give incense and ask for beauty, good character and a good name. A modern Vinalia on 23 April: open a new bottle of wine or juice and give the first pour; give Venus mint, myrtle and roses; honour or donate to a sex workers\' support group or a women\'s health service. On 19 August, tend your garden or houseplants and give her a fruit. On 26 September, Venus Genetrix, honour your own ancestors and the mothers of your line.',
            },
          ],
          knowAndDont: {
            known:
              'Ovid, Fasti 4.133–162 and 4.863–900 (verified in Latin) for the Veneralia and the Vinalia. The Praeneste calendar notes the bathing. Varro (On the Latin Language 6.20) ties the Vinalia Rustica to a temple of Venus and to gardens; in 6.16 he says the April Vinalia "is Jupiter\'s day, not Venus\'s", which shows Romans themselves argued about it. The Genetrix temple was dedicated on 26 September 46 BC.',
            unknown:
              'Ovid\'s poem mixes cults (Verticordia, Fortuna Virilis) and is not a ritual manual. The name "Veneralia" appears in only a few sources. Ovid\'s drink of poppy pounded with milk and honey is not recommended to recreate. Modern customs are modern.',
          },
          inPractice:
            'Put 1 April, 23 April, 19 August and 26 September in your calendar. If you have no image of Venus, a small mirror or a shell you wash for her serves well.',
          reflect: [
            'What would it mean to wash and adorn something, or someone, for love?',
            'How do I feel about Venus being a goddess both of respectable matrons and of sex workers?',
          ],
          further: [
            'Ovid, Fasti 4.133–164 and 4.863–900 (Latin at The Latin Library; Riley\'s 1851 prose translation)',
            'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (1981)',
          ],
          library: ['traditional/deity/venus', 'traditional/herb/rose', 'traditional/herb/mint'],
          premade: ['green-herbal-ritual-bath'],
        },
        {
          id: 'venus-today',
          title: 'Honouring Venus today',
          summary: 'The Roman manner, her offerings, beauty and kindness as devotion, the modern community, and her shrine.',
          minutes: 7,
          sections: [
            {
              heading: 'The Roman manner',
              body:
                'Venus is approached in the Roman way. Wash your hands, cover your head (capite velato) and give incense first to Janus. Call her by her name and title: Venus Genetrix, Venus Verticordia, or "Venus, mother of Aeneas\'s people". Add "or by whatever name it pleases you to be called." Name each gift. Ask her to be "willing and favourable" (volens propitia) to you and your household. Ask for what you want, plainly. Give with "be honoured by this" (macte esto). End with Vesta, turn to your right, and uncover.\n\nRead the prayer from a page, exactly, and begin again if you stumble; Pliny says this was the Roman custom. This journey follows the common modern pattern of Janus first and Vesta last in prayer, with the first share of food to Vesta. The ancient writers disagree, so choose and keep to it.',
            },
            {
              heading: 'What to give',
              body:
                'Roses, fresh or dried. Myrtle. Incense: frankincense was standard. Wine, especially at the Vinalia, or juice. Honey and sweet cakes. Perfume, a drop on a cloth or dish rather than burned. Mint, as Ovid says. A beautiful thing you made: a drawing, a poem, an embroidered cloth, a well-cooked meal.\n\nMany devotees also offer acts: mending a quarrel, writing a kind letter, tending a garden, taking care of their own bodies without contempt. Venus was a goddess of reconciliation as well as desire. Dedicate the act aloud: "Venus, this is for you."',
            },
            {
              heading: 'The community today',
              body:
                'Roman polytheists honour Venus in the reconstructed manner, often especially as Genetrix, mother of the Roman people. Many Hellenic polytheists honour Aphrodite, and some eclectic pagans and witches merge the two. Modern witchcraft often works with Venus as a planet of love and attraction, on Fridays, with pink candles and rose quartz. Each is real. If you are following the Roman way, keep it Roman, and label the rest.\n\nVenus is especially loved by queer communities, by people healing from body shame, and by artists. The app is inclusive: Venus\'s favour is for every kind of love that is freely given, and for every body.',
            },
            {
              heading: 'Setting up her shrine',
              body:
                'Choose a place that gets light, perhaps a dressing table or a windowsill. You need a pink, green or white candle in a stable holder, a small vase for fresh flowers, a dish for honey or sweets, and an incense burner. A small mirror, a scallop shell and an image of Venus or a dove are traditional. A potted myrtle beside it is ideal. Keep it lovely: change the flowers before they rot, dust it, and add beautiful things as you find them.',
            },
          ],
          knowAndDont: {
            known:
              'Incense, flowers, wine and sweet offerings for Venus are attested by Ovid and others; myrtle was her plant (Pliny, Natural History 15.119–120). The Roman prayer form is attested by Cato, Livy and Pliny.',
            unknown:
              'How private Romans prayed to Venus at home is barely recorded, though love poets like Tibullus and Propertius mention gifts at her altars. Planetary and crystal associations are modern or late-antique. Acts of kindness as offerings are a modern emphasis.',
          },
          inPractice:
            'Set up her shrine this week and write a short prayer to her in the Roman shape. Choose one act of reconciliation or kindness to offer her during the nine nights.',
          reflect: [
            'What beautiful thing could I make for her with my own hands?',
            'Is there a quarrel or coldness in my life that I could begin to mend?',
          ],
          further: [
            'John Scheid, An Introduction to Roman Religion (2003)',
            'Tibullus and Propertius, love elegies (public-domain translations on Gutenberg)',
          ],
          library: ['traditional/deity/venus', 'traditional/tool/altar', 'traditional/candle/pink', 'traditional/crystal/rose_quartz'],
          premade: ['cosmic-friday-venus-love', 'crystal-rose-quartz-self-love', 'kitchen-solitary-self-love-mirror'],
        },
        {
          id: 'venus-hard',
          title: 'Love, consent and bodies',
          summary: 'Love magic, the policing of women\'s chastity, sex work, beauty standards, and what not to do in her name.',
          minutes: 6,
          sections: [
            {
              heading: 'Love magic',
              body:
                'The ancient world was full of love spells. Papyri from Roman Egypt and lead tablets from across the empire record attempts to bind a person to the spell-maker, often with violent language. Venus herself was a goddess of a love that comes, as Lucretius says, as a power of nature, not of a will forced. Do not use her worship to try to make a particular person love you, stay with you or leave someone else. Ask instead to love and be loved well, to be the kind of person worth loving, and to recognise love when it comes.',
            },
            {
              heading: 'Turning women\'s hearts',
              body:
                'Venus Verticordia was founded to turn Roman women away from desire and toward wifely chastity, after Vestals were condemned. Venus Obsequens was paid for with fines on women convicted of adultery. Roman religion often policed women\'s bodies, and Venus\'s cult was part of that. A modern devotee can honour the good she stood for, a good name, faithful love, self-respect, without inheriting the shaming. Nobody should use her name to control anyone\'s body or sexuality.',
            },
            {
              heading: 'Sex work and honour',
              body:
                'At the same time, Venus\'s cult gave women who worked in the sex trade a festival and a temple of their own. Ovid speaks to them directly, and plainly expects them to pray for beauty, favour and earnings. Many modern devotees honour that by supporting sex workers\' health and safety without judgement. It is part of who she is: a goddess who did not turn people away for how they lived.',
            },
            {
              heading: 'Beauty without cruelty',
              body:
                'Venus is a goddess of beauty, and that can be twisted into contempt for bodies that do not fit a fashion. Roman women prayed, Ovid says, for Fortuna to hide their bodies\' flaws. You do not have to. Let her beauty be the beauty of things cared for: a garden tended, a face washed and rested, a room made pleasant, a body fed and moved and thanked.\n\nWhat not to do: no binding love spells, no curses on rivals, no using her shrine for self-hatred. No lilies where cats can reach. No poppy-head drinks. No perfume burned near birds. And if love has turned into fear or harm in your home, Venus would have you safe first: contact a domestic abuse service.',
            },
          ],
          knowAndDont: {
            known:
              'Ancient love spells survive in the Greek Magical Papyri and on curse tablets. Livy 10.31 on the fines that paid for Venus Obsequens; Valerius Maximus 8.15.12 and Ovid on Verticordia; Ovid, Fasti 4.865–870, on the working women at the Vinalia.',
            unknown:
              'How sex workers themselves felt about Venus Erycina, and what they did at her temple, is not recorded in their own words. How much Ovid\'s picture reflects real practice or his poetic wit is debated.',
          },
          inPractice:
            'Write down what you will ask Venus for and what you will not. Keep it on her shrine.',
          reflect: [
            'What is the difference, for me, between asking for love and trying to control it?',
            'What shame about my body or desire would I like Venus to help me put down?',
          ],
          further: [
            'Ovid, Fasti 4 (Latin at The Latin Library)',
            'Rebecca Flemming, "Quae corpore quaestum facit: The Sexual Economy of Female Prostitution in the Roman Empire", Journal of Roman Studies 89 (1999)',
          ],
          library: ['traditional/deity/venus', 'traditional/crystal/rose_quartz'],
        },
      ],
      practices: [
        {
          id: 'venus-fresh',
          title: 'Fresh flowers',
          instructions:
            'Through the study stage, keep fresh flowers on her shrine. Change the water every day and say "Venus, be honoured" as you do.',
          times: 11,
          every: 'day',
          prompt: 'Did I remember? What did I learn about Venus today?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights of beauty and kindness',
      intro:
        'Nine nights of tending something beautiful and doing one kind thing each day, offered to Venus. Roman religion knew nine-day rites (the novendiale), but this frame is a modern devotional form.',
      days: 9,
      lessons: [],
      practices: [
        {
          id: 'venus-nine-nights',
          title: 'Nightly offering',
          instructions:
            'Each day, do one deliberate kindness: to another person, to yourself, or to a living thing. On one of the days, take a step toward mending a quarrel or coldness, if it is safe to do so.\n\nEach evening: wash your hands and cover your head. Incense to Janus. Light Venus\'s candle and say your prayer to her. Offer a little honey, a petal or a drop of perfume on a cloth. Tell her what kindness you did. Sit for five minutes, looking at the flowers and the light. Name Vesta last, turn to your right, uncover and put out the flame.',
          times: 9,
          every: 'day',
          prompt: 'What kindness did I do today? What was beautiful?',
          premade: 'cosmic-friday-venus-love',
        },
        {
          id: 'venus-make',
          title: 'Make her something',
          instructions:
            'Once in the nine nights, make something beautiful for her with your hands: a drawing, a poem, a flower arrangement, a little embroidered cloth, a cake. Give it to her on her shrine.',
          times: 1,
          prompt: 'How did it feel to make something only for a goddess?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Is she your goddess?',
      intro:
        'A few days to weigh it honestly. Venus is warm and generous; she does not need you to hold on out of duty. Stopping, pausing, or choosing another goddess or path is a good outcome.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'venus-discern',
          title: 'Three evenings with her flowers',
          instructions: 'Light her candle and answer the questions below in your journal, a few each evening.',
          times: 3,
          every: 'day',
          prompt: 'What did nine nights of beauty and kindness change?',
        },
      ],
      questions: [
        'Am I drawn to Venus herself, or mainly to getting love from a particular person? Be honest.',
        'Which Venus is mine: the garden goddess, the mother of Rome, the goddess of love, or all of them?',
        'Can I keep a regular practice for a year: fresh flowers, monthly offerings, her days in April?',
        'How do I feel about the parts of her history that policed women, and the parts that welcomed sex workers?',
        'Does the formal Roman manner feel right to me, or would I rather honour Aphrodite in the Greek way, or both, separately?',
        'Would I rather keep loving her without a formal dedication? That is a fine choice.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication',
      intro:
        'If you go ahead, hold this on 1 April, 23 April, 26 September, a Friday, or a Kalends. It is a self-dedication, not an initiation, and makes no one a priestess. It takes the Roman shape of a vow (votum): you promise what you will do and fulfil it.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Venus',
        summary: 'A bath with myrtle or roses, Janus first, the washing and adorning of her image, a vow read exactly, offerings of roses, myrtle, mint, honey and wine, and Vesta last.',
        minutes: 50,
        ingredients: [
          { name: 'A bath or basin of warm water with rose petals or a sprig of myrtle', ref: 'traditional/herb/rose' },
          { name: 'A bowl of clean water and a soft cloth for washing her image', ref: 'traditional/vessel/bowl' },
          { name: 'An image of Venus, a small mirror or a scallop shell' },
          { name: 'A head covering' },
          { name: 'A new pink or white candle', ref: 'traditional/candle/pink' },
          { name: 'Fresh roses, myrtle and mint', ref: 'traditional/herb/mint' },
          { name: 'Honey or a sweet cake on a clean dish', ref: 'traditional/vessel/dish' },
          { name: 'A little wine or juice in a cup', ref: 'traditional/tool/chalice' },
          { name: 'Frankincense and a burner', ref: 'traditional/herb/frankincense' },
          { name: 'A necklace or ribbon for the image' },
          { name: 'Your vow, written out' },
        ],
        preparation:
          'Clean her shrine and make it lovely. Write your vow: your name; that you dedicate yourself to Venus (under the name you have chosen) as her devotee; for how long (a year is wise); and what you will do, such as fresh flowers, monthly offerings, keeping her April days, a named practice of kindness or reconciliation, and never using her name to bend another\'s will. Read it until it flows. Before the rite, bathe with the petals or myrtle, as Roman women bathed in myrtle for her. Set aside the first taste of the honey or cake for Vesta.',
        steps: [
          {
            title: 'Veil',
            instructions: 'Dressed in clean clothes after your bath, wash your hands and cover your head.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the incense and give a few grains to Janus.',
            spoken: 'Father Janus, first in every prayer,\nopen the way to Venus.',
          },
          {
            title: 'Wash the goddess',
            instructions: 'Take any ribbon or jewellery off her image. Wash it gently with clean water and the cloth, and dry it. Put the necklace or ribbon on, and lay new roses before it.',
            spoken: 'I wash you, Venus, as the women of Rome washed you,\nand give you a new rose.',
            minutes: 5,
          },
          {
            title: 'Light the new flame',
            instructions: 'Light the new candle.',
            spoken: 'Venus, mother of Aeneas\'s people,\ndelight of gods and mortals, kindly Venus,\nturner of hearts, giver of grace,\nor by whatever name it pleases you to be called:\nI come to give myself to you.',
            light: true,
          },
          {
            title: 'Read the vow',
            instructions: 'Read your vow aloud, exactly. If you stumble, stop and begin again from the beginning.',
            minutes: 5,
          },
          {
            title: 'Offer',
            instructions: 'Lay down the myrtle and mint with the roses. Set out the honey or cake and pour a little wine or juice. Name each gift.',
            spoken: 'Venus, be honoured by these roses, this myrtle and this mint,\nby this honey and this wine.\nBe willing and favourable to me and my household.\nAs I have vowed, so I will do.',
          },
          {
            title: 'Sit with her',
            instructions: 'Sit in silence for several minutes, looking at her image in the light.',
            minutes: 7,
            timed: true,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'A pinch of incense to Vesta. Turn to your right, uncover your head and put out the flame.',
            spoken: 'Vesta, last as always: be honoured.',
            snuff: true,
          },
        ],
        closing:
          'Leave the offerings overnight, then return the flowers to the soil and the honey or cake to the compost or the birds. Pour the wine onto soil. Keep your vow beside her image. Romans who fulfilled a vow set up an altar marked V.S.L.M., votum solvit libens merito, "paid the vow willingly, as was deserved"; at the end of your year, write those letters on your vow card and renew it, ideally on 1 April.',
        safety:
          'Never leave the candle unattended, and never put candles in or at the edge of the bath. Check the bath temperature and take care on wet floors. Keep incense smoke from birds and anyone with asthma. Do not use lilies anywhere a cat can reach. Wine and grapes are toxic to dogs and cats. Honey is not for infants under one.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping her garden',
      intro:
        'Her ongoing practice is fresh flowers, a monthly offering, her days in April, August and September, and kindness. Rededicate each year on 1 April.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'venus-friday',
          title: 'A weekly flower',
          instructions: 'Once a week, often on Friday, put fresh flowers on her shrine with a word of thanks, and do one kind thing in her name.',
          times: 52,
          every: 'week',
          prompt: 'What was beautiful this week?',
          premade: 'cosmic-friday-venus-love',
        },
        {
          id: 'venus-kalends',
          title: 'Kalends offering',
          instructions:
            'On the Kalends (the 1st) of each month: wash and veil, Janus first, light her candle, offer incense, honey and flowers, and read your prayer. Vesta last, turn right.',
          times: 12,
          every: 'month',
          prompt: 'Where did love and harmony grow this month?',
          premade: 'folk-lararium-offering',
        },
        {
          id: 'venus-year',
          title: 'Her yearly days',
          instructions:
            '1 April: wash and adorn her image, bathe with myrtle or roses, and rededicate. 23 April, the Vinalia: open new wine or juice, give her mint, myrtle and roses, and support a sex workers\' or women\'s health charity. 19 August: tend your garden and offer fruit. 26 September, Venus Genetrix: honour the mothers of your line.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did a year with Venus teach me about love?',
        },
      ],
    },
  ],
  sources: [
    'Lucretius, On the Nature of Things 1.1–2 (Latin, The Latin Library: https://www.thelatinlibrary.com/lucretius/lucretius1.shtml); translation original',
    'Ovid, Fasti 4.133–136, 4.138, 4.155–156, 4.159–160 and 4.865–870 (Latin, The Latin Library: https://www.thelatinlibrary.com/ovid/ovid.fasti4.shtml); translations original',
    'Ovid, Fasti 6.303–304, Vesta addressed first; Cicero, On the Nature of the Gods 2.67, Vesta last (paraphrased)',
    'Livy 10.31, 22.9–10, 23.31, 40.34; Valerius Maximus 8.15.12; Pliny, Natural History 15.119–120 and 28.10–11; Varro, On the Latin Language 6.16, 6.20 (paraphrased)',
    'Robert Schilling, La religion romaine de Vénus (1954)',
    'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (1981)',
    'Mary Beard, John North and Simon Price, Religions of Rome (1998)',
  ],
};
