import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'path-slavic',
  kind: 'path',
  paths: ['slavic'],
  title: 'The Slavic Path',
  summary:
    'Thirteen weeks with Perun, Veles, Mokosh and the household spirits: what the scarce sources really say, how folk custom kept the old year alive, and how modern Rodnovers practise. Includes a beautiful corner, bread and salt, and the festivals from Koliada to Dziady.',
  welcome:
    'This journey is for anyone drawn to the old gods and spirits of the Slavic lands, whether through family, language, folklore or a call you can’t explain. It runs for about thirteen weeks and asks for a small household shrine, some reading, a weekly offering and the keeping of the seasonal festivals.\n\nIt is honest from the start. Very little was written down about Slavic religion before Christianity, and most of what was written came from Christian chroniclers. What survived best survived in village custom: the domovoi behind the stove, wreaths on the river at Kupala, food set out for the dead at Dziady. Modern Rodnovery (“native faith”) builds on all of this, and it comes in many forms, some of them nationalist. This app’s approach is inclusive: the gods and the ancestors are honoured by anyone who comes with respect.\n\nAt the end you can make a self-dedication. It is not an initiation into any community or priesthood, and it does not replace one.',
  about:
    'The Slavic peoples, from the Czechs and Poles in the west to the Russians, Ukrainians and Belarusians in the east and the Serbs, Croats, Slovenes and Bulgarians in the south, were among the last in Europe to be Christianised, and the West Slavs of the Baltic coast kept their temples until 1168. Yet the written evidence is thin: a Byzantine historian, a Kyivan chronicle, a handful of German and Danish chroniclers and Church sermons condemning “pagan” habits. What we have in abundance is folklore, recorded richly in the nineteenth century, in which old gods became saints and old offerings became household custom, a blend often called dvoeverie, “dual faith”. Modern Rodnovery began between the world wars and grew quickly after 1990, from careful reconstructionist circles to groups with nationalist or even racist ideas. This journey teaches the evidence, the folk year and a respectful practice, and is clear about which parts are reconstructed.',
  notes: [
    'Slavic paganism is not tied to blood, ethnicity or nation. Some Rodnover groups have racist, antisemitic or far-right strands; this app rejects them completely. Anyone who comes with respect may honour these gods.',
    'The written sources are very few and almost all written by Christians. Much of what is now taught as “Slavic mythology”, including the Perun–Veles myth, is reconstruction by modern scholars. This journey labels reconstruction clearly.',
    'The Book of Veles (Velesova Kniga) and the “Slavic-Aryan Vedas” are twentieth-century forgeries. They are popular in some groups, but they are not ancient sources.',
    'Slavic cultures are many, not one. Polish, Czech, Russian, Ukrainian, Belarusian, Serbian and Bulgarian customs differ, and they have lived through very different histories, including war today. Learn the customs of a particular people with care, and avoid flattening them into one.',
    'Much folk practice lived inside Orthodox and Catholic Christianity. Treat icons, saints and church customs with respect, even where you honour the older layer.',
  ],
  holyDays: ['koliada', 'marzanna', 'kupala', 'dziady'],
  stages: [
    {
      kind: 'threshold',
      title: 'Bread and salt at the door',
      intro:
        'In Slavic custom, a guest is greeted at the door with bread and salt. This first week you are both host and guest: you set up a beautiful corner for your shrine, welcome the house spirit, and offer bread and salt to the gods and ancestors as you begin.',
      days: 7,
      lessons: [],
      practices: [
        {
          id: 's-thr-corner',
          title: 'Find your beautiful corner',
          instructions:
            'In an East Slavic house, the krasny ugol, the “beautiful” or “red” corner, was the place of honour, diagonally across from the stove, where icons and embroidered cloths were kept. Choose a corner or shelf for your shrine. Lay down a clean cloth (an embroidered one, a rushnyk, if you have it), a candle, a small bowl and a plate for bread. Keep it simple and clean.',
          times: 1,
          prompt: 'Where is your beautiful corner, and where is your “stove”, the warm heart of your home, where the house spirit might live?',
        },
        {
          id: 's-thr-tree',
          title: 'Greet a tree',
          instructions:
            'This week, find an oak or a birch near you: oak was Perun’s tree in folk belief, birch the tree of spring and the Green Week. Stand with it, touch its bark, and greet it. Leave a pinch of bread at its roots, or simply pour a little clean water, which is kinder to wildlife in towns and parks.',
          times: 1,
          prompt: 'Which tree did you find? What did it feel like to greet it?',
        },
      ],
      rite: {
        title: 'Bread and salt welcome',
        summary:
          'An opening rite of welcome: cleanse the corner, light the candle, offer bread and salt to the house spirit, the ancestors and the gods, and state your intent.',
        minutes: 20,
        ingredients: [
          { name: 'A candle', ref: 'traditional/candle/white' },
          { name: 'A round loaf or a good piece of rye or wheat bread' },
          { name: 'A small dish of salt' },
          { name: 'A bowl of clean water', ref: 'traditional/vessel/bowl' },
          { name: 'A little milk, kvass, honey or mead' },
          { name: 'A clean embroidered or white cloth' },
          { name: 'A birch twig or oak leaf', ref: 'traditional/herb/birch', optional: true },
        ],
        preparation:
          'Clean the house, or at least the room, and sweep towards the door. Wash your hands and face. Put the bread on the cloth with the salt on top or beside it, the water and the drink on the shrine.',
        steps: [
          {
            title: 'Cleansing',
            instructions:
              'Dip your fingers in the water and sprinkle the corner, then yourself. If you have a birch twig, dip it and sprinkle with that, the way birch brooms were used in the bathhouse to cleanse.',
            spoken: 'Clean water, clean house, clean heart. I make this corner ready.',
          },
          {
            title: 'Light the candle',
            instructions: 'Light the candle and stand quietly before it for a moment.',
            spoken: 'Fire of the hearth, fire of the sun: be welcome in this house.',
            light: true,
          },
          {
            title: 'Bread and salt for the house',
            instructions:
              'Break off a small piece of bread, dip it in salt and place it near your stove or in the warmest corner of your home, for the house spirit. Speak as to an old relative.',
            spoken: 'Grandfather, master of this house, I greet you. Here is bread and salt for you. Live with us in peace, and keep this house well.',
          },
          {
            title: 'For the ancestors',
            instructions: 'Pour a little drink into the bowl and set a piece of bread beside it for the ancestors. Name any of your dead you wish to remember.',
            spoken: 'Forefathers and foremothers, of my blood and of my heart: be remembered here. Eat and drink with us.',
          },
          {
            title: 'For the gods',
            instructions:
              'Raise the bread and salt to the candle and offer them to the gods, by name if you have begun to know them: Perun, Veles, Mokosh, Dazhbog, or simply “the gods of the old ways”. Then state, in your own words, why you have come and what you hope to learn.',
            minutes: 5,
          },
          {
            title: 'Listen and give thanks',
            instructions: 'Sit quietly for a few minutes. Then thank the gods, ancestors and house spirit, and snuff the candle.',
            spoken: 'Thanks to you, gods and ancestors, master of the house. Slava!',
            minutes: 5,
            snuff: true,
          },
        ],
        closing:
          'Leave the offerings overnight. In the morning, crumble the bread outside for the birds (a small amount), pour the drink onto the earth, and keep the house spirit’s piece near the stove a little longer if you like. Offerings are not eaten by the living, but you may share the rest of the loaf with your household.',
        safety:
          'Never leave a lit candle unattended. Keep offerings away from pets: salt in quantity is harmful to them, and so are raisins, chocolate, onion and garlic. Put out only a little bread for birds.',
      },
    },
    {
      kind: 'study',
      title: 'Learning the ground',
      intro:
        'Six weeks of study, about one lesson a week. You will learn who the Slavs were, what the sources say, who the gods are, the reconstructed myth of Perun and Veles, dual faith, the modern Rodnover movements and the values of hospitality and kinship. Read slowly; much of what is popular online rests on very little, and you will learn to tell the difference.',
      days: 42,
      lessons: [
        {
          id: 's-who',
          title: 'Who were the Slavs?',
          summary: 'The three branches of the Slavic peoples, when and how they became Christian, and why there was never one Slavic religion.',
          minutes: 6,
          sections: [
            {
              heading: 'Three branches',
              body:
                'The Slavic languages are a branch of the Indo-European family, closely related to the Baltic languages (Lithuanian and Latvian). Linguists group them in three: West Slavic (Polish, Czech, Slovak, Sorbian and the extinct Polabian of the Baltic coast); East Slavic (Russian, Ukrainian, Belarusian, Rusyn); and South Slavic (Slovene, Croatian, Serbian, Bosnian, Montenegrin, Macedonian, Bulgarian).\n\nThe Slavs first appear clearly in written history in the sixth century, when Byzantine writers describe the Sclaveni and Antes on the Danube frontier. Over the next centuries they spread across much of central and eastern Europe and the Balkans.',
            },
            {
              heading: 'Conversion, slow and uneven',
              body:
                'Christianity came at different times to each people. Saints Cyril and Methodius brought a Slavonic liturgy to Moravia in 863. Bulgaria converted in 864, Poland in 966 under Mieszko I, and Kyivan Rus’ in 988 under Prince Vladimir. The Polabian and Pomeranian Slavs on the Baltic held out longest: the great temple of Svantevit at Arkona on the island of Rügen was destroyed by the Danes in 1168.\n\nConversion at the top did not mean conversion everywhere. Church writers complained for centuries that people still prayed to fire, to Rod and the birth-goddesses, to wells and groves. Folk practice blended old and new in ways that lasted into the twentieth century.',
            },
            {
              heading: 'Many traditions, not one',
              body:
                'There was no single Slavic religion with one pantheon. The gods of Kyiv’s princes (Perun, Mokosh, Dazhbog) are not the same as the gods of the Baltic Slavs (Svantevit, Triglav, Svarožic, Jarovit), and the South Slavs left almost no record of their gods at all. Folk customs share a great deal across the Slavic world, but each region has its own forms.\n\nModern practitioners usually follow the customs of one people, often the one their family or language comes from, though many people with no Slavic family also come to this path. Learning a little of a Slavic language opens the songs, proverbs and folk names that carry so much of the tradition.',
            },
            {
              heading: 'Why it matters now',
              body:
                'The Slavic world today is divided by borders and, since 2014 and 2022, by war. Customs that look similar can mean very different things to Ukrainians, Russians, Poles or Belarusians, and some are tied up with national identity. Approach each culture on its own terms. Don’t present one people’s custom as “the Slavic way”, and be aware that symbols and festivals can carry political weight.',
            },
          ],
          knowAndDont: {
            known:
              'The Slavic languages, their branches, and the dates of conversion are well documented. Byzantine, Kyivan, German and Danish sources describe Slavic religion at particular times and places.',
            unknown:
              'We know very little about Slavic religion before the ninth century, almost nothing about South Slavic gods, and nothing that would show a single shared pantheon. Common ideas of “the Slavic gods” usually merge sources from different peoples and centuries.',
          },
          inPractice:
            'Most practitioners choose one cultural focus, learn some of its language, and collect its folk songs, proverbs and customs. Many keep a map of the region and an embroidered cloth or object from it on the shrine.',
          reflect: [
            'What draws you to the Slavic path: family, language, the folklore, a god? What do you know about where that thread comes from?',
            'How will you be respectful of the living cultures, and of the hard history some of them carry now?',
          ],
          further: [
            'Paul M. Barford, The Early Slavs (2001)',
            'Florin Curta, The Making of the Slavs (2001)',
          ],
        },
        {
          id: 's-sources',
          title: 'What the sources say, and what they don’t',
          summary: 'Procopius, the Primary Chronicle, the German and Danish chroniclers, the sermons, the archaeology, the folklore, and the forgeries.',
          minutes: 8,
          sections: [
            {
              heading: 'The earliest witness',
              body:
                'The first description of Slavic religion comes from the Byzantine historian Procopius, writing in the 550s about the Sclaveni and Antes. In H. B. Dewing’s translation: “For they believe that one god, the maker of the lightning, is alone lord of all things, and they sacrifice to him cattle and all other victims.” He adds: “They reverence, however, both rivers and nymphs and some other spirits, and they sacrifice to all these also, and they make their divinations in connection with these sacrifices.”\n\nIt is a short passage, but it already shows two layers that will run through all Slavic religion: a great god of the storm, and a host of spirits of water and place.',
            },
            {
              heading: 'Kyiv: the Primary Chronicle',
              body:
                'The Rus’ Primary Chronicle (the Tale of Bygone Years), compiled in Kyiv around 1113, is the main East Slavic source. It records treaties with Byzantium in which the pagan Rus’ swore by Perun and by Volos (Veles), “the god of cattle”. Under the year 980 it says Prince Vladimir set up idols on a hill outside his palace: Perun, of wood with a silver head and a golden moustache, Khors, Dazhbog, Stribog, Simargl and Mokosh. After his baptism in 988 he had Perun tied to a horse’s tail, beaten with sticks and thrown into the Dnieper. The chronicle also tells of volkhvy, pagan seers and priests, who led uprisings as late as 1071.\n\nA few later texts add names. A gloss in a translated Byzantine chronicle, copied in 1114, equates Svarog with the Greek smith god Hephaestus and calls his son Dazhbog the Sun. Medieval sermons scold people for offering bread, cheese and honey to Rod and the rozhanitsy, the birth-goddesses.',
            },
            {
              heading: 'The Baltic Slavs: German and Danish chroniclers',
              body:
                'For the West Slavs of the Baltic, the sources are richer and hostile. Thietmar of Merseburg (early 1000s) describes the temple of Riedegost among the Liutici, its idols and its chief god Svarožic. Helmold of Bosau (1160s–70s) describes sacred groves, the god Prove, Svantevit as “god of gods”, and a feast at which a bowl was passed in the name of a good god and an evil god he calls Chernobog, the “black god”. Saxo Grammaticus describes Arkona: a four-headed Svantevit holding a horn of wine that foretold the harvest, a sacred white horse, and a great honey cake behind which the priest stood. The Lives of St Otto of Bamberg describe the three-headed Triglav at Szczecin.',
            },
            {
              heading: 'Archaeology, folklore and forgeries',
              body:
                'Archaeology adds sanctuaries, such as the eight-lobed ring at Peryn near Novgorod, traditionally linked to Perun, and the four-faced Zbruch idol, found in a river in 1848 and still debated. Folklore, collected in the nineteenth century by scholars such as Alexander Afanasyev in Russia and Oskar Kolberg in Poland, is by far the largest body of evidence for actual practice.\n\nThere are also forgeries. The bronze Prillwitz idols, “found” in the eighteenth century, were fakes. The Book of Veles, said to have been written on wooden boards that no scholar has ever seen, appeared in émigré circles in the 1950s and is regarded by linguists as a modern fabrication. The “Slavic-Aryan Vedas” of Ynglism, published from the late 1990s, are a modern invention. Treat them as modern texts if you read them at all.',
            },
          ],
          knowAndDont: {
            known:
              'Procopius, the Primary Chronicle, Thietmar, Helmold, Saxo and the Lives of Otto give us names of gods, temples, idols and some practices. Medieval sermons, archaeology and vast folklore collections fill in household and village religion.',
            unknown:
              'There is no Slavic myth told by a pagan, no prayer or hymn, no full description of a rite. We do not know how gods were understood beyond a few lines, and many famous “Slavic gods” (Lada, Kupala, Yarilo, even Belobog) rest on late or doubtful sources. Forged texts circulate widely.',
          },
          inPractice:
            'Careful practitioners tag their sources: chronicle, sermon, archaeology, folklore or modern. They read Procopius and the Primary Chronicle for themselves, and treat the Book of Veles as a modern work, not scripture.',
          reflect: [
            'What did you believe about Slavic gods before this lesson? Which of it rests on solid ground, and which on late or doubtful sources?',
            'How does it feel that the best evidence for practice is village custom, rather than temple rites?',
          ],
          further: [
            'Procopius, History of the Wars VII.14, trans. H. B. Dewing (Loeb, 1924; public domain, on archive.org)',
            'The Russian Primary Chronicle, trans. Samuel H. Cross & Olgerd P. Sherbowitz-Wetzor (1953)',
            'Helmold of Bosau, The Chronicle of the Slavs, trans. F. J. Tschan (1935)',
            'Juan Antonio Álvarez-Pedrosa (ed.), Sources of Slavic Pre-Christian Religion (2021)',
          ],
        },
        {
          id: 's-gods',
          title: 'The gods',
          summary: 'Perun, Veles, Mokosh, Dazhbog, Svarog and the others: what each source says and how they are honoured today.',
          minutes: 8,
          sections: [
            {
              heading: 'Perun and Veles',
              body:
                'Perun, the thunderer, was the chief god of the Kyivan princes and their warriors, and most scholars see him in Procopius’s “maker of the lightning”. His name is related to the Lithuanian Perkūnas and to words for striking and for oak. In folklore his thunder passed to the prophet Elijah (Ilya), whose feast on 20 July in the Julian calendar (2 August in the Gregorian) was the great day of thunderstorms. The oak was his tree; the axe and the thunderstone were his signs. Rodnovers honour him as god of storm, justice, oaths and protection.\n\nVeles, or Volos, was “the god of cattle” by whom the Rus’ swore treaties alongside Perun. In the twelfth-century Tale of Igor’s Campaign the poet Boyan is called Veles’s grandson, linking him to song and magic. In folklore cattle came under St Blaise (Vlasiy), and in some places the last ears of grain left standing in the field were called “Volos’s beard” (elsewhere Elijah’s beard, the Saviour’s beard or simply “the beard”). Today Veles is honoured as god of cattle, wealth, the underworld, the dead, magic and poetry, though some of those roles are reconstructed.',
            },
            {
              heading: 'Mokosh',
              body:
                'Mokosh is the only goddess in Vladimir’s pantheon of 980, and later Church writings scold women for honouring her. Her name may be connected with moisture or with spinning. In folk belief her place was taken by St Paraskeva Pyatnitsa (“Friday”), patron of women’s work, and in many regions women did not spin, wash or sew on Fridays. She is closely tied to the folk image of Mati Syra Zemlya, “Moist Mother Earth”, to whom peasants swore oaths by touching or eating soil. Today Mokosh is honoured as the goddess of spinning, fate, women’s work, moisture and the earth.',
            },
            {
              heading: 'The sun, fire and the sky',
              body:
                'Dazhbog, “the giving god”, appears in Vladimir’s pantheon, and the 1114 gloss calls him the Sun, son of Svarog. The Tale of Igor’s Campaign calls the Rus’ “Dazhbog’s grandsons”. Svarog himself is known only from that one gloss, as a smith and heavenly father; Svarožic or Svarozhich, his “son”, was worshipped as a fire and was the god of Riedegost among the Baltic Slavs. Khors may be another sun god, perhaps of Iranian origin. Stribog may be a god of wind; Simargl may be a winged dog-like being of Iranian origin. We know very little more.',
            },
            {
              heading: 'The Baltic gods, and the later names',
              body:
                'Among the Baltic Slavs the great gods were Svantevit at Arkona, the three-headed Triglav at Szczecin, Jarovit at Wolgast and Svarožic at Riedegost. Some scholars think these were local forms of the same great gods worshipped in the east; others think they were quite different.\n\nMany well-loved names come from late or doubtful sources. Lada appears in songs as a refrain (lado) and in fifteenth- to seventeenth-century Polish and Ukrainian writings; she may have been a goddess or may be a misreading. Morana or Marzanna is a figure of folk ritual, the effigy of winter and death. Kupala, Kostroma and Yarilo are figures of seasonal games. Rodnovers honour all of them, and the Living Library has entries for Lada and Morana; just know that their evidence is folk custom, not temple worship.',
            },
          ],
          knowAndDont: {
            known:
              'Perun, Veles (Volos), Mokosh, Dazhbog, Stribog, Khors and Simargl are named in the Primary Chronicle; Svarog in the 1114 gloss; Svantevit, Triglav, Svarožic and Jarovit in West Slavic sources. Folk customs connected with Elijah, Blaise and Paraskeva are well documented.',
            unknown:
              'We have almost no myths and very few descriptions of how these gods were worshipped. The links between the Kyivan and Baltic gods, and the meaning of Svarog, Rod, Simargl and Khors, are uncertain. Lada, Kupala, Yarilo and Belobog may never have been worshipped as gods.',
          },
          inPractice:
            'Rodnovers usually honour Perun with oak leaves, beer, mead or meat and on Ilya’s day; Veles with bread, milk, honey and coins, in winter and at the end of harvest; Mokosh with spun thread, grain and bread on Fridays; Dazhbog at sunrise and midsummer.',
          reflect: [
            'Which god or goddess are you drawn to, and how much of what you know about them comes from sources rather than modern books?',
            'How do you feel about honouring gods who were taken over by saints? Is the saint a mask, a successor, or something else?',
          ],
          further: [
            'Mike Dixon-Kennedy, Encyclopedia of Russian and Slavic Myth and Legend (1998)',
            'Judith Kalik & Alexander Uchitel, Slavic Gods and Heroes (2018)',
          ],
          library: [
            'traditional/deity/perun',
            'traditional/deity/veles',
            'traditional/deity/mokosh',
            'traditional/deity/dazhbog',
            'traditional/deity/lada',
            'traditional/deity/morana',
            'traditional/herb/oak',
          ],
        },
        {
          id: 's-myth',
          title: 'Perun and Veles: a reconstructed myth',
          summary: 'The “basic myth” proposed by Ivanov and Toporov, the evidence behind it, and how to hold a myth that was rebuilt by scholars.',
          minutes: 7,
          sections: [
            {
              heading: 'A myth no one wrote down',
              body:
                'No Slavic text tells a myth of Perun and Veles. What we have are scattered clues: they were sworn by together, one a god of the warriors, one of cattle and wealth; Perun’s idols stood on hills, while places named after Veles often lie in low, wet ground; and in folklore the thunder (or Elijah) hunts down a serpent, devil or demon who hides from him in trees, stones, animals and people.\n\nIn the 1970s two Russian scholars, Vyacheslav Ivanov and Vladimir Toporov, pieced these clues together with Baltic and other Indo-European myths into what they called the “basic myth”. It is a brilliant reconstruction. It is not a recovered text.',
            },
            {
              heading: 'The story as reconstructed',
              body:
                'Perun sits at the top of the world tree, an oak, or on a mountain. Veles, in the shape of a serpent or a shaggy beast, lives below among the roots and the waters. Veles climbs up and steals Perun’s cattle, or his wife, or his son. Perun strikes at him with lightning. Veles flees and hides: in a tree, which Perun splits; under a stone; in a cow, a horse, a man. Perun strikes again and again, and at last Veles is driven down into the water, his own realm. The stolen cattle (the rain clouds) are released, and the rain falls on the earth. Then the cycle begins again.\n\nThe pattern resembles Indra’s fight with the serpent Vṛtra in the Rigveda, Thor’s battle with the World Serpent, and the Lithuanian Perkūnas pursuing Velnias. Ivanov and Toporov argued it was a shared Indo-European inheritance.',
            },
            {
              heading: 'What scholars say',
              body:
                'The reconstruction is widely respected, and the Croatian scholar Radoslav Katičić extended it through fragments of folk songs. But many scholars warn that it rests on comparison and late folklore, and that it may give the two gods sharper roles than they ever had. Some doubt that Veles was a serpent or an underworld god at all. Read it as one of the best guesses we have.',
            },
            {
              heading: 'Holding the myth in practice',
              body:
                'For practice, the myth’s gift is that it is a cycle, not a war of good against evil. Veles is not Satan: he is the god of cattle, wealth, the dead and the deep places, and he is needed. The storm that splits the oak brings the rain. Many Rodnovers honour both gods and see the storm season as their struggle and balance.\n\nWhen you tell the myth, say “as reconstructed”. When you pray to Perun in a storm, or leave the last ears of grain for Veles at harvest, you are on firmer folk ground.',
            },
          ],
          knowAndDont: {
            known:
              'Perun and Veles were sworn by together in tenth-century treaties. Folklore across the Slavic lands tells of the thunder (often Elijah) striking a serpent or devil who hides in trees and stones. Place names and Baltic parallels support a contrast between a high, storm god and a low, watery one.',
            unknown:
              'No Slavic source tells this myth. The full story is a modern reconstruction (Ivanov and Toporov, 1970s), and how far the ancient Slavs told it, and whether Veles was a serpent or underworld god, is debated.',
          },
          inPractice:
            'Many Rodnovers honour Perun in thunderstorms and Veles at the turn of the year and the end of harvest, and tell the myth at the summer festivals as a story of rain returning. Some keep an oak branch and a cup of water on the shrine for the two gods.',
          reflect: [
            'What changes when you understand Veles as a needed god rather than a villain?',
            'How do you feel about a myth that was rebuilt by scholars? Can it still be true in the way myths are true?',
          ],
          further: [
            'Vyacheslav Ivanov & Vladimir Toporov, Issledovaniya v oblasti slavyanskikh drevnostey (1974, Russian)',
            'Radoslav Katičić, Božanski boj (2008, Croatian)',
            'Calvert Watkins, How to Kill a Dragon (1995)',
          ],
          library: ['traditional/deity/perun', 'traditional/deity/veles', 'traditional/herb/oak'],
        },
        {
          id: 's-dvoeverie',
          title: 'Dual faith: saints, icons and the old ways',
          summary: 'What “dvoeverie” means, why many scholars now question it, and how to honour the Christian layers of Slavic folk religion.',
          minutes: 7,
          sections: [
            {
              heading: 'The idea of dual faith',
              body:
                'Dvoeverie means “double faith”. Nineteenth-century Russian scholars used the word (taken from medieval Church writing) for the way peasants seemed to keep pagan beliefs under a thin Christian surface: Elijah thundering across the sky like Perun, St Blaise watching over cattle like Veles, St Paraskeva taking Mokosh’s Friday, St George opening the spring pasture. Wreaths floated on rivers at the feast of St John the Baptist; food was set out for the dead on church days of remembrance.',
            },
            {
              heading: 'Why scholars now question it',
              body:
                'Since the 1990s, historians such as Eve Levin and Stella Rock have argued that dvoeverie is a misleading idea. Peasants did not see themselves as half pagan. They practised a coherent folk Orthodoxy or folk Catholicism, in which saints, icons, household spirits and seasonal rites all belonged together. Some customs are ancient; some grew up inside Christianity; some were borrowed from neighbours. Calling it all “pagan survival” often says more about the scholars than about the villagers.\n\nThis matters because it is easy for modern pagans to “claim back” everything in folk religion. A better approach is to recognise both layers: the evidence that some customs are old, and the reality that real Christian people kept them with real Christian faith.',
            },
            {
              heading: 'The beautiful corner',
              body:
                'In the East Slavic house, the beautiful (krasny) corner held the icons, a lamp, embroidered towels and blessed willow or birch branches. It faced the stove corner, where the domovoi lived. Guests bowed to the corner on entering. In Poland and Ukraine, too, a holy corner or shelf held the household’s sacred things.\n\nMany Rodnovers now keep the same corner with images of the gods, carved wooden figures, embroidered cloths, a candle, bread and salt. If you inherit icons from family, many people keep them respectfully, in their own place, rather than throwing them away or turning them into pagan objects.',
            },
            {
              heading: 'Saints’ days as a calendar',
              body:
                'The folk year was marked by saints’ days, and practitioners use them as a map of the older year. Elijah’s day (2 August Gregorian) for Perun and thunder; Blaise (24 February Gregorian) for cattle and Veles; St George’s days in spring and autumn for pasture; Paraskeva Friday (10 November Gregorian) and every Friday for Mokosh; St John the Baptist for Kupala; the Saturdays of the dead for the ancestors. Many Orthodox countries still keep the Julian calendar, thirteen days behind, and so do many Rodnovers.',
            },
          ],
          knowAndDont: {
            known:
              'Folk customs linking saints with thunder, cattle, women’s work and the seasons are well documented in nineteenth- and twentieth-century ethnography, as is the beautiful corner. The scholarly debate over dvoeverie is well established.',
            unknown:
              'Which saints actually replaced which gods is mostly inference. Elijah for Perun is widely accepted; Blaise for Veles and Paraskeva for Mokosh are likely but not proven. Many customs cannot be dated before the eighteenth century.',
          },
          inPractice:
            'Rodnovers often keep festivals on the folk saints’ days, sometimes in the Julian calendar. Many keep their shrine in the beautiful corner, with embroidered cloths and a lamp. Christian Slavic witches often keep both icons and the old customs together.',
          reflect: [
            'How do you feel about the Christian layers of Slavic folk religion? What would honouring them look like for you?',
            'If your family has icons or religious objects, how do you want to treat them?',
          ],
          further: [
            'Stella Rock, Popular Religion in Russia: “Double Belief” and the Making of an Academic Myth (2007)',
            'Linda J. Ivanits, Russian Folk Belief (1989)',
          ],
        },
        {
          id: 's-rodnovery',
          title: 'Rodnovery today',
          summary: 'The modern native faith movements: their history, how they differ, the nationalist strands, and where this app stands.',
          minutes: 8,
          sections: [
            {
              heading: 'Beginnings',
              body:
                'Modern Slavic paganism began between the two world wars. In Ukraine, Volodymyr Shaian founded a native faith movement in the 1930s; in Poland, Jan Stachniuk founded the Zadruga circle in 1937, with a strongly nationalist philosophy. After the war, the Ukrainian émigré Lev Sylenko founded RUNVira (the Native Ukrainian National Faith) in Chicago in 1966, a largely monotheistic faith centred on Dazhbog, built on his own scripture.\n\nThe great growth came after 1990, with the end of communism. Today there are Rodnover communities in Russia, Ukraine, Poland, Belarus, the Czech Republic, Slovakia, Serbia, Croatia, Bulgaria and among Slavic diasporas. The word Rodnovery (“native faith”, from rod, “kin, family, birth”) is used widely, with local forms such as Rodzimowierstwo in Polish and Ridnovira in Ukrainian.',
            },
            {
              heading: 'Different approaches',
              body:
                'Some groups are reconstructionist: they work carefully from the sources and folklore, sing folk songs, keep the Julian folk calendar and avoid forged texts. Others are freer, combining Slavic gods with ideas from Hinduism, Western esotericism or their own revelations. In Poland, the Native Polish Church (registered in 1995) and Rodzima Wiara (Native Faith, founded in Wrocław and registered in 1996) are the best known. In Russia, groups range from the Circle of Pagan Tradition, which is relatively moderate and scholarly, to unions of communities with more political aims.\n\nCommon features include a kapishche (an outdoor sanctuary with carved wooden figures of the gods), a sacred fire, offerings called treba, priests or ritual leaders called volkhvy or zhrets, walking sunwise (posolon), and the cry “Slava!”, “Glory!”',
            },
            {
              heading: 'The nationalist strands',
              body:
                'Some Rodnover groups, especially but not only in Russia, have taken up nationalist, racist or antisemitic ideas, sometimes borrowing “Aryan” myths from the twentieth century. Ynglism, founded in Omsk in 1992 and teaching the invented “Slavic-Aryan Vedas”, has been treated as extremist by Russian courts: its Omsk organisation was dissolved in 2004 for inciting ethnic hatred, a ruling upheld by the Supreme Court, and later court rulings declared books of the “Vedas” extremist material. The eight-armed kolovrat sun symbol is used innocently by many Rodnovers but also by neo-Nazi groups, so context matters. Some groups have been tied to militarism and to the current war.\n\nMany Rodnovers reject all this firmly, and scholars of the movement stress how varied it is.',
            },
            {
              heading: 'Where this app stands',
              body:
                'This app’s approach is inclusive. The Slavic gods, spirits and ancestors are not the property of any race or nation. Anyone who comes with respect, learns the customs and honours the cultures can walk this path, and no one is more “native” to the gods because of their blood. If you look for a community, ask about its politics and its sources before you join, and walk away from any group that talks about racial purity, “Aryans” or enemies within. There are good communities; take the time to find one.',
            },
          ],
          knowAndDont: {
            known:
              'The history of modern Slavic paganism from the 1930s onward is well studied, including the founding of RUNVira, Zadruga, the Polish native faith churches and the Russian groups, and the presence of nationalist and racist currents in some of them.',
            unknown:
              'No Rodnover group has an unbroken line from pre-Christian times, and claims of hidden survival (for example through secret village priests or the Book of Veles) are not supported by evidence. Exact membership numbers are unknown.',
          },
          inPractice:
            'Rodnovers usually gather outdoors at a kapishche or a fire for the great festivals, and keep a home shrine the rest of the year. Solitary practitioners keep the same festivals at home and sometimes join online communities. Choose carefully and trust your conscience.',
          reflect: [
            'What would you look for in a community, and what would make you leave one?',
            'How will you speak about the Slavic path to others so that it is clearly welcoming?',
          ],
          further: [
            'Kaarina Aitamurto & Scott Simpson (eds.), Modern Pagan and Native Faith Movements in Central and Eastern Europe (2013)',
            'Kaarina Aitamurto, Paganism, Traditionalism, Nationalism: Narratives of Russian Rodnoverie (2016)',
            'Adrian Ivakhiv, “In Search of Deeper Identities: Neopaganism and ‘Native Faith’ in Contemporary Ukraine”, Nova Religio (2005)',
          ],
        },
        {
          id: 's-values',
          title: 'Hospitality, kin and reciprocity',
          summary: 'The values running through the sources and folk custom: the guest, the family line, gifts for gifts, and respect for land and spirits.',
          minutes: 7,
          sections: [
            {
              heading: 'The guest',
              body:
                'Outsiders who wrote about the Slavs, even hostile ones, praised their hospitality. The Byzantine military manual known as the Strategikon of Maurice, from about 600, says they were kind to strangers, escorted them safely from place to place, and that a host whose guest came to harm would be attacked by his neighbours for it. Helmold of Bosau, no friend of the pagans, wrote of the Baltic Slavs that their hospitality was so generous that they shared everything with a guest, and that a man who refused a stranger was disgraced.\n\nThe living custom of greeting with bread and salt, khleb-sol or chleb i sól, carries this on: a round loaf on an embroidered towel, with salt on top, offered to an honoured guest at the door.',
            },
            {
              heading: 'Rod: the kin',
              body:
                'Rod means family, kin, birth and lineage, and it gives Rodnovery its name. Medieval sermons mention Rod and the rozhanitsy, the birth-goddesses, given offerings of bread, cheese and honey; we don’t know exactly who they were, and modern Rodnovers sometimes make Rod a supreme creator, which is a modern development. What is certain is the place of the ancestors in folk religion: fed at the Saturdays of the dead, at Dziady and at Christmas Eve, remembered by name, their graves visited.\n\nFor practice, kin can be wide. Adopted families, chosen families and the dead of the land you live on all belong. Honouring the ancestors is about gratitude and responsibility, not purity of blood.',
            },
            {
              heading: 'Gifts for gifts',
              body:
                'Slavic folk religion is a religion of exchange. The domovoi is fed and keeps the house; the leshy is given bread and leaves the hunter alone; the vodyanoy gets the first fish and spares the fisherman; the last sheaf is left for the field. Procopius already describes people promising a sacrifice if they survived danger, and keeping their word when they did.\n\nThat cuts both ways. Promises to the gods and spirits are kept. Offerings are given with care, not thrown down. And what is taken from forest, field and river is taken with thanks.',
            },
            {
              heading: 'Living these values',
              body:
                'Feed people. Welcome strangers, and greet guests with something to eat. Remember your dead by name. Keep your promises to people and to the gods. Be polite in the forest and by the water. Give thanks before you eat. These are simple, and they are the heart of the tradition. Many Rodnovers add courage, honesty, hard work and care for the land.',
            },
          ],
          knowAndDont: {
            known:
              'The Strategikon and Helmold both describe Slavic hospitality in detail; bread-and-salt welcome is a living custom across the Slavic world; ancestor feasts and exchange with household and nature spirits are richly documented in folklore.',
            unknown:
              'We don’t know who Rod and the rozhanitsy were, or what the pre-Christian Slavs taught about ethics. Modern Rodnover lists of virtues and ideas of Rod as a supreme god are modern constructions.',
          },
          inPractice:
            'Greet guests with bread and salt on special occasions; set aside the first spoonful or the first drink for the house spirit or the ancestors; keep a list of your dead to name at the festivals; and keep your word.',
          reflect: [
            'Who belongs to your rod, your kin, living and dead? Who would you include that blood alone would leave out?',
            'Where in your life do you give and receive gifts? Is there an imbalance you want to put right?',
          ],
          further: [
            'Maurice’s Strategikon, trans. George T. Dennis (1984), Book XI.4',
            'W. R. S. Ralston, The Songs of the Russian People (1872, public domain)',
          ],
          premade: ['kitchen-family-meal-blessing'],
        },
      ],
      practices: [
        {
          id: 's-study-weekly',
          title: 'Weekly treba',
          instructions:
            'Once a week, light the candle in your beautiful corner and make a small offering (treba): bread and salt, honey, kasha, milk, or a little kvass or mead (honeyed water or fruit juice if you don’t drink alcohol). Speak to one god you are learning about, or to the ancestors, and read aloud something from the week’s lesson.',
          times: 6,
          every: 'week',
          prompt: 'What did you offer, to whom, and how did it feel?',
        },
        {
          id: 's-study-word',
          title: 'A word or a song',
          instructions:
            'Each week, learn a word, a proverb or a verse of a folk song in a Slavic language: khleb (bread), sol (salt), domovoi (house spirit), rod (kin), slava (glory). Many folk songs for Kupala and Koliada are easy to find and lovely to sing.',
          times: 6,
          every: 'week',
          prompt: 'What did you learn this week, and what does it carry?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'House, forest and water',
      intro:
        'Four weeks of practice. You learn to keep the house spirit, make a proper treba and simple rite, behave well in the forest and by the water, and keep the festivals of the year. Do the practices even on days when you don’t feel much.',
      days: 28,
      lessons: [
        {
          id: 's-house',
          title: 'The domovoi and the household spirits',
          summary: 'Who the domovoi is, how to feed and keep him, the spirits of the bathhouse, barn and yard, and what to do when you move.',
          minutes: 8,
          sections: [
            {
              heading: 'Grandfather of the house',
              body:
                'In East Slavic belief every house had a domovoi, “the one of the house”. People rarely used the name; they called him dedushka (grandfather), khozyain (master) or simply “himself”. He lived behind or under the stove, or under the threshold, and was imagined as a small, hairy old man, sometimes looking like the head of the family. A content domovoi kept the household healthy and the animals thriving; an offended one banged pots, hid things, pinched sleepers and tormented the horses. In Poland and among the West Slavs similar spirits are known as skrzat, ubożę or, in Czech, hospodáříček.\n\nMany folklorists think the domovoi was originally a founding ancestor of the household, which is why he is “grandfather”.',
            },
            {
              heading: 'Feeding the house spirit',
              body:
                'Traditional offerings were simple: bread and salt, a bowl of milk, porridge, the crust of the loaf, crumbs left on the table at night. W. R. S. Ralston, writing in 1872, records that on 28 January peasants left a pot of porridge for the domovoi on the hearth, surrounded by hot embers. The spirit was greeted on feast days, and people avoided swearing near the stove.\n\nYou can keep him with a small dish near your cooker, radiator or the warmest place in your home: a piece of bread with salt, a spoonful of porridge, a little milk, renewed weekly. Speak to him politely as grandfather. Keep the kitchen clean; an untidy house was said to annoy him.',
            },
            {
              heading: 'Moving house',
              body:
                'The domovoi did not change houses by himself; he had to be invited. Ralston describes the old woman of the family raking burning embers from the old stove into a clean jar, covering it with a white cloth, opening the door, turning to the stove and saying “Welcome, dyedushka (grandfather) to our new home!”, then carrying the jar to the new house. Others carried an old bast shoe, a lapot, and invited the spirit to ride in it. You can do the same with a candle lit from your old home or a piece of bread from its kitchen.',
            },
            {
              heading: 'Bathhouse, barn and yard',
              body:
                'Other buildings had their own spirits. The bannik lived in the bathhouse (banya): people left him water, soap and a birch broom, and avoided bathing late at night, when the “fourth steam” was his. The ovinnik guarded the threshing barn, the dvorovoi the farmyard, and the kikimora, a troublesome female spirit, was linked with spinning and the night. You probably don’t have a barn, but you might have a bathroom, a garden or a balcony. Many practitioners greet the spirits of each and keep them tidy.',
            },
          ],
          knowAndDont: {
            known:
              'Belief in the domovoi and other household spirits is richly documented in East and West Slavic folklore from the eighteenth to the twentieth centuries, with consistent customs: euphemistic names, offerings of bread, salt, milk and porridge, and moving rites with embers or a bast shoe.',
            unknown:
              'Whether the domovoi was originally an ancestor, a nature spirit or something else is unknown. Customs varied from village to village, and very little evidence exists for household spirits before the modern era.',
          },
          inPractice:
            'Keep a small dish for the house spirit near the warmest place in your home, renew it weekly and greet him as grandfather. Keep the kitchen clean. If you move, carry a light or bread from the old home and invite him to come.',
          reflect: [
            'Where is the warm heart of your home, the place a domovoi would live?',
            'How does it feel to treat your home as having its own spirit? What would you like to ask of him?',
          ],
          further: [
            'W. R. S. Ralston, The Songs of the Russian People (1872, public domain), chapter II, on the Domovoy and household spirits',
            'Linda J. Ivanits, Russian Folk Belief (1989)',
          ],
          library: ['traditional/herb/birch'],
          premade: ['hedge-house-spirit-offering', 'kitchen-hearth-blessing'],
        },
        {
          id: 's-treba',
          title: 'Treba: offerings and the shape of a rite',
          summary: 'What to offer, how to give it, the shape of a modern Rodnover rite, and what not to do.',
          minutes: 7,
          sections: [
            {
              heading: 'What to offer',
              body:
                'The traditional offerings of Slavic folk religion are the foods of a farming household: bread above all, salt, honey, milk, eggs, porridge (kasha) of millet or buckwheat, kutia (boiled wheat with honey and poppy seed), blini, cheese, beer, kvass and mead. Sources from Procopius to the Baltic chroniclers mention animal sacrifice, which modern Rodnovers sometimes replace with bread baked in animal shapes; this app does not ask for animal offerings.\n\nThe word treba, used by Rodnovers for offering or sacrifice, comes from Old Slavic; medieval Church writers used it for the offerings of the pagans.',
            },
            {
              heading: 'How to give',
              body:
                'Give the best and the first: a whole round loaf, the first spoonful, the first glass. Speak as you give, saying whom it is for and why. Give to fire for the gods (burn a little bread or pour a drop of mead on a candle-safe dish or an outdoor fire), to the earth for the dead and the land, to the water for water spirits, and leave it at the stove for the house spirit. Walk sunwise (posolon) around the fire or shrine.\n\nAfter a rite, Rodnovers usually share the rest of the food among the people present, a feast that joins gods and people. What was given directly to the gods or spirits is not eaten.',
            },
            {
              heading: 'The shape of a basic rite',
              body:
                'There is no surviving pagan Slavic liturgy, so modern rites follow folk patterns and common sense. A simple, widely used shape: cleanse yourself and the space (water, often with birch or herbs); kindle the fire; call the gods, ancestors and spirits, with praise, often ending each call with “Slava!”; give the treba with words of thanks or request; drink from a shared cup or horn, pouring the first drop for the gods; sing or speak in silence; close with thanks, and share the feast.\n\nIn a group, a volkhv or leader speaks for the community, and people join hands and circle the fire. At home, you do the same on a small scale.',
            },
            {
              heading: 'What not to do',
              body:
                'Don’t offer what you wouldn’t eat yourself, or what is stale or spoiled. Don’t throw bread on the ground carelessly; bread is sacred in Slavic custom, and dropped bread was kissed and picked up. Don’t take back an offering. Don’t leave food that will harm pets or wildlife: no chocolate, grapes, raisins, onion or garlic in anything left outdoors. Be careful with poppy seeds and raisins in kutia around dogs and cats.',
            },
          ],
          knowAndDont: {
            known:
              'Folk and medieval sources describe offerings of bread, salt, honey, cheese, porridge, eggs and drinks; the chroniclers describe animal sacrifice, sacred feasts and drinking from horns among the Baltic Slavs; the reverence for bread is a living custom.',
            unknown:
              'No pagan Slavic rite survives in full. Modern Rodnover rites, terms such as treba and kapishche, and the cry “Slava!” combine old words with new practice.',
          },
          inPractice:
            'A weekly treba at home: light a candle, sprinkle water, call the gods and ancestors, give bread, salt and a drink, speak, sit in silence, thank, and share the rest of the bread with your household.',
          reflect: [
            'What food in your home feels sacred enough to give to the gods?',
            'How did it feel to say “Slava!” aloud? Does it fit you?',
          ],
          further: ['Linda J. Ivanits, Russian Folk Belief (1989)', 'Kaarina Aitamurto, Paganism, Traditionalism, Nationalism (2016)'],
          library: ['traditional/vessel/offering_bowl'],
          premade: ['kitchen-prosperity-bread'],
        },
        {
          id: 's-wild',
          title: 'Forest, field and water spirits',
          summary: 'The leshy, vodyanoy, rusalki, poludnitsa and vila: what folklore says about them, and the courtesy that keeps you safe.',
          minutes: 8,
          sections: [
            {
              heading: 'The forest master',
              body:
                'The leshy (from les, “forest”) was the master of the woods in East Slavic folklore. He could be as tall as the trees or as small as a blade of grass, laughed and whistled, and led travellers astray until they were lost. Hunters and shepherds made bargains with him, leaving bread, salt or pancakes on a stump, or the first of the catch. If you found yourself lost in the woods, the cure was to turn your clothes inside out, or put your shoes on the wrong feet, and the leshy’s spell would break.\n\nIn the forest, greet him as you enter, don’t whistle or shout carelessly, take only what you need, and leave a little bread at a stump if you have gathered mushrooms or berries.',
            },
            {
              heading: 'The water master',
              body:
                'The vodyanoy, the water master, lived in deep pools, millponds and whirlpools. He was imagined as an old man with a green beard, covered in mud and weeds. Millers and fishermen paid him with offerings, sometimes tobacco, bread or the first fish of the season thrown back. He could drown the careless. People were warned not to swim at night, at noon or alone, and not to boast by the water.\n\nThese stories carry a real lesson: water is dangerous. Respect it, swim safely, and never take children near it unwatched.',
            },
            {
              heading: 'Rusalki, poludnitsa and vila',
              body:
                'In East Slavic folklore rusalki were often said to be the spirits of drowned young women or girls who died before marriage. In Rusalnaya week, the Green Week around Trinity or Pentecost, they were said to come out of the water to swing in the birches and dance in the fields, and people avoided swimming then. Wormwood was a protection; in one well-known tale a rusalka asks a passer-by whether they carry wormwood or parsley, and answering wormwood saves them. Earlier, rusalki may have been spirits of moisture and fertility, honoured with birch wreaths and embroidered offerings.\n\nThe poludnitsa, the noon-woman, walked the fields at harvest noon and punished those who worked through the heat (a folk warning against sunstroke). Among the South Slavs, the vila was a beautiful and dangerous spirit of mountains, clouds and springs; her dance circles could be seen in the grass.',
            },
            {
              heading: 'The courtesy that keeps you safe',
              body:
                'The old customs are mostly about courtesy and caution. Greet the place. Ask, at least silently, before gathering. Leave a little bread or a drink. Don’t litter or break branches for no reason. Stay away from the water at night. Many practitioners carry a sprig of wormwood or mugwort in summer, and keep a little salt and bread with them in the woods. Carry them, don’t eat or brew them: both are best avoided altogether in pregnancy, and wormwood is toxic in quantity. And never eat a wild mushroom or berry you have not identified with certainty.\n\nThis journey does not teach calling up these beings. The folk tradition is clear that they are not pets, and that some of them are best left alone.',
            },
          ],
          knowAndDont: {
            known:
              'The leshy, vodyanoy, rusalki, poludnitsa and vila are richly documented in nineteenth- and twentieth-century folklore, with consistent customs of offering and avoidance. Procopius already mentions offerings to rivers, nymphs and other spirits in the sixth century.',
            unknown:
              'How these beings were understood before Christianity is unknown, and their character changed over time and between regions; the rusalki in particular may once have been fertility spirits and only later became the restless dead.',
          },
          inPractice:
            'Greet the forest and the water when you arrive, leave bread or a drink at a stump or a bank, gather with thanks, and carry wormwood in summer. Never go into the water alone at night.',
          reflect: [
            'Which wild places do you visit? Who might be their master, and how will you greet them?',
            'What do these stories teach about real danger, and about respect?',
          ],
          further: [
            'Linda J. Ivanits, Russian Folk Belief (1989)',
            'Alexander Afanasyev, Russian Fairy Tales (trans. Norbert Guterman, 1945)',
          ],
          library: ['traditional/herb/wormwood', 'traditional/herb/mugwort', 'traditional/herb/birch'],
          premade: ['hedge-hearing-the-land-walk', 'sea-river-flower-offering', 'hedge-warding-before-spirit-work'],
        },
        {
          id: 's-winter-spring',
          title: 'Koliada, Maslenitsa and Marzanna',
          summary: 'The winter and spring festivals: carols and the Holy Supper, the butter week of pancakes, and the drowning of winter.',
          minutes: 8,
          sections: [
            {
              heading: 'Koliada',
              body:
                'Koliada is the midwinter festival, now joined to Christmas. The name comes from the Latin kalendae, the first day of the month, borrowed early from the Roman new year; a god called Koliada is not reliably attested. On Christmas Eve (Sviatyi Vechir in Ukraine, Wigilia in Poland) the family waits for the first star, then shares a meatless supper, in Ukraine traditionally of twelve dishes, with kutia of wheat, honey and poppy seed at the centre. A place is set for the dead, or for a wanderer; hay is laid under the tablecloth; a sheaf of grain, the didukh (“grandfather”), stands in the corner as a home for the ancestors. Carollers go from house to house with a star and sometimes a goat costume, singing koliadki that bless the household, and are given food and coins.\n\nRodnovers keep Koliada at the winter solstice as the birth of the new sun. At home: a supper with a place for the dead, kutia, a candle in the window, and a carol.',
            },
            {
              heading: 'Maslenitsa',
              body:
                'Maslenitsa, “butter week”, is the East Slavic carnival before the Orthodox Lent: a week of pancakes (blini), round and golden like the sun, sledging, fist fights, visiting in-laws and fun. On the last day, Forgiveness Sunday, people ask each other’s forgiveness, and a straw effigy of Lady Maslenitsa is burned to see off winter. Although it is tied to the Christian calendar, its sun-shaped food and effigy-burning have long been read as older spring rites.\n\nAt home: bake blini, give the first one to the ancestors or the house spirit (it was often left on a windowsill), and ask forgiveness of anyone you have wronged.',
            },
            {
              heading: 'Marzanna',
              body:
                'In Poland, the Czech lands, Slovakia and among the Sorbs, a straw effigy of Marzanna (Morana, Smrtka, “Death”) was dressed in rags and carried out of the village in mid-Lent, then burned or drowned in a river while people sang that they were carrying death out and bringing summer in. Coming back, they carried a green branch or a decorated tree (the gaik or líto) to welcome spring, and nobody looked back at the river. Church records complained about it as early as the fifteenth century. Today Polish children drown Marzanna on the first day of spring, 21 March.\n\nYou can make a small Marzanna from straw, twigs and a scrap of cloth (natural materials only), carry her to running water or burn her safely, and bring home a green branch. Use only materials that won’t harm the river, and throw her in from the bank: March water is cold enough to be dangerous.',
            },
            {
              heading: 'Honest dating',
              body:
                'All three festivals are well recorded in folk custom; their pagan origins are likely but mostly unprovable. Maslenitsa and Marzanna move with the Christian calendar of Lent and Easter in tradition, while many Rodnovers fix them to the spring equinox. Either is valid; know which you are doing.',
            },
          ],
          knowAndDont: {
            known:
              'Christmas Eve customs (kutia, the didukh, a place for the dead, carolling), Maslenitsa’s blini and effigy and the carrying-out of Marzanna are well documented across the Slavic world, with Church complaints about Marzanna dating to the fifteenth century.',
            unknown:
              'There is no evidence for gods named Koliada or Maslenitsa. Marzanna appears in late Polish writings as a goddess, but whether she was ever worshipped is uncertain. Fixing these festivals to the solstice and equinox is a modern Rodnover practice.',
          },
          inPractice:
            'At Koliada: a meatless supper with kutia, an empty place for the dead and a carol. At Maslenitsa: blini, the first one for the ancestors, and asking forgiveness. At Marzanna: a small natural effigy sent away on the water and a green branch brought home.',
          reflect: [
            'Whom would you set a place for at your Koliada supper?',
            'What winter are you ready to carry out of your life, and what green thing do you want to bring home?',
          ],
          further: [
            'Ronald Hutton, The Stations of the Sun (1996), for comparison',
            'W. R. S. Ralston, The Songs of the Russian People (1872, public domain)',
          ],
          library: ['traditional/deity/morana'],
          premade: ['hedge-ancestor-candle-evening', 'kitchen-prosperity-bread'],
        },
        {
          id: 's-summer-autumn',
          title: 'Kupala, harvest and Dziady',
          summary: 'Midsummer fire and water, Perun’s day, the last sheaf for Veles, and feeding the forefathers in autumn.',
          minutes: 8,
          sections: [
            {
              heading: 'Kupala Night',
              body:
                'Kupala Night, the eve of St John the Baptist (23–24 June, or 6–7 July in the Julian calendar), is the great midsummer festival of fire and water, known as Ivan Kupala in the east and Noc Kupały or Sobótka in Poland. Young people wove wreaths of wild flowers and herbs and floated them on rivers with candles to see whom they would marry; they jumped over bonfires in pairs; they bathed in rivers or in the dawn dew; herbs gathered that night were thought especially strong. Late at night, the brave went into the forest to look for the fern flower, which blooms only on Kupala Night and grants luck or hidden treasure (ferns don’t flower; that is the point of the story).\n\nAt home: weave a wreath of flowers and herbs such as St John’s wort and mugwort, float it on a river from a safe bank (with no wire, plastic or candle wax that will harm the water), and light a candle or a safe fire. If you jump a fire, keep it small, tie back hair and loose clothes and never jump after drinking; if you bathe at dawn, go with someone, in water you know, and never swim at night.',
            },
            {
              heading: 'Perun’s day and harvest',
              body:
                'Ilya’s day, 20 July in the Julian calendar (2 August Gregorian), was the feast of thunder in East Slavic folk religion: people feared storms, didn’t work in the fields and sometimes shared a communal feast, including a bull or ram slaughtered together in some regions. Rodnovers keep it as Perun’s day, with oak leaves, beer or mead and a fire.\n\nHarvest ended with Dozhynki (dożynki in Polish): a wreath or a figure made from the last sheaf was carried in procession and kept in the house, and a few ears were left standing in the field, knotted together, with bread and salt laid on the ground beside them, and called “the beard”. Ralston (1872) records the Russian name “the plaiting of the beard of Volos”; elsewhere it was Elijah’s or the Saviour’s beard, a gift for the spirit of the field, the ancestors or the saint. The link to Veles rests chiefly on that name. If you have a garden, leave the last of the harvest; if not, give the first or last loaf of autumn bread to the land.',
            },
            {
              heading: 'Dziady',
              body:
                'Dziady, “the forefathers” or “grandfathers”, are the feasts of the dead kept several times a year in Belarus, Ukraine, Lithuania and eastern Poland, the most important in autumn, around 1–2 November or on the Saturday before St Demetrius’s day. In Belarusian custom, the family cleaned the house, opened the door or window, and the head of the house invited the dead in by name to eat. The first spoonful of each dish was put aside for them, sometimes on the windowsill; people ate in quiet; nobody banged a spoon or put out a candle; one blew on a bench before sitting, in case a soul was sitting there. The table was left uncleared overnight. Adam Mickiewicz’s great Polish drama Dziady (1823–32) made the rite famous.\n\nThe spring Dziady, Radunitsa, falls about a week after Orthodox Easter, when families take eggs and food to the graves.',
            },
            {
              heading: 'Keeping them now',
              body:
                'Keep Kupala outdoors if you can, with water and fire. Keep Perun’s day in a thunderstorm season, with oak and mead. Keep the harvest with bread. Keep Dziady at home with your dead: a supper, a spoonful set aside of each dish, their names spoken, the door opened and closed, and the offerings not eaten afterwards but given to the earth.\n\nRemembering the dead can bring grief close. If a loss is recent, keep the festival as gently as you need, and lean on the living as well: family, friends, a bereavement service or your doctor.',
            },
          ],
          knowAndDont: {
            known:
              'Kupala customs (wreaths, fires, bathing, herbs, the fern flower), Ilya’s day storm customs, Dozhynki and the last sheaf, and the Dziady ancestor suppers are all richly documented in East and West Slavic ethnography.',
            unknown:
              'Kupala as a god is doubtful; the name may come from the word for bathing. The identification of Ilya’s day with Perun and of the last sheaf with Veles is reasonable inference, not proven. Pre-Christian forms of the ancestor feasts are unknown, though Church writers condemned similar customs from the Middle Ages.',
          },
          inPractice:
            'At Kupala: a flower wreath on running water and a candle or fire. At harvest: bread for the land and a sheaf or bunch of grain at the shrine. At Dziady: a quiet supper for the dead, with a spoonful set aside and names spoken.',
          reflect: [
            'What would you float downstream on your Kupala wreath?',
            'Which of your dead do you most want to invite home at Dziady? What did they love to eat?',
          ],
          further: [
            'Adam Mickiewicz, Dziady (Forefathers’ Eve), Parts II and IV (1823), English translations available',
            'Linda J. Ivanits, Russian Folk Belief (1989)',
          ],
          library: ['traditional/herb/st_johns_wort', 'traditional/herb/mugwort', 'traditional/deity/perun', 'traditional/deity/veles'],
          premade: ['folk-kupala-wreath', 'folk-dziady-meal', 'hedge-ancestor-candle-evening'],
        },
      ],
      practices: [
        {
          id: 's-prac-house',
          title: 'Greeting grandfather',
          instructions:
            'Each day, greet the house spirit when you wake or come home, with a word or a nod towards the stove. Once a week, renew his dish of bread and salt, milk or porridge, and tidy the kitchen.',
          times: 28,
          every: 'day',
          prompt: 'How was the house today? Did anything feel different?',
          premade: 'hedge-house-spirit-offering',
        },
        {
          id: 's-prac-treba',
          title: 'Weekly treba to a god',
          instructions:
            'Each week, make a fuller offering to one god in turn: Perun (oak leaves, beer or mead, or honeyed water if you don’t drink), Veles (bread, milk, honey, a coin), Mokosh (thread, grain, bread, ideally on a Friday), Dazhbog (at sunrise, with honey and light). Follow the shape of a basic rite from the lesson.',
          times: 4,
          every: 'week',
          prompt: 'Which god did you honour, and what did you notice?',
        },
        {
          id: 's-prac-wild',
          title: 'A walk to forest or water',
          instructions:
            'Once in this stage, go to a wood or to water. Greet the place on arrival, walk quietly, leave a little bread or a drink at a stump or on the bank, and thank the place as you leave.',
          times: 1,
          prompt: 'What did you notice? Did the place feel like it had a master?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Sitting with it',
      intro:
        'A week to step back and ask whether this path is yours. There is no wrong answer. Choosing to pause, to keep going without dedicating, or to follow a different path or god are all good outcomes, and the house spirit will not be offended.',
      days: 7,
      lessons: [],
      practices: [
        {
          id: 's-disc-ancestors',
          title: 'Ask the ancestors',
          instructions:
            'Light a candle for your ancestors, set out bread and a drink, and ask them aloud whether this path is good for you. Then sit quietly and write whatever comes, without judging it.',
          times: 1,
          prompt: 'What did you hear, or feel, or think, when you asked?',
        },
      ],
      questions: [
        'Have you kept the house spirit and the weekly treba, and do you want to keep doing it?',
        'Are you drawn to particular Slavic gods, a particular people’s customs, or the household and folk practice? Which is it?',
        'Can you live with how little is known, and with honouring reconstruction as reconstruction?',
        'Are you comfortable with the work of finding (or avoiding) communities, given the nationalist strands in some?',
        'Do you want to learn a Slavic language and its songs, or is this a path you will walk in your own language?',
        'Is something else calling louder, another path or another god? It is a good outcome to go and follow it.',
        'Would it be wiser to pause for a season and come back at the next festival?',
      ],
    },
    {
      kind: 'dedication',
      title: 'Dedication at the fire',
      intro:
        'If you choose to, you now dedicate yourself to the Slavic path. This is a self-dedication: a promise you make, in your own words, to the gods, ancestors and spirits you have come to know. It is not an initiation, does not make you a volkhv or a member of any Rodnover community, and does not replace any community’s own rites of joining. Choose a meaningful day: a festival, a Friday for Mokosh, a stormy day for Perun, or sunrise for Dazhbog.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 's-ded-vow',
          title: 'Write your vow',
          instructions:
            'Write a short dedication: whom you are dedicating to, what you promise (keep the house spirit, keep the festivals, honour the ancestors, practise hospitality, study), and for how long; a year is a good start. Promise only what you can keep. Bake or buy a round loaf for the rite.',
          times: 1,
          prompt: 'Read your vow aloud. Does every word feel true?',
        },
      ],
      rite: {
        title: 'Rite of self-dedication',
        summary:
          'A dedication at the fire or candle: cleansing with water and birch, bread and salt for the gods, ancestors and house spirit, a vow sealed with a shared cup, and a token tied on.',
        minutes: 45,
        ingredients: [
          { name: 'A candle, or a small outdoor fire where it is safe and allowed', ref: 'traditional/candle/white' },
          { name: 'A round loaf on an embroidered or white cloth' },
          { name: 'Salt', ref: 'traditional/vessel/dish' },
          { name: 'A bowl of clean water, ideally from a spring or river', ref: 'traditional/vessel/bowl' },
          { name: 'A cup or horn of mead, beer, kvass or honeyed water' },
          { name: 'A birch twig or a bunch of herbs for sprinkling', ref: 'traditional/herb/birch', optional: true },
          { name: 'A red thread, an embroidered band or another token' },
          { name: 'Your written vow' },
        ],
        preparation:
          'Clean the house and the beautiful corner. Bathe, and dress in clean clothes; embroidered clothing is traditional for festivals. Set the bread and salt on the cloth, the cup and water on the shrine. If you are outdoors, prepare the fire and keep water by it.',
        steps: [
          {
            title: 'Cleansing',
            instructions: 'Dip the birch twig or your fingers in the water and sprinkle yourself and the space, walking sunwise around it.',
            spoken: 'With living water I wash away what is stale. I come clean to the gods.',
          },
          {
            title: 'Kindling',
            instructions: 'Light the candle or fire.',
            spoken: 'Fire of Svarozhich, fire of the hearth and the sun: burn bright for this day.',
            light: true,
          },
          {
            title: 'Calling the gods, ancestors and spirits',
            instructions:
              'Call each in turn, by name if you have them: your gods, your ancestors, the house spirit, the spirits of the land. End each call with “Slava!”',
            spoken:
              'Gods of the old ways, I call you: be welcome. Slava!\nForefathers and foremothers, I call you: be welcome. Slava!\nGrandfather of this house, spirits of this land: be welcome. Slava!',
            minutes: 5,
          },
          {
            title: 'Bread and salt',
            instructions:
              'Break the loaf. Dip a piece in salt and give it to the fire or set it on the shrine for the gods; another for the ancestors; a third for the house spirit at the stove.',
            spoken: 'Bread and salt I give you, as to honoured guests. Eat with me, and know me.',
          },
          {
            title: 'The vow',
            instructions: 'Hold the cup, stand facing the fire, and read your vow aloud. Speak slowly and clearly.',
          },
          {
            title: 'Sealing with the cup',
            instructions:
              'Pour the first drop of the cup onto the fire (if it is a real fire) or into the offering bowl for the gods, then drink. Tie the red thread or token around your wrist.',
            spoken: 'My word is given, my word is sealed. Let the gods and the ancestors bear witness. Slava!',
          },
          {
            title: 'Listening',
            instructions: 'Sit quietly with the fire. Notice what you feel. If you wish, sing a folk song you have learned.',
            minutes: 10,
            timed: true,
          },
          {
            title: 'Thanks and closing',
            instructions: 'Thank everyone you called, in reverse order, and snuff the candle or let the fire burn down safely.',
            spoken: 'Thanks to you, spirits of this land and of this house. Thanks to you, ancestors. Thanks to you, gods. Slava!',
            snuff: true,
          },
        ],
        closing:
          'Share the rest of the loaf with your household or friends, as a feast. Leave the gods’ and ancestors’ portions overnight, then return them to the earth or running water. Keep your vow in the beautiful corner and reread it at Koliada.',
        safety:
          'Only light outdoor fires where it is safe and allowed, keep water nearby and put the fire out completely. Never leave a candle unattended. Don’t pour alcohol onto a large flame; a few drops only, or pour it into a bowl. Honeyed water or fruit juice serves as well as mead, beer or kvass (which has a little alcohol), especially if you don’t drink. Keep salt and bread offerings away from pets.',
      },
    },
    {
      kind: 'ongoing',
      title: 'The turning year',
      intro:
        'The dedication is a beginning. Keep the house spirit through the year, the four festivals of Koliada, Marzanna, Kupala and Dziady (and Maslenitsa, Perun’s day and the harvest as you can), and renew your vow each Koliada at the turn of the sun.',
      days: 365,
      lessons: [],
      practices: [
        {
          id: 's-ong-festivals',
          title: 'Keeping the festivals',
          instructions:
            'At Koliada, Marzanna, Kupala and Dziady, keep at least one real folk custom from the lessons, make a treba and share food with someone.',
          times: 4,
          every: 'holy-day',
          prompt: 'Which festival was this, what custom did you keep, and what did it teach you?',
        },
        {
          id: 's-ong-friday',
          title: 'A monthly Friday for Mokosh, or a god of your own',
          instructions:
            'Once a month, give a day to a god you are close to: a Friday for Mokosh with spinning or handiwork and bread; a stormy day for Perun; a sunrise for Dazhbog. Keep the house spirit’s dish fresh at the same time.',
          times: 12,
          every: 'month',
          prompt: 'Which god did you honour this month, and how is the relationship growing?',
        },
        {
          id: 's-ong-renew',
          title: 'Koliada rededication',
          instructions:
            'At Koliada, reread your vow by candlelight after the Holy Supper. Keep what is still true, change what is not, and renew it with bread, salt and the cup.',
          times: 1,
          prompt: 'What have you kept this year, and what do you promise for the next?',
        },
      ],
    },
  ],
  sources: [
    'Procopius, History of the Wars VII.14.22–23, trans. H. B. Dewing, Loeb vol. IV (1924), public domain in the US: https://archive.org/details/procopius0004proc (quoted: “For they believe that one god, the maker of the lightning, is alone lord of all things, and they sacrifice to him cattle and all other victims”; “They reverence, however, both rivers and nymphs and some other spirits, and they sacrifice to all these also, and they make their divinations in connection with these sacrifices”).',
    'W. R. S. Ralston, The Songs of the Russian People (1872), public domain, ch. II, pp. 121 and 137: https://archive.org/details/songsofrussianpe00ralsuoft (quoted, verified: “Welcome, dyedushka (grandfather) to our new home!”, p. 137; the 28 January porridge offering, p. 121, paraphrased); ch. III, p. 251, “the plaiting of the beard of Volos” at harvest.',
    'The Russian Primary Chronicle (Povest’ vremennykh let), entries for 907, 945, 971, 980, 988 and 1071; paraphrased, apart from the three-word phrase “the god of cattle”. The standard English translation (Cross & Sherbowitz-Wetzor, 1953) is still in copyright and is recommended, not quoted.',
    'Thietmar of Merseburg, Chronicon VI.23–25; Helmold of Bosau, Chronica Slavorum, Book I; Saxo Grammaticus, Gesta Danorum XIV; Lives of Otto of Bamberg; Maurice, Strategikon XI.4; paraphrased, not quoted.',
    'Vyacheslav Ivanov & Vladimir Toporov, Issledovaniya v oblasti slavyanskikh drevnostey (1974), for the reconstructed Perun–Veles myth; Radoslav Katičić, Božanski boj (2008).',
    'Stella Rock, Popular Religion in Russia: “Double Belief” and the Making of an Academic Myth (2007); Eve Levin, “Dvoeverie and Popular Religion” (1993).',
    'Linda J. Ivanits, Russian Folk Belief (1989), for household and nature spirits and the folk calendar.',
    'Kaarina Aitamurto & Scott Simpson (eds.), Modern Pagan and Native Faith Movements in Central and Eastern Europe (2013); Kaarina Aitamurto, Paganism, Traditionalism, Nationalism (2016), for modern Rodnovery.',
  ],
};
