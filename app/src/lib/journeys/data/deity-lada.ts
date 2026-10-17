import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-lada',
  kind: 'deity',
  paths: ['slavic'],
  deityRef: 'traditional/deity/lada',
  title: 'Lada, Harmony of Spring',
  summary: 'A lunar month with Lada, honoured today as the Slavic goddess of love, spring and harmony: an honest look at whether she was ancient, the songs and spring customs she gathers, and a joyful devotion of song, flowers and peace-making.',
  welcome: `This is a month-long self-dedication to Lada, whom modern Slavic pagans honour as the goddess of love, spring, marriage and harmony. You will learn something unusual: that scholars seriously doubt she was an ancient goddess at all, and why her devotion can still be real and good today. You will learn the spring songs and customs that carry her name, keep nine nights of flowers and song, and decide at the end whether to dedicate yourself to her.

It is a dedication, not an initiation. It joins you to no group. It is a promise you make to her, and it is mostly kept by how you treat the people you love.

This journey welcomes every kind of love and every kind of household.`,
  about: `The word lado or lada rings through East Slavic and Polish spring, wedding and midsummer songs, often as a refrain, and in folk speech it means a beloved or a spouse; the root lad means harmony and getting along. Whether there was ever a goddess behind it is one of the open questions of Slavic studies. She is absent from every early source, including Vladimir’s pantheon of 980. She first appears as a deity in the fifteenth-century Polish chronicler Jan Długosz, who made her the Polish Mars, a war god, and then in seventeenth-century Ukrainian writings that call Lado a god of marriage and merriment. Nineteenth-century Romantic scholars turned her into a Slavic Venus or Freyja, the Polish scholar Aleksander Brückner argued she was only a misread song refrain, and the Soviet archaeologist Boris Rybakov made her a great mother goddess with her daughter Lelya. Today Rodnovers honour her with real love and joy at spring festivals and weddings, with flowers, songs, round dances, honey and bread. She is best approached as a modern devotional figure built on old songs, which is honest and does not make her less worth loving.`,
  notes: [
    'Lada may be a later scholarly or folk construct rather than an ancient goddess. This journey says so plainly and treats modern devotion to her as valid on its own terms.',
    'Her daughter Lelya, and the shepherd Lel, come largely from nineteenth-century scholarship and from Ostrovsky’s 1873 play The Snow Maiden; Rybakov’s mother–daughter pair is twentieth-century.',
    'Harmony is not the same as keeping the peace at any cost. Nothing in a devotion to Lada asks anyone to stay in a harmful or abusive relationship. If you are not safe at home, contact a domestic abuse service: in the UK the National Domestic Abuse Helpline (0808 2000 247), in the US the National Domestic Violence Hotline (1-800-799-7233), or your local emergency number if you are in danger now.',
    'Lada is a goddess of love in modern practice, and this journey welcomes every kind of love: same-sex, queer, polyamorous, chosen family and friendship, as well as marriage.',
    'Some Rodnover groups carry nationalist or racial politics or narrow views of women’s roles. This app is inclusive.',
  ],
  holyDays: ['marzanna', 'kupala'],
  stages: [
    {
      kind: 'threshold',
      title: 'A wreath at the door',
      intro: 'You begin with something bright and simple: a few flowers or green branches, a little honey, a song, and your name spoken to her. Lada is approached with joy rather than solemnity.',
      days: 1,
      lessons: [],
      practices: [
        {
          id: 'lada-threshold-journal',
          title: 'Where harmony lives',
          instructions: 'After the opening rite, write about the relationships in your life where you feel most at ease, and those where there is friction. Do not judge them; just notice. Note too what you already believe about Lada and where you learned it.',
          times: 1,
          prompt: 'Where in my life is there lad, real harmony, and where is it missing?',
        },
      ],
      rite: {
        title: 'Introduction with flowers and song',
        summary: 'A small ring of flowers or green twigs, honey and bread, a hummed song, and your name.',
        minutes: 20,
        ingredients: [
          { name: 'A few fresh flowers or green birch or willow twigs', ref: 'traditional/herb/birch' },
          { name: 'A little honey on a spoon or saucer' },
          { name: 'A small piece of bread or cake' },
          { name: 'A pink, white or green candle', ref: 'traditional/candle/pink', optional: true },
          { name: 'Thread or a hair tie to bind the flowers' },
        ],
        preparation: 'Choose a bright time of day, morning if you can. Open a window or a door. Bend the flower stems or twigs into a little ring the size of your palm and bind it with thread. Set it on a clean plate with the honey and bread.',
        steps: [
          {
            title: 'Open the house',
            instructions: 'Open a window or door to let in air and light. Stand or sit comfortably and take a few easy breaths. Smile if you can; it is part of the rite.',
            minutes: 2,
          },
          {
            title: 'Light, if you wish',
            instructions: 'Light the candle if you are using one.',
            light: true,
          },
          {
            title: 'Greet her',
            instructions: 'Speak warmly, as to someone you are glad to see.',
            spoken: 'Lada, Lada, bright one of the spring,\ngoddess of the good word and the kept peace,\nI greet you with flowers and an open door.',
          },
          {
            title: 'Name yourself',
            instructions: 'Tell her your name, where you live, and why you have come. You might tell her about someone you love.',
            minutes: 3,
          },
          {
            title: 'Give honey and bread',
            instructions: 'Touch a drop of honey to the bread and set them before the little wreath.',
            spoken: 'Honey for sweetness, bread for the table we share.\nThis is my small gift.',
          },
          {
            title: 'Sing',
            instructions: 'Hum or sing anything gentle for a minute or two: a lullaby, a folk song, a tune your family sang. Old spring songs were sung for her with the refrain “oi, lado.” If you are shy, hum.',
            minutes: 3,
          },
          {
            title: 'Close',
            instructions: 'Thank her and snuff the candle. Hang the little wreath by your door or window.',
            spoken: 'Thank you, Lada. I will come again.',
            snuff: true,
          },
        ],
        closing: 'Put the bread and honey out for birds or into the earth the next day. Leave the wreath hanging until it dries, then compost it or burn it safely.',
        safety: 'Lilies, tulips, daffodils and many other flowers are toxic to cats and dogs; keep flower offerings out of their reach, and never use lilies if you have a cat. Keep candles away from dried flowers and never leave them unattended. Do not give honey to babies under one.',
      },
    },
    {
      kind: 'study',
      title: 'Learning Lada',
      intro: 'Ten days of reading. You will look honestly at the evidence for Lada, learn the word and the songs she comes from, the spring customs she gathers, and how she is honoured now.',
      days: 10,
      lessons: [
        {
          id: 'lada-question',
          title: 'Was Lada an ancient goddess?',
          summary: 'The honest history: who first named her, how scholars built her up, and who doubted.',
          minutes: 7,
          sections: [
            {
              heading: 'Absent from the early sources',
              body: `Start with what is missing. Lada does not appear in Procopius, in the Rus treaties, in Vladimir’s row of idols in 980, or in the Old Russian sermons that list gods still being worshipped in secret. She is not named in any source from the pagan period or the first centuries after it.

This matters because those sources do name Mokosh, the only goddess on Vladimir’s hill, along with Perun, Volos, Dazhbog, Khors, Stribog and Simargl. If Lada was a major goddess of the East Slavs, her silence is hard to explain.`,
            },
            {
              heading: 'Długosz and the chroniclers',
              body: `She first appears as a deity in the 1400s, in the Annals of the Polish historian Jan Długosz. Długosz wanted the Poles to have a classical pantheon, so he matched names to Roman gods. His Lada is the Polish Mars, a god of war; his Polish Venus is Dzidzilela, and his Ceres is Marzanna. He also mentions a temple on the Łysa Góra mountain where people supposedly honoured Lada, Boda and Leli.

Some two centuries later, a Ukrainian chronicle of the early 1600s, the Hustyn (or Gustyn) Chronicle, followed by the widely read Kievan Synopsis of 1674, describes Lado as “the God of marriage, of mirth, of pleasure, and of general happiness,” to whom people offered sacrifices before a wedding. That is the line Ralston quotes in 1872, and it is the seed of the Lada you know. Notice the gender shift: here Lado is a god, and in Długosz Lada is a war god.`,
            },
            {
              heading: 'The Romantics, the sceptics and Rybakov',
              body: `In the nineteenth century, scholars like Afanasyev in Russia made Lado and Lada a pair, a sun god and a spring goddess, the Slavic Freyr and Freyja. Ralston summed up the “generally received idea” in 1872, and he also noted the other side: “One writer has gone so far as to maintain that Lado and Lada are merely two of the meaningless refrains that occur in Russian songs.”

That view grew stronger. In the early twentieth century the great Polish scholar Aleksander Brückner argued forcefully that the old writers had invented Lada from song refrains and the word for a beloved. Then in 1981 the Soviet archaeologist Boris Rybakov went the other way. He made Lada a great mother goddess, with her daughter Lelya, and read them into embroideries, calendars and archaeological finds. His work was enormously influential among Rodnovers, though many scholars find it speculative.`,
            },
            {
              heading: 'Where that leaves us',
              body: `Most specialists today think a goddess called Lada is doubtful and may be a later construct, made by chroniclers and scholars from a beloved word and a song refrain. Some think a real old spring or marriage figure lies behind the songs and has been lost. Nobody can prove either view.

You can hold this honestly and still love her. Many living religions honour figures who grew in the telling. A goddess whose name means harmony, built by generations out of love songs, spring dances and wedding blessings, is not a fraud. She is a modern goddess with old roots in the songs, and that is how this journey presents her.`,
            },
          ],
          knowAndDont: {
            known: 'Lada is absent from all pagan-era and early Christian sources. She first appears as a deity in Jan Długosz’s fifteenth-century Annals, as a Polish Mars. The seventeenth-century Hustyn Chronicle and Kievan Synopsis call Lado a god of marriage and merriment. Nineteenth-century scholars made her a spring and love goddess; Brückner argued she was a misreading of refrains; Rybakov made her a mother goddess in 1981.',
            unknown: 'Whether any real pagan goddess or god stood behind the refrain “lado” is unknown. Her form, myths, family and worship before the fifteenth century are entirely unattested.',
          },
          inPractice: 'Rodnovers who honour Lada generally do so as a goddess of love and harmony, whatever her age. Write the honest history on the first page of your notebook. When you speak of her to others, try “Lada, as she is honoured today,” rather than “the ancient goddess Lada.”',
          reflect: [
            'Does a god need to be old to be real to me?',
            'How do I feel about devotion that grew from songs and scholarship rather than temples?',
          ],
          further: [
            'W. R. S. Ralston, The Songs of the Russian People (1872), pp. 104–105',
            'Aleksander Brückner, Mitologia słowiańska (1918) and Mitologia polska (1924) (Polish)',
            'Judith Kalik and Alexander Uchitel, Slavic Gods and Heroes (2019), on Długosz and the invented gods',
          ],
          library: ['traditional/deity/lada', 'traditional/deity/mokosh'],
        },
        {
          id: 'lada-word-songs',
          title: 'Lad: the word and the songs',
          summary: 'Harmony, the beloved, and the refrain that rang through spring and wedding songs.',
          minutes: 6,
          sections: [
            {
              heading: 'A word for getting along',
              body: `Whatever you decide about the goddess, the word is ancient and very much alive. In Russian, Ukrainian and Belarusian, lad means harmony, order, concord, the right way of doing things. Ladit’ is to get along with someone, to be in tune. In music, lad is a mode. Something done ladno is done well, smoothly, as it should be.

Ralston puts it beautifully: “Lad means peace, union, harmony, as in the proverb, ‘When a husband and wife have lad, they don’t require also klad (a treasure).’” Whatever else she is, Lada is the goddess of that proverb.`,
            },
            {
              heading: 'The beloved in the songs',
              body: `In folk songs lado and lada are words of love. Ralston notes that they are “constantly used as equivalents, in the one case for lover, bridegroom, or husband,” and in the other for a sweetheart, bride or wife. A girl calls her sweetheart my lado; a husband calls his wife lada. In wedding songs, the young couple are each other’s lado.

So when a spring song sings “oi, dido lado” or “lado, lado,” it might be invoking a goddess, calling on a beloved, or simply keeping the rhythm. Very likely it was all three, depending on who sang it and when. Folk songs carry many layers at once.`,
            },
            {
              heading: 'Lelya, Lel and the Snow Maiden',
              body: `You will often hear of Lada’s daughter Lelya, a maiden of early spring, or of Lel, a shepherd god of love who plays the pipe. The names do turn up in song refrains (leli, lelyo) and in Długosz’s Leli. But the figures as people know them come mostly from the nineteenth century.

Alexander Ostrovsky’s play The Snow Maiden (1873) has a beautiful shepherd called Lel who sings for the sun god, and Rimsky-Korsakov’s opera of 1882 made him famous. Rybakov later made Lelya Lada’s daughter. These are lovely figures, and you can honour them, but know that their source is the stage and the study.`,
            },
            {
              heading: 'Using the old songs',
              body: `You do not need to know Slavic languages to sing for Lada, but learning one simple spring song is a real gift. Ukrainian vesnianky and haivky (spring songs), Russian khorovod songs, and Polish spring songs are all recorded, and many have been released by folk ensembles who learned them from village singers. Look for recordings by groups who work with village sources, and listen for the refrains.

Sing what you learn in your own voice. Lada is not a goddess of perfect performance. In the villages, everyone sang, and the round dance went on whether or not your voice was good.`,
            },
          ],
          knowAndDont: {
            known: 'The words lad, ladit’, lado and lada are well attested and their meanings (harmony, getting along, beloved, spouse) are secure. Lado-type refrains are common in East Slavic spring and wedding songs. Lel is a central character in Ostrovsky’s The Snow Maiden (1873) and Rimsky-Korsakov’s opera (1882).',
            unknown: 'Whether the refrains once addressed a deity is unknown. Lelya as Lada’s daughter is Rybakov’s twentieth-century construction.',
          },
          inPractice: 'Learn one spring song with a “lado” refrain, or simply sing the refrain “oi, lado, lado” to a tune of your own as you tend her shrine. Many modern rites for Lada are mostly singing.',
          reflect: [
            'Whom do I call by a tender name, and what does it ask of me?',
            'Where in my life am I “out of tune,” and what would bring it back into lad?',
          ],
          further: [
            'W. R. S. Ralston, The Songs of the Russian People (1872), the chapter on the old gods',
            'Alexander Ostrovsky, The Snow Maiden (1873); N. Rimsky-Korsakov, Snegurochka (1882)',
          ],
          library: ['traditional/deity/lada'],
          premade: ['kitchen-family-meal-blessing'],
        },
        {
          id: 'lada-spring',
          title: 'Spring customs she gathers',
          summary: 'Calling the spring, larks of dough, the birch at Green Week, and the round dance.',
          minutes: 7,
          sections: [
            {
              heading: 'Calling the spring',
              body: `In Ukraine, Belarus and Russia, spring was not simply waited for; it was called. Girls climbed onto roofs, hills or haystacks in March and sang songs inviting spring to come, the zaklichki or vesnianky. On the feast of the Forty Martyrs, 9 March in the old calendar (22 March in the new), women baked little birds of dough called zhavoronki, larks, and children threw them into the air or put them on poles to call the real birds home.

These are well-recorded customs, kept in some places to this day. None of them names Lada. But they are the world her modern devotion grows in, and many Rodnovers honour her around the spring equinox with exactly these songs and loaves.`,
            },
            {
              heading: 'Red Hill and the wedding season',
              body: `After Easter came Krasnaya Gorka, Red Hill or Beautiful Hill, the Sunday after Easter, when young people gathered on rises of ground to sing, dance in rings and pair off. It opened the season of weddings. Spring songs in which lado means the bridegroom belong here.

Folk weddings themselves were long, elaborate rites with laments for the bride’s girlhood, the braiding and unbraiding of her hair, bread and salt, and songs for the couple. If Lada is the goddess of marriage, these are her rites, though the people singing them were Christian.`,
            },
            {
              heading: 'Birch at Green Week',
              body: `Seven weeks after Easter came Semik and Green Week, the Russian festival of the birch. Ralston writes that “On the Thursday of the seventh week after Easter is held the feast called Semik,” when villagers went out into the woods, sang, wove garlands, and cut a young birch which they dressed in women’s clothes or ribbons and carried home with dancing and song. Other ethnographers record girls bending and plaiting the branches of living birches into wreaths, kissing through them to swear friendship, and coming back days later to read their fortunes from whether the wreaths had withered.

Houses and churches were decked in birch branches for Trinity Sunday. The birch is the tree Rodnovers most link with Lada, and this is why.`,
            },
            {
              heading: 'The round dance',
              body: `The khorovod, the ring dance, ran through the whole warm season, from Easter to Kupala and into harvest. Young people joined hands and moved in a circle, a line or a weaving chain, singing songs that told stories, mimed sowing and spinning, or teased lovers. A khorovod is not a performance; it is a community moving together.

For a solitary practitioner, even walking a slow circle while humming a song is a fitting offering to the goddess of harmony. With friends, a simple ring dance in a park is joyful, and needs no rehearsal.`,
            },
          ],
          knowAndDont: {
            known: 'Spring-calling songs, dough larks on the Forty Martyrs, Krasnaya Gorka gatherings and weddings, birch rites at Semik and Green Week, and round dances are all widely recorded East Slavic folk customs, many still kept.',
            unknown: 'None of these customs is recorded as being for Lada; linking them to her is a modern Rodnover practice. Whether any of them preserve a pre-Christian rite for a love or spring goddess is unknown.',
          },
          inPractice: 'Bake a few dough larks near the spring equinox, sing to call the spring, and set one on her shrine. In early summer, bend a living birch twig gently into a loop without breaking it, as the girls of Semik did, and return a few days later to see how it is.',
          reflect: [
            'Who in my life could I make a bond of friendship with, as the girls did through the birch wreath?',
            'What would it mean to call something into my life, rather than wait for it?',
          ],
          further: [
            'W. R. S. Ralston, The Songs of the Russian People (1872), the chapter on ritual songs of spring',
            'Linda J. Ivanits, Russian Folk Belief (1989), on the calendar year',
            'Ronald Hutton, The Stations of the Sun (1996), for comparison with western spring customs',
          ],
          library: ['traditional/herb/birch', 'traditional/herb/chamomile'],
          premade: ['kitchen-honey-sweetening-cake'],
        },
        {
          id: 'lada-today',
          title: 'Lada today',
          summary: 'How Rodnovers honour her, what harmony really asks, and an inclusive love goddess.',
          minutes: 6,
          sections: [
            {
              heading: 'In the Native Faith',
              body: `In modern Rodnovery Lada is a well-loved goddess of love, spring, beauty, family and harmony. Groups honour her at the spring equinox (often as part of Komoeditsa or Maslenitsa celebrations), at Krasnaya Gorka, through the spring months, and at weddings, where Rodnover priests sometimes ask her blessing on the couple. Offerings are flowers, wreaths, honey, milk, bread, cakes, songs and dances.

Some Rodnover calendars give her particular days; they differ from group to group and are modern. Some groups pair her with Lado or with Svarog, others with Lelya as mother and daughter. Choose what speaks to you and be honest about where it comes from.`,
            },
            {
              heading: 'Harmony is not silence',
              body: `Lad is harmony, not quiet. A household in true lad is one where people can disagree and repair, where work is shared, where each person can speak. That is why reconciliation and peace-making are the best gifts to Lada: an apology, a difficult conversation handled kindly, a long grudge laid down.

But harmony never means putting up with harm. If someone hurts, controls or frightens you, the goddess of lad is not asking you to keep the peace with them. Leaving, getting help, or setting a hard boundary can be the beginning of lad in your own life. If you need help, contact a domestic abuse service or someone you trust.`,
            },
            {
              heading: 'Every kind of love',
              body: `Some Rodnover groups present Lada narrowly as the goddess of marriage between a man and a woman and of large families for the nation. Others welcome every kind of love. This journey stands with the second.

Lada, as she is honoured here, blesses couples of every gender, people who love more than one person, single people who keep a warm household of friends, chosen family, and the deep loves of friendship. The girls of Semik who swore friendship through the birch wreath were doing her work too.`,
            },
            {
              heading: 'A Native Faith wedding',
              body: `Rodnover weddings draw heavily on Slavic folk wedding customs and on modern invention, and Lada is often at the centre. A typical rite takes place outdoors, by a fire, a tree or water. The couple’s hands may be bound with an embroidered towel, the rushnyk, and they walk sunwise around the fire or a sacred tree, often three times. A great round wedding loaf, the korovai, decorated with dough birds and flowers, is blessed and shared. The couple offer bread, honey and flowers to Lada and to the ancestors, and the guests sing.

The towel, the round loaf and the songs are old and well recorded; walking around a fire rather than a church lectern, and calling on Lada, are modern Rodnover choices. Many inclusive groups now hold these rites for couples of any gender.`,
            },
            {
              heading: 'Beauty, without vanity',
              body: `Lada is also honoured as a goddess of beauty. In the folk world, beauty was a spring wreath, an embroidered shirt, a well-sung song, a clean house with flowers in the window. It was something you made and shared, not a standard you measured yourself against.

If you work with her for self-love, keep it in that spirit. Make something beautiful, wear a flower, sing badly and happily. Let her be a goddess of delight rather than of mirrors.`,
            },
          ],
          knowAndDont: {
            known: 'Lada is widely honoured in modern Rodnovery as a goddess of love, spring and harmony, with flowers, songs, honey and dances, at spring festivals and weddings. Groups differ on her family and days, and some hold conservative or nationalist views of family.',
            unknown: 'All of her modern festival dates and family relations are modern. There is no historical model of her worship to reconstruct.',
          },
          inPractice: 'The core of devotion to Lada is simple: flowers and honey on her shrine, songs sung for her, and acts of real peace-making in your relationships, offered to her by name.',
          reflect: [
            'Is there a reconciliation I could offer this month, or a boundary I need to set?',
            'What does beauty mean to me when it is something I make and share?',
          ],
          further: [
            'Kaarina Aitamurto and Scott Simpson (eds.), Modern Pagan and Native Faith Movements in Central and Eastern Europe (2013)',
          ],
          library: ['traditional/deity/lada', 'traditional/crystal/rose_quartz', 'traditional/deity/freyja'],
          premade: ['kitchen-solitary-self-love-mirror'],
        },
      ],
      practices: [
        {
          id: 'lada-learn-song',
          title: 'Learn one song',
          instructions: 'Find a recording of a Slavic spring or round-dance song, ideally one with a “lado” refrain, and learn at least the refrain by heart. Sing it at her shrine.',
          times: 1,
          prompt: 'How did it feel to sing for a goddess?',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights of flowers and song',
      intro: 'Now you set up her shrine and keep nine nights of offering: a fresh flower or green twig, a drop of honey, a song, and one small act of harmony each day.',
      days: 9,
      lessons: [
        {
          id: 'lada-shrine-offerings',
          title: 'Shrine, days and offerings',
          summary: 'A bright shrine, the right gifts, the manner of giving, and what to avoid.',
          minutes: 6,
          sections: [
            {
              heading: 'A bright, living shrine',
              body: `Lada’s shrine should feel like spring in a window. Put it where the light comes in: a windowsill, a sunny shelf, a corner of the kitchen or living room where the household gathers. A white or embroidered cloth is lovely underneath.

On it, put a small vase of fresh flowers or green twigs, especially birch, linden or willow; cornflowers, daisies, chamomile and roses all suit her. Add a pink, white, green or yellow candle, a little dish for honey, and something you find beautiful. Rose quartz, amber or green aventurine if you like stones. Swan or dove images are common in modern devotion. A small woven wreath, renewed with the seasons, can hang above it.`,
            },
            {
              heading: 'What to give',
              body: `Her offerings are the sweet and the living: flowers, wreaths, honey, milk, bread, small cakes, painted eggs in spring, and, above all, songs. Folk practice gives her the dough larks of March, the birch wreaths of Green Week and the flower crowns of Kupala.

Acts count most. An apology. A kind word in a tense room. Cooking for someone. Sitting with a friend who is lonely. Making peace between two people. Each is an offering if you dedicate it to her.`,
            },
            {
              heading: 'The manner of giving',
              body: `Come to her cheerfully. Stand or sit in the light, light the candle if you use one, greet her warmly, and sing or hum. Set the flowers or honey before her with a word about who or what you are asking her to bless.

Change the water and flowers before they wilt; a vase of dead flowers is no gift to a goddess of spring. Give old flowers to the earth or compost. Honey and bread offerings go to the birds or the soil within a day. Wreaths can be floated on a river at Kupala if they are made only of plants and natural thread.`,
            },
            {
              heading: 'What to avoid',
              body: `Do not use Lada for love magic aimed at a particular person who has not chosen you. Harmony cannot be forced, and binding someone’s will is the opposite of lad. Ask for love to come, or for an existing bond to be blessed, not for someone to be made to love you.

Do not pick flowers from protected land or take more than a few from any patch. Do not put lilies anywhere a cat can reach them. And do not present her to others as an ancient goddess with certainty; the honest story is a better gift.`,
            },
          ],
          knowAndDont: {
            known: 'Flowers, wreaths, birch, honey, dough larks and songs are central to the East Slavic spring customs that modern devotion to Lada draws on.',
            unknown: 'No historical offerings to a goddess Lada are recorded. The shrine and practices here are modern, built from folk custom and Rodnover practice.',
          },
          inPractice: 'Set her shrine in the light today. For nine nights, freshen her flowers or twig, give a drop of honey, sing her refrain, and tell her one thing you did that day to bring harmony.',
          reflect: [
            'Where in my home does the light come in, and could that be her place?',
            'What act of harmony can I offer tomorrow?',
          ],
          library: ['traditional/crystal/rose_quartz', 'traditional/crystal/amber', 'traditional/crystal/green_aventurine', 'traditional/herb/rose', 'traditional/candle/pink'],
          premade: ['kitchen-honey-sweetening-cake', 'folk-kupala-wreath'],
        },
      ],
      practices: [
        {
          id: 'lada-nine-nights',
          title: 'Nine nights of flowers and song',
          instructions: 'On each of nine evenings, stand at Lada’s shrine. Freshen the flower or twig, light the candle if you use one, set out a drop of honey, and sing or hum her refrain. Tell her one thing you did that day to bring harmony: a kind word, a mended quarrel, a shared meal. If you did nothing, tell her what you will do tomorrow. On the ninth night, offer a whole small cake or a little wreath, and sing a whole song.',
          times: 9,
          every: 'day',
          prompt: 'What harmony did I make today, and where did I fall out of tune?',
        },
        {
          id: 'lada-peace-act',
          title: 'One reconciliation',
          instructions: 'Sometime during the nine days, make one real reconciliation, if it is safe and kind to do so: an apology you owe, a message to someone you drifted from, a conversation you have been avoiding. If there is no one, do something to make peace with yourself.',
          times: 1,
          prompt: 'What did it take, and what changed?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Is she for me?',
      intro: 'Before dedicating, pause and weigh it. With Lada there is a particular question: can you love a goddess whose ancient origins are doubtful? Answer the questions honestly. Choosing to keep honouring her without a dedication, pausing, or turning to another god are all good outcomes.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'lada-discernment-write',
          title: 'Write it out',
          instructions: 'Answer the questions below in your journal over a few days. Reread your threshold entry. Then write in one sentence the harmony you would promise to tend for a year.',
          times: 1,
          prompt: 'What does lad ask of me, in practice?',
        },
      ],
      questions: [
        'Am I at peace honouring a goddess who may be a later construct? Does it change what she means to me?',
        'Did these weeks make me kinder and more at peace with others, or just more wistful?',
        'Is there a relationship in my life where “harmony” has meant keeping quiet about harm? Do I need support with that before anything else?',
        'Am I drawn to her for love in general, or for one particular person? If the second, am I respecting their freedom?',
        'Can I keep a simple weekly practice of flowers, song and one act of peace-making for a year?',
        'Would it be enough, for now, to keep honouring her without a formal dedication?',
      ],
    },
    {
      kind: 'dedication',
      title: 'The wreath and the vow',
      intro: 'If you have chosen to go ahead, this is your dedication. It is a self-dedication, a promise between you and Lada. It is not an initiation into any group and does not replace one if you join a community with its own rites. Stopping before this, or choosing another path, would have been a good outcome too.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Dedication to Lada',
        summary: 'A wreath woven and worn, honey and bread shared, a song sung, and a promise of harmony made.',
        minutes: 45,
        ingredients: [
          { name: 'Flexible birch or willow twigs, or long grasses, for a wreath base', ref: 'traditional/herb/birch' },
          { name: 'Fresh flowers: cornflowers, daisies, chamomile, clover, roses' },
          { name: 'Natural cotton or linen thread' },
          { name: 'Honey and a small cake or round bread' },
          { name: 'Milk or water in a cup' },
          { name: 'A pink, white or green candle', ref: 'traditional/candle/white' },
          { name: 'Rose quartz or amber to keep', ref: 'traditional/crystal/rose_quartz', optional: true },
        ],
        preparation: 'Choose a spring or early summer day if you can, near the equinox, Krasnaya Gorka or Kupala, or any bright day near the waxing moon. Go to a meadow, garden or park if you can; otherwise work at her shrine with the window open. Write your promise in one sentence: “I will make peace before sleeping,” “I will sing every week,” “I will speak kindly to myself.” Invite a friend or partner if you want a witness.',
        steps: [
          {
            title: 'Gather with thanks',
            instructions: 'If you are outdoors, pick a few flowers, thanking each plant, and only common ones. Otherwise lay out the flowers you brought.',
            minutes: 5,
          },
          {
            title: 'Light',
            instructions: 'Light the candle at her shrine, or set it safely in a jar if outside.',
            light: true,
          },
          {
            title: 'Call her',
            instructions: 'Greet her with joy.',
            spoken: 'Lada, Lada, oi lado!\nGoddess of the spring and the good word,\nof the shared table and the kept peace,\ncome and be glad with me.',
          },
          {
            title: 'Weave the wreath',
            instructions: 'Bend the twigs into a ring that fits your head and bind them with thread. Tuck in the flowers one by one, all pointing the same way. As you add each flower, name someone you love or a harmony you hope for.',
            minutes: 15,
          },
          {
            title: 'Give honey and bread',
            instructions: 'Set the cake or bread before her with honey on it. Pour a little milk or water onto the ground or a plant.',
            spoken: 'Honey for sweetness, bread for sharing,\nmilk for the earth that flowers.',
          },
          {
            title: 'Crown yourself and vow',
            instructions: 'Put on the wreath. Read your promise aloud once, then speak the words below.',
            spoken: 'This I promise for a year and a day.\nI give myself to your honour, Lada,\nto make peace where I can and boundaries where I must,\nto love with an open hand,\nand to bring song and beauty to my house.',
          },
          {
            title: 'Sing',
            instructions: 'Sing her refrain or a whole song. If a friend is with you, take hands and walk a slow circle as you sing.',
            minutes: 3,
          },
          {
            title: 'Close',
            instructions: 'Thank her. Eat a piece of the cake yourself, leaving her portion. Snuff the candle.',
            spoken: 'Thank you, Lada. Let there be lad.',
            snuff: true,
          },
        ],
        closing: 'Wear the wreath for the rest of the day, then hang it above her shrine or float it on a river at Kupala. Leave her portion of cake for the birds. Keep the stone if you brought one. Note the date for your renewal.',
        safety: 'Lilies and many garden flowers are toxic to cats and dogs; keep flowers out of their reach. Keep candles away from dried flowers and never leave them unattended; outdoors, use a jar and keep away from dry grass. Do not give honey to babies under one. Check for allergies before weaving flowers to wear.',
      },
    },
    {
      kind: 'ongoing',
      title: 'Keeping lad',
      intro: 'A dedication begins a year of practice. Here is a rhythm: weekly flowers and song, her spring and summer festivals, and a yearly renewal.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'lada-weekly',
          title: 'Weekly flowers and song',
          instructions: 'Once a week, freshen her flowers or twig, give a drop of honey, sing for her, and tell her about one act of harmony from the week. Many people choose Friday, by analogy with Venus’s day; any day you can keep is right.',
          times: 52,
          every: 'week',
          prompt: 'Where did I make lad this week?',
        },
        {
          id: 'lada-feasts',
          title: 'Her seasons',
          instructions: 'At the spring equinox, as Marzanna is carried out, welcome spring with dough larks and songs for Lada. Through spring, honour her at Krasnaya Gorka and Green Week with birch and wreaths. At Kupala, weave a wreath and float it. At weddings and anniversaries of those you love, light her candle.',
          times: 1,
          every: 'holy-day',
          prompt: 'What did spring bring into my life this year?',
          premade: 'folk-kupala-wreath',
        },
        {
          id: 'lada-rededication',
          title: 'Renew the vow',
          instructions: 'A year and a day after your dedication, weave a new wreath. Read your promise and say honestly how you kept it. Make a new promise for the year, or thank her and release it.',
          times: 1,
          prompt: 'What harmony will I tend next?',
        },
      ],
    },
  ],
  sources: [
    'W. R. S. Ralston, The Songs of the Russian People (1872), pp. 104–105 on Lado and Lada and p. 233 on Semik, quoted (the proverb’s “klad” is misread as “Idad” or “Mad” in archive.org’s OCR; the printed page reads klad, Russian for treasure): https://archive.org/details/songsofrussianpe00ralsuoft',
    'The Hustyn (Gustyn) Chronicle (early 17th century) and the Kievan Synopsis (1674), on Lado, known here through Ralston’s quotation',
    'The Russian Primary Chronicle, trans. Samuel H. Cross, in Harvard Studies and Notes in Philology and Literature vol. XII (1930), entry for 980 (for her absence): https://archive.org/details/doncarlosthemeha0000fred',
    'Jan Długosz, Annales seu cronicae incliti Regni Poloniae (15th century), on the Polish gods (paraphrased)',
    'Aleksander Brückner, Mitologia słowiańska (1918) and Mitologia polska (1924)',
    'B. A. Rybakov, Yazychestvo drevnikh slavyan (1981)',
    'Judith Kalik and Alexander Uchitel, Slavic Gods and Heroes (2019)',
    'Linda J. Ivanits, Russian Folk Belief (1989)',
  ],
};
