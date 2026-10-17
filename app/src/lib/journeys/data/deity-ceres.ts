import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-ceres',
  kind: 'deity',
  paths: ['roman', 'wheel'],
  deityRef: 'traditional/deity/ceres',
  title: 'Ceres of the Grain',
  summary:
    'A month with Ceres, goddess of growing grain and of the common people\'s bread: her Aventine temple and the plebs, the Cerialia of 12–19 April, the search for Proserpina, Cato\'s harvest offering and the walking of the fields, and gratitude for food.',
  welcome:
    'This journey runs about a lunar month and happens mostly in your kitchen and, if you have one, your garden. You will learn who Ceres was, why her temple belonged to the plebs, the ordinary citizens of Rome, how the Cerialia was kept, how farmers offered to her before the harvest and walked their fields, and how people honour her today. There is a nine-day practice of bread and gratitude, an opening rite with spelt and salt, and at the end a self-dedication.\n\nIt is a self-dedication, not an initiation. It does not admit you to any mystery cult; the Greek mysteries of Demeter at Eleusis were secret and are lost, and the Roman women\'s rites of Ceres were closed to men and are barely known. What is open to everyone is what was open to every Roman farmer: grain, salt, a clean hearth and thanks.',
  about:
    'Ceres is the Roman goddess of grain and of growth itself; her name comes from an old root meaning "to grow", the same as in Latin creare and crescere, and it lives on in English "cereal". She is one of the oldest Italian deities, worshipped with Tellus, the Earth, at the sowing and before the harvest. In 493 BC Rome built a temple to Ceres with Liber and Libera on the Aventine, after a famine, and it became the religious centre of the plebs: their officials, the plebeian aediles, worked from it, their records were kept there, and it was a place of refuge. Her festival, the Cerialia, ran from 12 to 19 April with games in the Circus. Romans identified her with Demeter and told Demeter\'s story of her daughter Proserpina, carried off to the underworld. Today Roman polytheists honour her with spelt, salt, milk, honey and incense, and many pagans thank her at the harvest. The heart of her worship has always been gratitude for food and respect for those who grow it.',
  notes: [
    'This journey uses the Roman form throughout: clean hands, head covered (capite velato), exact words read from a page, Janus first. It follows the common modern pattern of Janus first and Vesta last in prayer, with the first share of food set aside for Vesta. The ancient sources disagree on Vesta: Cicero says prayer ends with her, while Ovid (Fasti 6.303–304) says she is addressed first. Cato\'s own harvest rite for Ceres begins with Janus, Jupiter and Juno and gives Ceres her portion last.',
    'Ceres\'s ancient offerings included pigs, and the Cerialia included releasing foxes with burning torches tied to them. Both are described honestly as history. Modern offerings are grain, salt, milk, honey, wine and incense.',
    'The story of Proserpina is an abduction. The journey tells it plainly and with care.',
    'The Eleusinian Mysteries and the Roman women\'s rite of Ceres were secret. Nothing here claims to restore them.',
    'Spelt and bread contain gluten. Poppy seeds in baking are fine, but do not make drinks or infusions from poppy heads.',
  ],
  holyDays: [],
  stages: [
    {
      kind: 'threshold',
      title: 'The first slice',
      intro:
        'Begin with bread. Ceres was the goddess who, the Romans said, first taught people to eat grain instead of acorns. Buy or bake a simple loaf, and before eating any of it, greet her in the Roman way.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'ceres-hands',
          title: 'Count the hands',
          instructions:
            'On each of these two days, before your main meal, pause and name, aloud or silently, the people whose work brought one food to your plate: the grower, the harvester, the miller, the driver, the shop worker, the cook.',
          times: 2,
          every: 'day',
          prompt: 'Whose work fed me today? What do I usually not notice?',
        },
      ],
      rite: {
        title: 'Greeting Ceres',
        summary: 'Wash and veil, Janus first, a gold or green flame for Ceres, spelt and salt, the first slice of bread, and Vesta last.',
        minutes: 25,
        ingredients: [
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'A head covering' },
          { name: 'A gold, green or white candle in a stable holder', ref: 'traditional/candle/gold' },
          { name: 'A loaf of bread, ideally spelt or wholemeal' },
          { name: 'A small dish of spelt grains or flour with a pinch of salt (a simple mola salsa)', ref: 'traditional/vessel/dish' },
          { name: 'Frankincense and a burner', ref: 'traditional/herb/frankincense' },
          { name: 'A few ears of wheat, or a sprig of mint', ref: 'traditional/herb/mint', optional: true },
          { name: 'Your words on a card' },
        ],
        preparation:
          'Clean your kitchen table or a shelf near the kitchen. Read the words through until you can say them smoothly: Roman prayers were read exactly, and if you trip, begin again. Cut the first slice of bread and break it in two: a crumb for Vesta on her own saucer (the first share of food), and the rest for Ceres.',
        steps: [
          {
            title: 'Wash and veil',
            instructions: 'Wash your hands and dry them. Cover your head with a fold of cloth.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the incense and give a few grains to Janus, as Cato\'s farmer did before offering to Ceres.',
            spoken: 'Father Janus, opener of the way,\nbe honoured by this incense,\nand open the way to Ceres.',
          },
          {
            title: 'Light her flame',
            instructions: 'Light the candle. Lay the wheat or mint beside it.',
            spoken: 'Ceres, good Ceres, mother of the grain,\nwho first gave people bread instead of acorns,\nor by whatever name it pleases you to be called:\nI greet you with this light.',
            light: true,
          },
          {
            title: 'Offer',
            instructions: 'Sprinkle a pinch of the salted spelt on the dish. Set the first slice of bread beside it. Ovid says small gifts please good Ceres, as long as they are clean.',
            spoken: 'Ceres, be honoured by this spelt and salt,\nby this first bread.\nBe willing and favourable to me and my household.\nI have come to learn your ways.',
          },
          {
            title: 'Thanks',
            instructions: 'Name aloud the people whose work brought you this loaf. Sit for a minute or two.',
            minutes: 3,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'A word or pinch of incense for Vesta. Turn to your right, uncover your head and put out the flame.',
            spoken: 'Vesta, last as always: be honoured.',
            snuff: true,
          },
        ],
        closing:
          'Eat the rest of the bread with gratitude and waste none of it. The next day, give Ceres\'s slice and Vesta\'s crumb to the birds or the compost, and sprinkle the spelt outdoors.',
        safety:
          'Never leave the candle unattended; keep it away from tea towels and flour (flour dust can flare). Keep incense smoke away from birds and anyone with asthma. Salt is harmful to pets in quantity; do not leave salted offerings within their reach. Bread for birds should be a small amount, not mouldy.',
      },
    },
    {
      kind: 'study',
      title: 'Grain, law and the lost daughter',
      intro:
        'Five lessons, about two days each: who Ceres is; her temple and the plebs; the Cerialia and Proserpina; the farmer\'s rites, from Cato\'s harvest offering to the walking of the fields; and honouring her today, with her shrine and the hard parts.',
      days: 11,
      lessons: [
        {
          id: 'ceres-who',
          title: 'Who Ceres is',
          summary: 'The goddess of growth, her partner Tellus, and how she came to be matched with Demeter.',
          minutes: 6,
          sections: [
            {
              heading: 'The power that makes things grow',
              body:
                'Ceres\'s name comes from an ancient root meaning to grow or to make grow, which also gives Latin crescere, "to grow", and creare, "to create". She is the power in a seed that makes it sprout and in a field that makes it ripen. She is very old: her name appears in an early inscription from Falerii, north of Rome, and she had a priest of her own, the flamen Cerialis, one of the minor flamens of Rome\'s oldest priesthoods.\n\nThe Romans also thought of her as the bringer of civilised life. Ovid says that people first lived on grass and then on acorns, until "prima Ceres homine ad meliora alimenta vocato / mutavit glandes utiliore cibo", "Ceres first called humankind to better food and changed acorns for a more useful diet" (Fasti 4.401–402). She taught oxen to bear the yoke and the soil to see the sun. Bread, for the Romans, was the sign of a settled, decent life.',
            },
            {
              heading: 'Ceres and Earth',
              body:
                'Ceres worked with Tellus, the Earth. At the Sementivae, the sowing festival in January, Ovid says: "placentur frugum matres, Tellusque Ceresque, / farre suo gravidae visceribusque suis", "let the mothers of the crops be appeased, Earth and Ceres, with their own spelt and the flesh of a pregnant sow." And he explains their partnership in one line: "haec praebet causam frugibus, illa locum", "one gives the crops their cause, the other their place" (Fasti 1.671–674). Ceres is the growth; Tellus is the ground.\n\nThe flamen Cerialis, according to a fragment of the early historian Fabius Pictor preserved by Servius, called on twelve helper gods at the sacrifice to Ceres and Tellus, one for each stage of farming: the first ploughing, the second ploughing, the furrowing, the sowing, the ploughing-in of the seed, the harrowing, the hoeing, the weeding, the reaping, the carrying, the storing and the bringing out. It shows a goddess present at every step of the year\'s work.',
            },
            {
              heading: 'Ceres and Demeter',
              body:
                'From early times Romans identified Ceres with the Greek Demeter, and took over Demeter\'s great myth: the carrying-off of her daughter Persephone, in Latin Proserpina, to the underworld. They also brought a Greek women\'s rite of Ceres to Rome, led by priestesses recruited from the Greek cities of southern Italy. So the Roman Ceres has two layers: the old Italian grain goddess of the farm, and the grieving Greek mother. Both are real, and they fit well.',
            },
            {
              heading: 'Her signs',
              body:
                'Her symbols are ears of wheat, the sheaf, the torch, the sickle and the basket of grain; later, the cornucopia. Her crown is woven of wheat. Her animal of sacrifice was the pig, especially the sow, and the snake drew her chariot. Her plant besides grain is the poppy, which grows in cornfields. Her colour is white, Ovid says: wear white for the Cerialia. Her offerings were spelt, salt, incense, honey, milk and wine.',
            },
          ],
          knowAndDont: {
            known:
              'Ovid, Fasti 4.401–402 and 1.671–674 (verified in Latin). The flamen Cerialis and the twelve helper gods are recorded by Servius on Georgics 1.21, citing Fabius Pictor. The etymology of her name is widely accepted.',
            unknown:
              'What the earliest Italian Ceres was like before Greek influence is reconstructed from scraps. The exact names and roles of the twelve helper gods are known only from that one late source. How ordinary farmers understood her relation to Tellus varied.',
          },
          inPractice:
            'Buy a small bag of spelt grain or spelt flour. It is the grain the Romans offered, and you will use it throughout this journey.',
          reflect: [
            'What in my own life is growing, and what does it need from me?',
            'What does it mean that the Romans saw bread as the beginning of civilised life?',
          ],
          further: [
            'Ovid, Fasti 1.657–704 and 4.393–620 (Latin at The Latin Library; Riley\'s 1851 prose translation)',
            'Barbette Stanley Spaeth, The Roman Goddess Ceres (1996)',
          ],
          library: ['traditional/deity/ceres', 'traditional/deity/demeter'],
        },
        {
          id: 'ceres-plebs',
          title: 'The temple of the plebs',
          summary: 'The Aventine temple of Ceres, Liber and Libera, the plebeian aediles, refuge and grain, and the women\'s rite.',
          minutes: 7,
          sections: [
            {
              heading: 'A temple after famine',
              body:
                'In 496 BC, the historian Dionysius of Halicarnassus says, Rome was at war and threatened with famine. The dictator Aulus Postumius consulted the Sibylline Books and vowed a temple to Ceres, Liber and Libera, a triad of grain and wine and growth. It was dedicated in 493 BC on the lower slope of the Aventine, near the Circus Maximus, decorated by Greek artists. The Aventine was the hill of the plebs, the ordinary citizens as opposed to the old patrician families, and the temple became theirs.',
            },
            {
              heading: 'Law, records and refuge',
              body:
                'The plebeian aediles, officials elected by the plebs, had their headquarters at the temple, and their very name may come from the aedes, the temple building. Livy says that a law protecting the plebs\' tribunes and aediles made anyone who harmed them forfeit his head to Jupiter, while "familia ad aedem Cereris Liberi Liberaeque venum iret", "his household property was to be sold at the temple of Ceres, Liber and Libera" (3.55). Another law ordered that decrees of the senate be delivered to the aediles at the temple of Ceres, because the consuls had been suppressing or altering them. Ceres\'s temple was where the common people kept their copies, so nobody could change the rules behind their backs.\n\nIt was also a place of asylum, and the aediles ran the grain supply and distributions to the poor from there. Ceres was the goddess of the people\'s right to be fed and to be treated fairly.',
            },
            {
              heading: 'The women\'s rite',
              body:
                'Rome also adopted a Greek rite, the sacrum anniversarium Cereris, an annual festival held by married women in summer. Cicero says its priestesses were brought from the Greek cities of Naples or Velia (Pro Balbo 55). The women abstained from sex and certain foods for nine days beforehand (Ovid mentions this "castus Cereris" in his poems), dressed in white, and celebrated Ceres\'s reunion with her daughter. Men were excluded. Almost nothing about the inner rite is known, and that is as it should be: it was not ours to know.',
            },
            {
              heading: 'What this means for devotion',
              body:
                'Ceres\'s Roman cult tells you what she cares about: food for everyone, honest records, the protection of ordinary people against the powerful, and the mother\'s love for a lost child. Modern devotees often honour her by supporting food banks, community gardens, farm workers\' rights and fair pay in the food industry. These are not modern inventions laid on her; they are her Aventine work in a new form.',
            },
          ],
          knowAndDont: {
            known:
              'Livy 3.55 (verified in Latin) on the property sold at the temple and the senate decrees delivered there. Dionysius of Halicarnassus 6.17 and 6.94 on the vow and dedication. Cicero, Pro Balbo 55, on the Greek priestesses (paraphrased).',
            unknown:
              'The details of the asylum, of how the grain distributions worked in early times, and of the women\'s rite are poorly known. Whether "aedile" really comes from Ceres\'s aedes is plausible but not certain.',
          },
          inPractice:
            'Choose one food-justice cause, a food bank, a community garden or a farm workers\' organisation, that you will support in Ceres\'s name during this journey.',
          reflect: [
            'Who in my community is not fed, or not treated fairly, and what could I do?',
            'Why might the goddess of grain also be the goddess who kept the people\'s laws safe?',
          ],
          further: [
            'Livy 3.55 (public-domain translations on Gutenberg)',
            'Barbette Stanley Spaeth, The Roman Goddess Ceres (1996), chapters on the plebs and on women',
          ],
          library: ['traditional/deity/ceres'],
          premade: ['kitchen-family-meal-blessing'],
        },
        {
          id: 'ceres-cerialia',
          title: 'The Cerialia and Proserpina',
          summary: 'The April festival, white clothes, small clean gifts, the torches of the search, the foxes, and how to keep 12–19 April.',
          minutes: 8,
          sections: [
            {
              heading: 'The games of Ceres',
              body:
                'The Cerialia ran from 12 to 19 April, with games (ludi Ceriales) organised by the plebeian aediles, chariot racing in the Circus Maximus, and the main festival on the 19th. Ovid begins: "Hinc Cereris ludi: non est opus indice causae; / sponte deae munus promeritumque patet", "Next come Ceres\'s games: no need to tell the reason; the goddess\'s gift and what she deserves are plain to see" (Fasti 4.393–394).\n\nHe tells farmers what to give: "farra deae micaeque licet salientis honorem / detis et in veteres turea grana focos; / et, si tura aberunt, unctas accendite taedas: / parva bonae Cereri, sint modo casta, placent", "you may give the goddess spelt and the honour of leaping salt, and grains of incense on the old hearths; and if there is no incense, light oily pine torches: small things please good Ceres, so long as they are clean" (4.409–412). That is one of the most useful lines in Roman religion for a modern devotee.',
            },
            {
              heading: 'White for Ceres',
              body:
                'At the end of his long story of Proserpina, Ovid says: "alba decent Cererem: vestes Cerialibus albas / sumite; nunc pulli velleris usus abest", "white suits Ceres: put on white clothes for the Cerialia; dark wool has no use now" (4.619–620). The Romans associated white with Ceres, and with the joy of her daughter\'s return.',
            },
            {
              heading: 'The search with torches',
              body:
                'Ovid tells the Proserpina story at the Cerialia (4.417–620). The girl is gathering flowers in Sicily when Dis, god of the dead, sees her and carries her off. Ceres searches everywhere. She lights two pine torches at the fires of Etna, "hinc Cereris sacris nunc quoque taeda datur", "and that is why a torch is still given at Ceres\'s rites" (4.494). In her grief the fields fail. In the end Jupiter rules that Proserpina, who has eaten pomegranate seeds below, will spend part of each year with her mother and part with her husband, and Ceres lets the crops grow again.\n\nThe story is an abduction and a forced marriage, arranged without the girl\'s or her mother\'s consent. Read it as Romans did, as an explanation of the seasons and of a mother\'s grief, and also as what it is. Many modern devotees honour Ceres as a mother who would not stop searching, and Proserpina as a survivor who became a queen.',
            },
            {
              heading: 'The foxes, and a modern Cerialia',
              body:
                'On 19 April, Ovid says, foxes were let loose in the Circus with burning torches tied to their backs (4.681–712). He gives a local tale: a boy at Carseoli once set fire to a fox caught stealing hens, it ran through the ripe fields and burned the harvest, so foxes are punished at Ceres\'s festival. It was a cruel rite, and it is part of the history; it is not something any modern devotee does.\n\nA modern Cerialia: wear white on the 19th, or through the week. Bake bread or spelt cakes. Give Ceres spelt, salt and incense, or a candle in place of a pine torch, with clean hands. Light a candle for Proserpina, and for any lost or missing child. Give to a food bank. Eat a meal with others and waste nothing.',
            },
          ],
          knowAndDont: {
            known:
              'Ovid, Fasti 4.393–394, 4.401–412, 4.494, 4.619–620 and 4.681–712 (verified in Latin). The dates and the games appear in Roman calendars and in Livy.',
            unknown:
              'Ovid\'s Proserpina is a literary retelling of the Greek myth, not a record of Roman ritual. The meaning of the fox rite is unclear, and Ovid\'s explanation is a local story. Which day-by-day rites filled 12–18 April is not well recorded.',
          },
          inPractice:
            'Put 12–19 April in your calendar, with the 19th marked. Find something white to wear for her festival.',
          reflect: [
            'What have I searched for with a torch? What did I lose, and what came back?',
            'How do I hold Proserpina\'s story: as a seasonal myth, as an abduction, or both?',
          ],
          further: [
            'Ovid, Fasti 4.393–620 and 4.679–712 (Latin at The Latin Library; Riley\'s 1851 prose translation)',
            'The Homeric Hymn to Demeter (public-domain translation by Evelyn-White, 1914)',
          ],
          library: ['traditional/deity/ceres', 'traditional/deity/demeter', 'traditional/candle/white'],
          premade: ['kitchen-prosperity-bread'],
        },
        {
          id: 'ceres-fields',
          title: 'Before the harvest: Cato, Vergil and the fields',
          summary: 'The pig before the harvest with Janus first, the spring rite in Vergil, the walking of the fields, and how to keep them in a flat or garden.',
          minutes: 8,
          sections: [
            {
              heading: 'Cato\'s harvest offering',
              body:
                'Cato\'s handbook gives the rite a farmer performed before reaping: "Priusquam messim facies, porcam praecidaneam hoc modo fieri oportet", "before you reap, the preliminary sow should be offered in this way" (On Agriculture 134). It was for Ceres, before the spelt, wheat, barley, beans and rape seed were brought in.\n\nBut Ceres is not addressed first. "Ture vino Iano Iovi Iunoni praefato", "address Janus, Jupiter and Juno first with incense and wine." The farmer offers Janus a heap of cakes with the words: "Iane pater, te hac strue commovenda bonas preces precor, uti sies volens propitius mihi liberisque meis domo familiaeque meae", "Father Janus, in offering you this heap of cakes I pray good prayers, that you may be willing and favourable to me and my children, my house and my household." Jupiter receives a cake, then both receive wine. Only after the sow is offered do they receive again, and "postea Cereri exta et vinum dato", "afterwards give Ceres the entrails and wine." Janus first, the goddess of the harvest at the end: it is the Roman order, in a farmer\'s own words.',
            },
            {
              heading: 'Vergil\'s spring rite',
              body:
                'Vergil, in the first book of the Georgics, tells the farmer: "in primis venerare deos, atque annua magnae / sacra refer Cereri laetis operatus in herbis", "above all, worship the gods, and renew the yearly rites to great Ceres, working on the happy grass", at the end of winter in clear spring (1.338–340). "cuncta tibi Cererem pubes agrestis adoret: / cui tu lacte favos et miti dilue Baccho", "let all your country youth worship Ceres with you; for her, dissolve honeycomb in milk and mild wine" (1.343–344). "terque novas circum felix eat hostia fruges", "and three times let the lucky victim go around the new crops" (1.345), with everyone following, calling Ceres into the house. And nobody should put a sickle to the ripe grain until he has wreathed his head with oak and danced and sung for Ceres (1.347–350).',
            },
            {
              heading: 'Walking the fields',
              body:
                'Leading an offering three times around the fields was a lustration, a purification of the land. Later writers call the public version the Ambarvalia, "going around the fields", usually placed in late May, though the date and details are uncertain and may have varied from place to place. Cato\'s own lustration prayer of this kind is addressed to Mars; Vergil\'s is to Ceres; the Arval Brothers prayed to a goddess called Dea Dia. The common shape is clear: walk the boundary of the growing land, three times, with offerings and prayer, to keep harm out and growth in.',
            },
            {
              heading: 'In a flat or a garden',
              body:
                'If you have a garden, allotment or even a few pots: in spring, walk around them three times carrying a dish of milk and honey (with a little wine if you like), and ask Ceres to keep blight and storms away and let them grow. Pour the milk and honey at the edge. Before you harvest anything, even herbs from a windowsill, give Janus a word first, then thank Ceres with a pinch of spelt.\n\nIf you have no growing space, walk around your kitchen or your table three times carrying a bowl of grain, and ask Ceres to keep your household fed. Then give to a food bank, so that the field you are guarding is a bit bigger than your own.',
            },
          ],
          knowAndDont: {
            known:
              'Cato, On Agriculture 134 (verified in the Latin Library text) for the porca praecidanea with Janus, Jupiter and Juno first. Vergil, Georgics 1.338–350 (verified in Latin) for the spring rite. The term Ambarvalia appears in Festus and Servius.',
            unknown:
              'Whether "Ambarvalia" was one public festival, a family rite, or both, and on what date, is uncertain; late May is a modern convention based on scattered evidence. Which deities were addressed varied. Household versions here are modern adaptations without animals.',
          },
          inPractice:
            'Write your own pre-harvest prayer on Cato\'s model, starting with Janus. Use it before you harvest anything this year, even a sprig of mint from a pot.',
          reflect: [
            'What is the "field" I want to guard this year: a garden, a household, a project, a community?',
            'Why do I think the Romans kept Ceres for last in Cato\'s rite?',
          ],
          further: [
            'Cato, On Agriculture 134 (Latin at The Latin Library; Loeb translation on LacusCurtius)',
            'Vergil, Georgics 1 (Latin at The Latin Library; public-domain translations by Dryden and by Greenough)',
          ],
          library: ['traditional/deity/ceres', 'traditional/deity/janus', 'traditional/deity/juno', 'traditional/deity/mars'],
          premade: ['green-seed-blessing-before-sowing', 'green-harvesting-herbs-with-thanks', 'green-garden-boundary-planting'],
        },
        {
          id: 'ceres-today',
          title: 'Honouring Ceres today, and the hard parts',
          summary: 'The Roman manner, her offerings, gratitude and waste, the modern community, her shrine, and what not to do.',
          minutes: 7,
          sections: [
            {
              heading: 'The Roman manner',
              body:
                'Approach Ceres in the Roman way. Wash your hands, cover your head (capite velato), and give incense or wine first to Janus, as Cato\'s farmer did. Name her: "Ceres", "good Ceres" (bona Ceres, as Ovid calls her), "great Ceres". Add "or by whatever name it pleases you to be called." Name each gift. Ask her to be "willing and favourable" (volens propitia) to you, your children, house and household. Give with "be honoured by this" (macte esto). Close with Vesta, turn to your right and uncover.\n\nRead your words from the page and begin again if you stumble. This journey follows the common modern pattern of Janus first and Vesta last in prayer, with the first share of food set aside for Vesta; Cato\'s own rite, where Ceres receives last, shows how fluid the order of offerings could be. Choose a pattern and keep it.',
            },
            {
              heading: 'What to give',
              body:
                'Ovid has told you: spelt, "leaping salt" (salt that crackles in the fire), and a few grains of incense, or a torch when there is no incense. Small things, so long as they are clean. Vergil adds honeycomb dissolved in milk and mild wine. Bread and cakes you have made, first fruits of anything you grow, and the first slice of any loaf are all fitting.\n\nThe gift she seems to value most is gratitude in practice: not wasting food, thanking those who grow and serve it, and making sure others are fed. Plan meals, use leftovers, compost scraps, and dedicate a regular gift to a food bank to her.',
            },
            {
              heading: 'The community and her shrine',
              body:
                'Roman polytheists honour Ceres in the reconstructed manner, especially at the Cerialia and before harvests. Hellenic polytheists honour Demeter, and the two overlap. Wheel of the Year pagans often thank Ceres at Lughnasadh and the autumn equinox with bread, sheaves and corn dollies, a modern and fitting use of her name, though not a Roman festival.\n\nHer shrine belongs in the kitchen or dining room. You need a gold, green or white candle, a dish for spelt and salt, a small bowl or jar of grain, and a few ears of wheat or a poppy seed head. An image of Ceres crowned with wheat, or a torch, is traditional. Keep it clean and keep the grain fresh; old grain going stale or mouldy on her shrine is the opposite of her gift.',
            },
            {
              heading: 'The hard parts, and what not to do',
              body:
                'Ceres\'s cult involved killing pigs, and the burning foxes of the Cerialia. These were part of Roman religion; neither is part of modern practice. Proserpina\'s story is one of abduction; tell it with care, especially to children, and do not romanticise it. Ceres\'s grief brought famine; she is not a soft goddess, and the Romans feared hunger as much as they loved bread.\n\nWhat not to do: do not waste food in her name, burning loaves or throwing grain away in quantity. Offer a little, and use the rest. Do not claim to perform the Eleusinian Mysteries or the Roman women\'s rite; they were secret and are lost. Do not burn salt in a closed room or put flour near a flame. And do not let devotion to the goddess of plenty turn into contempt for people who are hungry: Ceres\'s temple was the poor people\'s temple.',
            },
          ],
          knowAndDont: {
            known:
              'Ovid, Fasti 4.409–412, and Vergil, Georgics 1.343–344, on offerings (both verified in Latin). The Roman prayer form from Cato and Pliny (Natural History 28.10–11). The foxes from Ovid, Fasti 4.681–712.',
            unknown:
              'How private households honoured Ceres day to day is barely recorded. Modern associations with Lughnasadh and corn dollies come from British and Irish harvest folklore and modern paganism, not Rome. Food-justice devotion is a modern extension of her plebeian cult.',
          },
          inPractice:
            'Set up her shrine. From now on, set aside the first slice of each new loaf for Ceres, and plan one week of meals with no waste as an offering.',
          reflect: [
            'Where in my household is food wasted, and what would change if I treated it as Ceres\'s gift?',
            'What hunger, in my community or in me, could I offer to her care?',
          ],
          further: [
            'Barbette Stanley Spaeth, The Roman Goddess Ceres (1996)',
            'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (1981)',
          ],
          library: ['traditional/deity/ceres', 'traditional/tool/altar', 'traditional/candle/gold', 'traditional/crystal/citrine', 'traditional/crystal/moss_agate'],
          premade: ['kitchen-prosperity-bread', 'folk-lararium-offering', 'wicca-lammas-bread-offering'],
        },
      ],
      practices: [
        {
          id: 'ceres-first-slice',
          title: 'The first slice',
          instructions:
            'Through the study stage, set aside the first slice or piece of any bread you open for Ceres, with a crumb for Vesta, and say "Ceres, be honoured." Give it to the birds or compost the next day.',
          times: 11,
          every: 'day',
          prompt: 'Did I remember? What did I learn about Ceres today?',
          premade: 'kitchen-family-meal-blessing',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine days of bread and thanks',
      intro:
        'Nine days of offering spelt and salt, eating with gratitude and wasting nothing. Roman religion knew nine-day periods (the novendiale, and the nine days of abstinence before Ceres\'s women\'s rite), but this practice is a modern devotional form.',
      days: 9,
      lessons: [],
      practices: [
        {
          id: 'ceres-nine-days',
          title: 'Nightly spelt and salt',
          instructions:
            'Each evening: wash your hands and cover your head. A grain of incense to Janus. Light Ceres\'s candle and say your prayer. Sprinkle a pinch of spelt and salt on her dish, and name the people whose work fed you that day. Tell her honestly what food was wasted in your house, if any. Sit for a few minutes. Name Vesta last, turn to your right, uncover and put out the flame.\n\nThrough the nine days, waste no food at all if you can. On one day, give to a food bank or buy from a local grower.',
          times: 9,
          every: 'day',
          prompt: 'Whose hands fed me today? Did I waste anything?',
          premade: 'kitchen-family-meal-blessing',
        },
        {
          id: 'ceres-bake',
          title: 'Bake for Ceres',
          instructions:
            'Once in the nine days, bake bread or spelt cakes. Give her the first piece with a pinch of salt, and share the rest.',
          times: 1,
          prompt: 'What did it feel like to make the bread I offer?',
          premade: 'kitchen-prosperity-bread',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Is she your goddess?',
      intro:
        'A few days to weigh it honestly. Ceres asks for gratitude and care, steadily, through the year. Stopping, pausing, or choosing another goddess or path is a good outcome, and so is thanking her at harvest without a formal dedication.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'ceres-discern',
          title: 'Three evenings at her shrine',
          instructions: 'Light her candle and answer the questions below in your journal, a few each evening.',
          times: 3,
          every: 'day',
          prompt: 'What did nine days of bread and thanks change in me?',
        },
      ],
      questions: [
        'Am I drawn to Ceres herself, or mainly to a general harvest spirituality? Both are fine, but they are different.',
        'Can I keep a regular practice for a year: the first slice, monthly offerings, the Cerialia, a harvest thanks?',
        'Am I willing to change how I treat food, waste and the people who grow it?',
        'How do I hold the hard parts: the animal offerings, the foxes, Proserpina\'s abduction?',
        'Does the Roman manner feel right, or would I rather honour Demeter in the Greek way, or both, separately?',
        'Would I rather keep thanking her at harvest and at meals without a dedication? That is a fitting choice.',
      ],
    },
    {
      kind: 'dedication',
      title: 'The dedication',
      intro:
        'If you go ahead, hold this on 19 April (the Cerialia), before a harvest, or at Lughnasadh if you follow the Wheel of the Year. It is a self-dedication, not an initiation, and admits you to no mystery. It takes the Roman shape of a vow (votum): you promise what you will do and you do it.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Ceres',
        summary: 'White clothes, Janus first with incense and wine, a vow read exactly, offerings of spelt, salt, bread, and honeycomb in milk, a light for Proserpina, and Vesta last.',
        minutes: 45,
        ingredients: [
          { name: 'White or light clothing' },
          { name: 'A bowl of clean water and a towel', ref: 'traditional/vessel/bowl' },
          { name: 'A head covering' },
          { name: 'A new gold or white candle for Ceres', ref: 'traditional/candle/gold' },
          { name: 'A small white candle for Proserpina', ref: 'traditional/candle/white' },
          { name: 'Spelt grains or flour with salt', ref: 'traditional/vessel/dish' },
          { name: 'A loaf or spelt cakes you baked' },
          { name: 'A little milk with honey stirred in (and a drop of mild wine if you like)', ref: 'traditional/tool/chalice' },
          { name: 'Frankincense and a burner', ref: 'traditional/herb/frankincense' },
          { name: 'Ears of wheat, or a sprig of mint', ref: 'traditional/herb/mint' },
          { name: 'Your vow, written out' },
        ],
        preparation:
          'Clean your kitchen. Bake a loaf or spelt cakes (250 g spelt flour, 1 tsp salt, 1 tbsp honey, about 160 ml warm water, a little yeast or none for flatbreads; bake at 200°C until golden). Write your vow: your name; that you dedicate yourself to Ceres as her devotee; for how long (a year is wise); and what you will do, such as the first slice for her, wasting little, a regular gift to a food bank, keeping the Cerialia and a harvest thanks. Read it until it flows. Put on white. Set aside the first crumb of the bread for Vesta.',
        steps: [
          {
            title: 'Purify and veil',
            instructions: 'Wash your hands and face. Cover your head.',
          },
          {
            title: 'Janus first',
            instructions: 'Light the incense and give incense and a few drops of milk or wine to Janus, as Cato\'s farmer did.',
            spoken: 'Father Janus, with this offering I pray good prayers,\nthat you may be willing and favourable\nto me, my house and my household.\nOpen the way to Ceres.',
          },
          {
            title: 'Light her flame',
            instructions: 'Light the new candle for Ceres. Lay the wheat or mint beside it.',
            spoken: 'Ceres, good Ceres, great Ceres,\nwho changed acorns for bread,\nguardian of the people\'s grain and the people\'s law,\nor by whatever name it pleases you to be called:\nI come to give myself to you.',
            light: true,
          },
          {
            title: 'Read the vow',
            instructions: 'Read your vow aloud, exactly. If you stumble, stop and begin again from the beginning.',
            minutes: 5,
          },
          {
            title: 'Offer',
            instructions: 'Sprinkle spelt and salt on her dish. Set the first piece of bread beside it and pour a little of the honeyed milk.',
            spoken: 'Ceres, be honoured by this spelt and leaping salt,\nby this bread and this milk and honey.\nSmall gifts, but clean.\nAs I have vowed, so I will do.',
          },
          {
            title: 'A light for Proserpina',
            instructions: 'Light the small white candle from Ceres\'s flame, as she lit her torches to search for her daughter.',
            spoken: 'For Proserpina, and for all who are lost:\nmay they be found.',
            light: true,
          },
          {
            title: 'Sit with her',
            instructions: 'Sit in silence for several minutes.',
            minutes: 7,
            timed: true,
          },
          {
            title: 'Vesta last, and turn',
            instructions: 'A pinch of incense to Vesta. Turn to your right and uncover your head. Put out both flames.',
            spoken: 'Vesta, last as always: be honoured.',
            snuff: true,
          },
        ],
        closing:
          'Share the rest of the bread with others and waste none. Leave Ceres\'s portion until morning, then give it to the birds or the compost, and pour the milk onto soil. Keep your vow on her shrine. Romans who fulfilled a vow set up an altar marked V.S.L.M., votum solvit libens merito, "paid the vow willingly, as was deserved"; at the end of your year, write those letters on your vow and renew it at the Cerialia.',
        safety:
          'Never leave candles unattended; keep them away from flour, tea towels and loose white sleeves. Keep incense smoke away from birds and anyone with asthma. Use oven gloves. Wine is toxic to pets; leave it out if you have animals that might drink it. Honey is not for infants under one. The bread contains gluten.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping the harvest',
      intro:
        'Her ongoing practice is daily gratitude, a monthly offering, the Cerialia in April, a walk around your growing space in spring and a thanks before harvest. Rededicate each year on 19 April.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'ceres-daily',
          title: 'The first slice, always',
          instructions: 'Set aside the first slice of each new loaf for Ceres, waste as little food as you can, and say thanks before your main meal.',
          times: 30,
          every: 'day',
          prompt: 'Was anything wasted today?',
          premade: 'kitchen-family-meal-blessing',
        },
        {
          id: 'ceres-monthly',
          title: 'Monthly offering',
          instructions:
            'Once a month, on the Kalends: wash and veil, Janus first, light her candle, offer spelt, salt and incense, and read your prayer. Make your food bank gift. Vesta last, turn right.',
          times: 12,
          every: 'month',
          prompt: 'Who was fed this month, and who was not?',
          premade: 'folk-lararium-offering',
        },
        {
          id: 'ceres-year',
          title: 'Her yearly round',
          instructions:
            '12–19 April, the Cerialia: wear white on the 19th, bake, give spelt, salt and incense, light a candle for Proserpina, give to a food bank, and rededicate. In late spring: walk three times around your garden, pots or table with milk and honey, asking her to guard the growing. Before any harvest: Janus first, then thanks to Ceres. In January, at the sowing: offer spelt to Ceres and Tellus.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did a year with Ceres grow in my life?',
          premade: 'green-seed-blessing-before-sowing',
        },
      ],
    },
  ],
  sources: [
    'Ovid, Fasti 4.393–394, 4.401–402, 4.409–412, 4.494 and 4.619–620 (Latin, The Latin Library: https://www.thelatinlibrary.com/ovid/ovid.fasti4.shtml); translations original',
    'Ovid, Fasti 1.671–674 (Latin, The Latin Library: https://www.thelatinlibrary.com/ovid/ovid.fasti1.shtml); translation original',
    'Cato, On Agriculture 134, the porca praecidanea (Latin, The Latin Library: https://www.thelatinlibrary.com/cato/cato.agri.html); translations original',
    'Vergil, Georgics 1.338–350 (Latin, The Latin Library: https://www.thelatinlibrary.com/vergil/geo1.shtml); translations original',
    'Livy 3.55 (Latin, The Latin Library: https://www.thelatinlibrary.com/livy/liv.3.shtml); translation original',
    'Ovid, Fasti 6.303–304, Vesta addressed first; Cicero, On the Nature of the Gods 2.67, Vesta last (paraphrased)',
    'Dionysius of Halicarnassus 6.17, 6.94; Cicero, Pro Balbo 55; Servius on Georgics 1.21 (citing Fabius Pictor); Pliny, Natural History 28.10–11; Festus on the Ambarvalia (paraphrased)',
    'Barbette Stanley Spaeth, The Roman Goddess Ceres (University of Texas Press, 1996)',
    'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (1981)',
  ],
};
