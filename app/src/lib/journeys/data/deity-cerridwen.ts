import type { Journey } from '../types';

export const JOURNEY: Journey = {
  id: 'deity-cerridwen',
  kind: 'deity',
  paths: ['celtic', 'wheel'],
  deityRef: 'traditional/deity/cerridwen',
  title: 'Cerridwen: The Cauldron of Awen',
  summary:
    'A month with Cerridwen, the Welsh enchantress of the cauldron: the tale of Gwion Bach and the three drops, the awen of the poets, the modern Crone and her cauldron, and a self-dedication to inspiration that changes you.',
  welcome:
    'This journey takes about a lunar month. You will read five lessons, set up a shrine with a cauldron or pot, keep nine nights of offering and writing, and decide whether to dedicate yourself to Cerridwen.\n\nIt is a self-dedication, not an initiation, and it does not make you a member of any Druid order or coven. Cerridwen is known to us from a story, not from records of worship, and this journey is honest about that while taking seriously the modern people who honour her as a goddess. You can pause whenever you like.',
  about:
    'Cerridwen (also Ceridwen, Caridwen, Keridwen) is the central figure of Hanes Taliesin, the Tale of Taliesin, first written down in full in Wales in the sixteenth century. A wise woman of Penllyn by Lake Tegid, she brews a cauldron of inspiration for a year and a day for her son, but the three precious drops fall on the finger of her servant boy Gwion Bach. She pursues him through a chain of shape-changes, swallows him as a grain of wheat, bears him again, and casts him into the sea, where he is found and named Taliesin, the greatest of poets. Medieval Welsh court poets of the twelfth and thirteenth centuries already spoke of Ceridwen and her cauldron as the source of their gift. There is no evidence that she was worshipped as a goddess in pre-Christian Wales, no inscription and no shrine; some scholars think she may echo an older goddess, others see a literary enchantress. In the twentieth century, Robert Graves, Wicca and the Druid revival made her a goddess of the cauldron, the Crone, the moon, the white sow and transformation, and she is now widely and sincerely honoured as such.',
  notes: [
    'Cerridwen comes from a late medieval Welsh tale. There is no evidence of a pre-Christian cult. Modern devotion to her as a goddess is real and widespread, but it is modern; the lessons say what comes from where.',
    'Her association with the white sow, the moon and the Crone of maiden-mother-crone comes from twentieth-century writers, especially Robert Graves, not from the Welsh sources.',
    'Welsh is a living language and Wales a living culture. Learn to say her name (roughly "keh-RID-wen", with a rolled r) and Taliesin ("tal-YES-in"), and look to Welsh scholars and sources.',
    'The Druid symbol of awen (/|\\) and many Druid rites come from the eighteenth-century work of Iolo Morganwg, not from ancient Wales. Initiatory Druid grade material, such as that of OBOD, belongs to those orders and is not reproduced here.',
    'Cauldron work in an apartment needs care. Never burn paper or herbs in a metal pot indoors without a heatproof base, ventilation and a smoke alarm. A pot of water or tea is just as much a cauldron.',
    'Mugwort, a herb often linked with her, should be avoided in pregnancy and by people allergic to the daisy family.',
  ],
  holyDays: ['samhain_gaelic', 'samhain', 'bealtaine', 'beltane'],
  stages: [
    {
      kind: 'threshold',
      title: 'Lighting the fire under the cauldron',
      intro:
        'Begin by making a place for Cerridwen with a vessel at its heart, and introducing yourself. In the tale, everything starts when the fire is lit beneath the cauldron and the stirring begins.',
      days: 2,
      lessons: [],
      practices: [
        {
          id: 'cerridwen-shrine',
          title: 'Set up a simple shrine',
          instructions:
            'Choose a shelf or small table. Lay down a cloth of dark blue, purple, grey or undyed linen. At the centre put a vessel: a small iron cauldron if you have one, otherwise a bowl, a saucepan or a teapot. Put a candle in a safe holder on a heatproof dish beside it, not inside it. Add a wooden spoon (Gwion’s stirring spoon), a small dish of oats or grain, and your notebook and pen, since her gift is to poets. A picture of Lake Tegid (Llyn Tegid, at Bala in north Wales) or of a hare, a fish, a hawk and a hen for the chase can go here too.',
          times: 1,
          prompt: 'What vessel did you choose as her cauldron, and why?',
        },
      ],
      rite: {
        title: 'Introduction to Cerridwen',
        summary:
          'A simple rite at the cauldron: light the fire beside it, fill it with water, offer grain and milk, stir three times, introduce yourself and write what comes.',
        minutes: 25,
        ingredients: [
          { name: 'A silver, white or purple candle in a safe holder', ref: 'traditional/candle/silver' },
          { name: 'Your cauldron, pot or bowl', ref: 'traditional/tool/cauldron' },
          { name: 'Fresh water' },
          { name: 'A small dish of oats' },
          { name: 'A little milk (or oat milk)' },
          { name: 'A wooden spoon' },
          { name: 'Your notebook and pen' },
        ],
        preparation:
          'Wash your hands. Fill the cauldron about halfway with fresh water. Set out the oats and milk. Have the notebook open to a clean page.',
        steps: [
          {
            title: 'Light the fire',
            instructions:
              'Light the candle beside the cauldron. In the tale, a blind man named Morda kept the fire under the cauldron burning for a year and a day.',
            spoken: 'Cerridwen of Penllyn, keeper of the cauldron, I light this fire for you.',
            light: true,
          },
          {
            title: 'Offer grain and milk',
            instructions:
              'Put a pinch of oats into the water, and a few drops of milk. Set the rest of the oats on their dish before the cauldron.',
            spoken: 'Here is grain and milk, the plain food of the farm. I give them to you.',
          },
          {
            title: 'Stir three times',
            instructions:
              'Take the wooden spoon and stir the water slowly three times, sunwise (clockwise). Watch the grain turn in the water.',
            spoken: 'Three times I stir, for the three drops of inspiration.',
          },
          {
            title: 'Introduce yourself',
            instructions:
              'Tell her your name, where you live, and what you make or would like to make: words, music, art, anything. Say why you have come to her, and what in you is ready to change.',
          },
          {
            title: 'Write',
            instructions:
              'Pick up the pen and write without stopping for five minutes, anything that comes. Do not judge it.',
            minutes: 5,
          },
          {
            title: 'Close',
            instructions: 'Thank her and snuff the candle.',
            spoken: 'Cerridwen, thank you. I will come again to the cauldron.',
            snuff: true,
          },
        ],
        closing:
          'Leave the cauldron water overnight, then pour it onto the earth or a plant pot, oats and all. Scatter the dish of oats for the birds or compost it. Read back what you wrote and keep it.',
        safety:
          'Keep the candle on a heatproof dish beside the cauldron, never in it, and never leave it unattended. Do not drink water that has stood out overnight.',
      },
    },
    {
      kind: 'study',
      title: 'Learning who she is',
      intro:
        'Four lessons on Cerridwen: the sources and what they are; the tale of the cauldron and the chase; awen and the cauldrons of Welsh tradition; and the modern goddess. Read one every day or two.',
      days: 8,
      lessons: [
        {
          id: 'cerridwen-sources',
          title: 'Who is Cerridwen? A woman in a tale',
          summary: 'Where Cerridwen comes from, when her story was written down, what the medieval poets said of her, and whether she was ever a goddess.',
          minutes: 7,
          sections: [
            {
              heading: 'The Tale of Taliesin',
              body:
                'Cerridwen’s story is Hanes Taliesin, the Tale of Taliesin. Its earliest full version was written down around the 1540s by Elis Gruffydd, a Welsh soldier and chronicler who served in the English garrison at Calais, as part of his great chronicle of world history. Other versions survive in later sixteenth- and seventeenth-century Welsh manuscripts.\n\nMost English readers first met it in Lady Charlotte Guest’s translation, published in her Mabinogion (1838–49). Guest included it alongside the Four Branches of the Mabinogi, though it is not one of them and is much later. Her version begins: “In times past there lived in Penllyn a man of gentle lineage, named Tegid Voel, and his dwelling was in the midst of the lake Tegid, and his wife was called Caridwen.”',
            },
            {
              heading: 'Older than the tale',
              body:
                'The story as we have it is late, but Cerridwen is older. The Book of Taliesin, a manuscript copied around 1350 of poems attributed to the sixth-century poet Taliesin, includes a poem called Cadair Ceridwen, “the Chair of Ceridwen”, and other references to her. Welsh court poets of the twelfth and thirteenth centuries, the Gogynfeirdd or Poets of the Princes, sometimes name her too. Cynddelw Brydydd Mawr, in the later twelfth century, speaks of Ceridwen as a source of his art, and early in the thirteenth century Prydydd y Moch mentions her cauldron as the source of the gift of awen.\n\nSo by the high Middle Ages, Welsh poets knew a Ceridwen whose cauldron stood for inspiration. Whether they thought of her as a goddess, a wise woman of legend, or a poetic figure of speech, we cannot tell.',
            },
            {
              heading: 'Was she a goddess?',
              body:
                'There is no inscription to Cerridwen from Roman Britain, no shrine, no record of offerings, and no early writer who calls her a goddess. In the tale she is a wife and mother, a woman learned in the books of magic, not a deity. Her power is great, but it is the power of an enchantress.\n\nSome scholars have argued that she preserves the memory of a goddess of poetry or of the cauldron, perhaps related to the cauldrons of rebirth and plenty that appear elsewhere in Welsh and Irish myth. Others, including Patrick Ford, who edited the tale, and the historian Ronald Hutton, are more cautious and read her as a figure of medieval Welsh storytelling. Both views are held by serious people. What is certain is that modern devotees honour her as a goddess, and that is a modern religious choice, freely made.',
            },
            {
              heading: 'Her name and her place',
              body:
                'The meaning of her name is uncertain. It has been read as cyrrid, “crooked” or “bent”, with gwen, “white” or “blessed”, or as cerdd, “poetry” or “song”, with gwen, “fair”, which would be lovely but is probably not right. Spellings vary: Ceridwen is the usual Welsh form, Cerridwen is common in English-speaking Paganism, and Guest wrote Caridwen.\n\nHer home in the tale is Penllyn, the land around Llyn Tegid (Bala Lake) in Gwynedd, north Wales, the largest natural lake in Wales. Local legend says the lake covers a drowned town. If you ever go, it is a beautiful place to sit and write.',
            },
          ],
          knowAndDont: {
            known:
              'Hanes Taliesin was first written down in full by Elis Gruffydd around the 1540s. The Book of Taliesin (copied in the first half of the fourteenth century) includes the poem Cadair Ceridwen, and twelfth- and thirteenth-century court poets such as Cynddelw and Prydydd y Moch mention her and her cauldron. Lady Charlotte Guest’s translation brought her to English readers in the 1840s.',
            unknown:
              'There is no evidence of worship of Cerridwen as a goddess in pre-Christian or medieval Wales. Whether she preserves an older goddess is debated; Ronald Hutton, for one, suggests the court poets themselves may have raised her standing. The meaning of her name is unclear.',
          },
          inPractice:
            'Modern devotees honour her as a goddess of inspiration and transformation, often alongside Taliesin as her “son” and the first poet of her cauldron. Many read the tale aloud on her holy days.',
          reflect: [
            'How do you feel about honouring a figure who may have been a woman in a story rather than a goddess? Does it change your approach?',
            'What do you hope to receive from her cauldron?',
          ],
          further: [
            'Patrick K. Ford, ed., Ystoria Taliesin (1992), and his translation in The Mabinogi and Other Medieval Welsh Tales (1977).',
            'Lady Charlotte Guest, The Mabinogion (1849), “Taliesin” (public domain, Project Gutenberg).',
            'Ronald Hutton, Pagan Britain (2013), and Blood and Mistletoe: The History of the Druids in Britain (2009).',
          ],
          library: ['traditional/deity/cerridwen'],
        },
        {
          id: 'cerridwen-tale',
          title: 'The cauldron and the chase',
          summary: 'The full story of Cerridwen, Gwion Bach and the three drops, and what it teaches about inspiration, pursuit and rebirth.',
          minutes: 8,
          sections: [
            {
              heading: 'A year and a day',
              body:
                'Cerridwen and her husband Tegid Foel have three children: Morfran, Creirwy, the fairest maiden in the world, and Afagddu, the ugliest of men. Cerridwen fears that Afagddu will never be accepted among the nobility, so she decides to make him wise. In Guest’s words, she resolved, “according to the arts of the books of the Fferyllt, to boil a cauldron of Inspiration and Science for her son.” The Fferyllt are the books of Fferyll, the Welsh name for Virgil, who in the Middle Ages was remembered as a great magician.\n\nThe cauldron must boil for a year and a day “until three blessed drops were obtained of the grace of Inspiration.” She sets the boy Gwion Bach of Llanfair in Caereinion to stir it, and a blind man named Morda to keep the fire going, while she gathers herbs “in planetary hours” every day.',
            },
            {
              heading: 'The three drops',
              body:
                'Near the end of the year, while Cerridwen is out gathering plants, the moment comes. Guest’s translation: “it chanced that three drops of the charmed liquor flew out of the cauldron and fell upon the finger of Gwion Bach. And by reason of their great heat he put his finger to his mouth, and the instant he put those marvel-working drops into his mouth, he foresaw everything that was to come.”\n\nThe rest of the liquor is poison. The cauldron cracks in two and the poisoned water runs into a stream and kills the horses of Gwyddno Garanhir. Cerridwen comes back to find a year’s work lost, and in her fury she strikes the blind Morda, who protests that he is innocent; she agrees, and goes after Gwion.',
            },
            {
              heading: 'The chase',
              body:
                'Gwion runs and becomes a hare; she becomes a greyhound. He jumps into a river and becomes a fish; she becomes an otter. He becomes a bird; she becomes a hawk. At last he drops into a heap of winnowed wheat on a barn floor and becomes a single grain; she becomes a high-crested black hen, scratches the wheat, finds him and swallows him.\n\nShe carries him for nine months. When he is born she means to kill him, but, in Guest’s words, “she could not find it in her heart to kill him, by reason of his beauty.” She wraps him in a leather bag and casts him into the sea. He drifts to the weir of Gwyddno, where on May Eve the unlucky prince Elffin finds the bag. Opening it, someone sees the child’s forehead and cries, “Behold a radiant brow!” and Elffin names him Taliesin, “radiant brow”. The baby begins at once to sing, and grows into the greatest poet of Britain.',
            },
            {
              heading: 'What the story teaches',
              body:
                'This is a story about inspiration, and it is not gentle. The gift is meant for someone else; it comes by accident, in a moment, after a year of someone else’s labour. It burns. It brings knowledge of what is coming, and with it terror. The one who has it is pursued and must change shape again and again, until at last they are taken in, carried, and born anew.\n\nModern devotees read this as the pattern of real creative and spiritual change: long, patient preparation; a sudden breakthrough; a hard chase through many forms; a time of being swallowed and held in the dark; and rebirth with a new name. Cerridwen is the one who drives that process. She is mother, pursuer and midwife at once.',
            },
          ],
          knowAndDont: {
            known:
              'The tale’s plot (the cauldron for Afagddu, Gwion and the three drops, the chase, the rebirth, and the finding of Taliesin at Gwyddno’s weir) is consistent across the sixteenth-century versions. Fferyllt refers to Virgil, remembered in medieval Wales as a magician.',
            unknown:
              'We do not know how old the story is, how it was told before the sixteenth century, or whether it had a religious meaning. Reading it as a pattern of initiation or spiritual rebirth is a modern interpretation, though a widely shared one.',
          },
          inPractice:
            'Many devotees retell the tale aloud on her holy days, and some act out the chase in movement or meditation. Writers often keep "three drops" notebooks of sudden ideas.',
          reflect: [
            'Have you ever had a moment of sudden insight after long effort? What followed it?',
            'Which form in the chase do you feel you are in now: hare, fish, bird, or grain?',
          ],
          further: [
            'Lady Charlotte Guest, The Mabinogion (1849), “Taliesin” (public domain, Project Gutenberg).',
            'John Matthews, Taliesin: The Last Celtic Shaman (2002; first published 1991 as Taliesin: Shamanism and the Bardic Mysteries in Britain and Ireland), for a modern devotional reading.',
            'Juliette Wood, “The Elphin Section of Hanes Taliesin”, Études Celtiques 18 (1981), 229–244.',
          ],
          library: ['traditional/deity/cerridwen', 'traditional/tool/cauldron'],
        },
        {
          id: 'cerridwen-awen',
          title: 'Awen and the cauldrons of Welsh tradition',
          summary: 'The Welsh word for poetic inspiration, the other great cauldrons of Welsh myth, and what Iolo Morganwg added in the eighteenth century.',
          minutes: 7,
          sections: [
            {
              heading: 'Awen',
              body:
                'Awen is the Welsh word for poetic inspiration, the gift that came to Gwion in the three drops. Medieval Welsh poets spoke of it as something that came from God or from beyond them, flowing through them when they sang. The word is related to the word for breath or wind.\n\nIn the Middle Ages, a professional poet (bardd) trained for years in metre, story and genealogy. Inspiration was not a substitute for that training but its crown. This is worth remembering in a devotion to Cerridwen: the three drops came at the end of a year and a day of steady stirring.',
            },
            {
              heading: 'Other cauldrons',
              body:
                'Cerridwen’s cauldron is one of several in Welsh myth. In the Second Branch of the Mabinogi, the tale of Branwen, there is a Cauldron of Rebirth (pair dadeni): dead warriors thrown into it come out alive the next day, but unable to speak. In the poem Preiddeu Annwfn, “the Spoils of Annwfn” in the Book of Taliesin, Arthur and his men sail to the otherworld to take the cauldron of the Head of Annwfn, which is warmed by the breath of nine maidens and will not boil the food of a coward.\n\nIrish myth has the Dagda’s cauldron, from which no company ever went away unsatisfied. Together these suggest that cauldrons in Celtic tradition were powerful symbols of plenty, rebirth and inspiration, though each story uses them differently.',
            },
            {
              heading: 'Iolo Morganwg and the revival',
              body:
                'In the late eighteenth century, the Welsh stonemason, poet and antiquarian Edward Williams, known as Iolo Morganwg, created much of what is now called Druidry. He held the first Gorsedd of the Bards on Primrose Hill in London in 1792, and wrote texts he claimed were ancient bardic lore, many of which he had composed himself. The three-rayed awen symbol (/|\\) and its threefold meanings come from Iolo.\n\nThe modern Gorsedd is now part of the National Eisteddfod of Wales, a festival of Welsh language and culture. Modern Druid orders, such as the Order of Bards, Ovates and Druids, draw on Iolo and on the Taliesin story, and some use chanting of the word awen. Iolo’s work is not ancient, but it has become a living tradition in its own right.',
            },
            {
              heading: 'Awen in practice',
              body:
                'You do not need to belong to an order to work with awen. The simplest practice is to sit quietly, breathe, and on the out-breath sing or hum a long note, letting the word awen ("AH-oo-en") form slowly if it feels right. Then write, draw or play for a set time without stopping.\n\nThe point is the same as in the tale: show up, keep the fire going, and be ready when the drops fly. Many devotees keep a regular creative practice as their primary offering to Cerridwen, whether or not they think of themselves as artists.',
            },
          ],
          knowAndDont: {
            known:
              'Awen is the medieval and modern Welsh word for poetic inspiration. Welsh myth includes the cauldron of rebirth in Branwen and the cauldron of Annwfn in Preiddeu Annwfn. Iolo Morganwg founded the Gorsedd in 1792 and invented the awen symbol and much revival Druid lore.',
            unknown:
              'We do not know what religious meaning, if any, these cauldrons had in pre-Christian Wales. Chanting awen as a spiritual practice is modern, from the Druid revival.',
          },
          inPractice:
            'Druids and many Pagans chant awen at the start of rites. Devotees of Cerridwen often keep a daily or weekly creative practice, offering what they make to her.',
          reflect: [
            'What is your equivalent of a year and a day of stirring? What steady practice could you keep?',
            'Which of the Welsh cauldrons speaks to you most: inspiration, rebirth, or the test of courage?',
          ],
          further: [
            'Sioned Davies, trans., The Mabinogion (Oxford World’s Classics, 2007), for Branwen.',
            'Marged Haycock, ed., Legendary Poems from the Book of Taliesin (2007), including Preiddeu Annwfn.',
            'Geraint H. Jenkins, ed., A Rattleskull Genius: The Many Faces of Iolo Morganwg (2005).',
          ],
          library: ['traditional/deity/cerridwen', 'traditional/deity/dagda', 'traditional/tool/cauldron'],
          premade: ['kitchen-solitary-book-of-shadows-blessing'],
        },
        {
          id: 'cerridwen-modern',
          title: 'The modern Cerridwen: Crone, cauldron and sow',
          summary: 'How Robert Graves, Wicca and modern Paganism made Cerridwen a goddess, what they added, and how to approach her now.',
          minutes: 7,
          sections: [
            {
              heading: 'Robert Graves and The White Goddess',
              body:
                'More than any other writer, the poet Robert Graves shaped how modern Pagans see Cerridwen. In The White Goddess (1948), he argued that all true poetry was inspired by a single ancient goddess of birth, love and death, with three aspects linked to the moon. He made Cerridwen one of her chief forms, calling her a white sow goddess of the barley and of death, and the Taliesin story a record of ancient initiation.\n\nGraves was a brilliant poet and a careless historian, and scholars do not accept his theory. But his book inspired a generation, and much of what is now said about Cerridwen, her moon, her sow, her place as the Crone, comes from him.',
            },
            {
              heading: 'The sow, the moon and the Crone',
              body:
                'The white sow does not appear in Hanes Taliesin. Welsh tradition has a magical sow called Henwen in the Welsh Triads, who gives birth to wheat, barley, bees and monsters as she runs across Britain, but she is not linked to Cerridwen in the medieval sources. Graves joined them.\n\nSimilarly, the moon is not mentioned in the tale except in her gathering of herbs “in planetary hours”. Her role as the Crone in a maiden-mother-crone triad comes from Graves and from Wicca. These associations are modern. You may still find them meaningful, but present them as such.',
            },
            {
              heading: 'Cerridwen in Wicca and modern Paganism',
              body:
                'In Wicca and much modern Paganism, Cerridwen is honoured as a goddess of the cauldron, transformation, death and rebirth, wisdom and the dark moon. She is often invoked at Samhain as the Crone who stirs the cauldron of the dead and the reborn. In Druidry she is honoured as the mother of Taliesin and the source of awen.\n\nSome people find her through hard times: grief, illness, the end of a relationship or a career, a change of identity. They see in the chase and the rebirth a map for what they are going through. This is one of the most living parts of her modern devotion.',
            },
            {
              heading: 'Approaching her honestly',
              body:
                'Cerridwen in the tale is not a gentle mother. She strikes the blind servant, pursues the boy without rest, swallows him and means to kill him. Devotees often say she is the goddess of change that hurts, and that you should not ask her for transformation lightly.\n\nApproach her with honesty and with patience. Bring your work, your willingness to be changed, and your respect for the Welsh culture she comes from. You need not choose between the scholar’s caution and the devotee’s faith: you can say, truthfully, that she is a figure of a Welsh tale whom you honour as a goddess today.',
            },
          ],
          knowAndDont: {
            known:
              'Robert Graves’s The White Goddess (1948) linked Cerridwen with a white sow, the moon and a triple goddess. Henwen the sow appears in the Welsh Triads, separately from Cerridwen. Wicca and modern Paganism honour Cerridwen as a goddess of the cauldron and the Crone.',
            unknown:
              'There is no evidence before the twentieth century for Cerridwen as a moon goddess, sow goddess or Crone. Modern experiences of her are personal or community religion, not historical evidence.',
          },
          inPractice:
            'Devotees honour her at Samhain, at the dark moon, and in times of change, with cauldrons, grain, milk, herbs and creative work. Many keep a journal of transformation alongside their devotion.',
          reflect: [
            'What change are you going through, or ready for, that might bring you to Cerridwen?',
            'Which modern associations of hers do you want to keep, knowing where they come from?',
          ],
          further: [
            'Robert Graves, The White Goddess (1948), read as poetry and as history of an idea.',
            'Rachel Bromwich, ed., Trioedd Ynys Prydein: The Triads of the Island of Britain (4th ed. 2014), for Henwen.',
            'Kristoffer Hughes, Cerridwen: Celtic Goddess of Inspiration (2021), by a Welsh-speaking Druid.',
          ],
          library: ['traditional/deity/cerridwen', 'traditional/crystal/moonstone', 'traditional/herb/mugwort'],
        },
      ],
      practices: [
        {
          id: 'cerridwen-study-stir',
          title: 'Stir before you read',
          instructions:
            'Before each lesson, light her candle, stir the water in her cauldron three times, and say, “Cerridwen, let the drops fall.” After reading, write three sentences: one about what you learned, one about what you felt, one about anything that came to you from nowhere.',
          times: 4,
          every: 'day',
          prompt: 'Your three sentences.',
        },
      ],
    },
    {
      kind: 'practice',
      title: 'Nine nights at the cauldron',
      intro:
        'Now you put what you have learned into practice: nine nights of offering and creative work at her cauldron, with a lesson on her offerings, herbs and days.',
      days: 10,
      lessons: [
        {
          id: 'cerridwen-offerings',
          title: 'Offerings, herbs and the cauldron at home',
          summary: 'What to offer, how to gather and use herbs safely, how to work with a cauldron in an apartment, and her holy days.',
          minutes: 7,
          sections: [
            {
              heading: 'What to offer',
              body:
                'Good offerings for Cerridwen are the plain foods of a Welsh farm: oats, barley, bread, milk, butter, honey, and fresh water, especially from a spring or lake. Herbal teas are fitting, as she gathered “charm-bearing herbs” for her brew. Above all, offer what you make: poems, songs, stories, drawings, and the steady work of learning a craft.\n\nSet the offering before the cauldron or in it, saying what it is. Leave it overnight. Then return it to the earth: oats and bread for the birds or the compost, milk and water poured onto soil.',
            },
            {
              heading: 'Gathering herbs',
              body:
                'In the tale she gathers herbs every day. If you gather, do it ethically: only take plants you can identify with certainty, only from places where it is allowed, never more than a small fraction of what grows, and never rare or protected species. Thank the plant as you take it.\n\nHerbs often associated with her in modern practice include mugwort, vervain, rosemary and lavender, and trees like willow and oak. Mugwort is a traditional dream and divination herb, but it should be avoided in pregnancy and by people allergic to the daisy family. If you are unsure about a herb, do not ingest it; use it only as an offering or on the shrine.',
            },
            {
              heading: 'A cauldron in an apartment',
              body:
                'You do not need a fire under your cauldron. A pot of water on the shrine, a teapot, a saucepan on the stove for a simmer pot, or a bowl for scrying are all cauldrons. If you brew tea for her, use safe, well-known herbs like chamomile, mint or lemon balm, drink a cup in her honour and offer one to her.\n\nIf you want to burn written words or herbs, be very careful: use a cast-iron cauldron on a heatproof board, with a window open and a smoke alarm working, burn only small amounts, and never leave it. Many people prefer to tear up paper and compost it, or dissolve rice paper in water, which is just as symbolic and much safer.',
            },
            {
              heading: 'Her days',
              body:
                'No ancient festival of Cerridwen is known. Modern Pagans honour her most at Samhain (31 October), the Welsh Calan Gaeaf, as the goddess of the cauldron of death and rebirth. Calan Mai, May Eve (the Welsh Bealtaine), is fitting too, since it was on May Eve that Elffin found Taliesin in Gwyddno’s weir.\n\nMany devotees also honour her at the dark moon, a modern association, and at any time of change in their lives. If you keep a creative practice, the day you finish a project is a good day to give her thanks.',
            },
            {
              heading: 'Keeping her shrine',
              body:
                'Change the water in her cauldron at least once a week, and never let it sit until it turns stale; a fresh vessel is part of the respect. Keep your current notebook on the shrine, and when one is full, give it a night before her before you put it away. Dried herbs on the shrine should be replaced each season and composted, not left to gather dust.\n\nIf you want to mark the chase, you can keep four small things on her shrine for the four pairs of forms: something for the hare and greyhound, the fish and otter, the bird and hawk, the grain and hen. Move one forward each season, as a reminder that change goes on.',
            },
          ],
          knowAndDont: {
            known:
              'The tale describes her gathering herbs and boiling the cauldron for a year and a day, and the finding of Taliesin on May Eve. Oats, milk and bread were staples of the Welsh diet.',
            unknown:
              'There is no record of offerings to Cerridwen or her holy days. Herb, colour and moon associations are modern. Samhain as her festival is a modern Pagan practice.',
          },
          inPractice:
            'A typical devotee keeps a cauldron or bowl on her shrine, offers oats and milk weekly, keeps a regular creative practice, and honours her at Samhain with a retelling of the tale.',
          reflect: [
            'What could you make for her regularly, however small?',
            'Is there a herb you would like to learn about properly, to understand rather than just use?',
          ],
          further: [
            'Gabrielle Hatfield, Hatfield’s Herbal (2007), for British plant lore.',
            'Trefor M. Owen, The Customs and Traditions of Wales (1991), for Calan Gaeaf and Calan Mai.',
          ],
          library: ['traditional/deity/cerridwen', 'traditional/herb/mugwort', 'traditional/herb/vervain', 'traditional/herb/willow'],
          premade: ['hedge-dark-bowl-scrying', 'kitchen-seasonal-simmer-pot'],
        },
      ],
      practices: [
        {
          id: 'cerridwen-nine-nights',
          title: 'Nine nights at the cauldron',
          instructions:
            'Each evening for nine nights, light her candle, fill her cauldron with fresh water, and drop in a pinch of oats. Stir three times sunwise. Then make something for twenty minutes: write, draw, sing, play, sew. Do not judge it. At the end, read or show it to her, and say, “This is from the cauldron.” Snuff the candle. In the morning, pour the water onto the earth.',
          times: 9,
          every: 'day',
          prompt: 'What did you make tonight? Did a drop fall, a moment of something unexpected?',
        },
      ],
    },
    {
      kind: 'discernment',
      title: 'Discernment at the lake',
      intro:
        'Before any dedication, pause and look back. Cerridwen is a goddess of change that costs something. A dedication to her should be made with open eyes. Stopping, waiting, or choosing another god or path are all good outcomes, and the cauldron does not cool because you step back.',
      days: 3,
      lessons: [],
      practices: [
        {
          id: 'cerridwen-discern',
          title: 'Read back your nine nights',
          instructions:
            'Gather everything you made during the nine nights. Read or look through it all in one sitting, with her candle lit. Then write honest answers to the questions below.',
          times: 1,
          prompt: 'Your answers, and what you noticed in what you made.',
        },
      ],
      questions: [
        'Did the nine nights feel like a relationship with her, or mainly a creative exercise? Both are valuable; only one needs a dedication.',
        'Are you comfortable honouring a figure whose goddess-hood is a modern understanding? Can you speak about her honestly?',
        'Are you ready for change, possibly uncomfortable change, in your life? Is this the right season for it?',
        'Can you keep a regular creative or devotional practice, a "year and a day" of stirring?',
        'Are you drawn to her mainly through modern imagery (the Crone, the moon, the sow) or through the Welsh tale? Does it matter to you?',
        'Is another deity or path calling you more strongly? Choosing them, or pausing, is a good and honest outcome.',
      ],
    },
    {
      kind: 'dedication',
      title: 'Dedication at the cauldron',
      intro:
        'If you choose to go on, this is a self-dedication to Cerridwen, made before her cauldron in your own words. It is not an initiation into Druidry, Wicca or any order, and it does not replace one where they have their own. Samhain or May Eve are fitting; so is any night when you are ready.',
      days: 1,
      lessons: [],
      practices: [],
      rite: {
        title: 'Self-dedication to Cerridwen',
        summary:
          'Light the fire, fill the cauldron, offer grain and milk, stir in your promise, receive three drops, and write the first words of your dedicated life.',
        minutes: 45,
        ingredients: [
          { name: 'A silver, white or purple candle in a safe holder', ref: 'traditional/candle/silver' },
          { name: 'Your cauldron or bowl', ref: 'traditional/tool/cauldron' },
          { name: 'Fresh water, ideally from a spring' },
          { name: 'Oats, bread and a little milk' },
          { name: 'A wooden spoon' },
          { name: 'Your written promise' },
          { name: 'Your notebook and pen' },
          { name: 'A sprig of rosemary or vervain', ref: 'traditional/herb/rosemary', optional: true },
        ],
        preparation:
          'Write your promise over several days: what you will do in her honour, including a regular creative practice, and for how long (a year and a day is fitting). Wash and put on clean clothes. Set the shrine with the candle unlit, the cauldron filled with water, the offerings, spoon, promise and notebook.',
        steps: [
          {
            title: 'Light the fire',
            instructions: 'Light the candle beside the cauldron.',
            spoken: 'Cerridwen of Penllyn, keeper of the cauldron of awen, I light this fire for you.',
            light: true,
          },
          {
            title: 'Make the offerings',
            instructions:
              'Put a pinch of oats and a few drops of milk into the cauldron. Set the bread before it. If you have the herb, lay it beside the cauldron.',
            spoken: 'Here is grain and milk and bread, given freely.',
          },
          {
            title: 'Stir in your promise',
            instructions:
              'Hold your written promise. Read it aloud slowly. Then stir the water three times sunwise as you say the spoken words. Add that this is a self-dedication made in good faith.',
            spoken: 'I stir my promise into your cauldron. I come of my own free will, ready to be changed. I will keep this promise as long as it is true.',
          },
          {
            title: 'Receive three drops',
            instructions:
              'Dip a finger into the cauldron and touch three drops to your lips (only if the water is fresh and clean; otherwise touch your forehead). Sit in silence.',
            minutes: 5,
          },
          {
            title: 'Write',
            instructions:
              'Open your notebook and write for ten minutes without stopping: the first words of your dedicated life. Then read them aloud to her.',
            minutes: 10,
          },
          {
            title: 'Close',
            instructions: 'Thank her and snuff the candle.',
            spoken: 'Cerridwen, thank you. Keep the fire under the cauldron, and keep me in your care.',
            snuff: true,
          },
        ],
        closing:
          'Leave the cauldron overnight, then pour the water onto the earth. Give the bread and oats to the birds or the compost. Keep your promise inside the front cover of your notebook, and begin your creative practice the next day.',
        safety:
          'Keep the candle beside the cauldron, not in it, on a heatproof dish, and never leave it unattended. Only touch the water to your lips if it is fresh and clean; never drink water that has stood overnight. Avoid mugwort if pregnant.',
      },
    },
    {
      kind: 'ongoing',
      title: 'A year and a day of stirring',
      intro:
        'The relationship lives in steady practice. Here is a rhythm: weekly stirring and making, her holy days, and a renewal after a year and a day.',
      days: 4,
      lessons: [],
      practices: [
        {
          id: 'cerridwen-weekly',
          title: 'Weekly stirring',
          instructions:
            'Once a week, fill her cauldron, offer oats and milk, stir three times, and make something for twenty minutes. Offer it to her.',
          times: 52,
          every: 'week',
          prompt: 'What did you make this week? Did any drops fall?',
        },
        {
          id: 'cerridwen-holy-days',
          title: 'Samhain and May Eve',
          instructions:
            'At Samhain, retell the tale of Gwion and the cauldron aloud, honour your dead, and release one thing you are done with by writing it, tearing it up and composting it. On May Eve, honour the finding of Taliesin with a new beginning in your creative work.',
          times: 1,
          every: 'holy-day',
          prompt: 'What ended, and what was reborn?',
          premade: 'folk-apple-candle-halloween',
        },
        {
          id: 'cerridwen-renew',
          title: 'Renewal after a year and a day',
          instructions:
            'A year and a day after your dedication, read your promise before her. Say honestly what you kept. Gather what you made over the year and offer it to her. Write a new promise, or release the old one with thanks.',
          times: 1,
          every: 'holy-day',
          prompt: 'How has the year changed you?',
        },
      ],
    },
  ],
  sources: [
    'Lady Charlotte Guest, trans., The Mabinogion (1849), “Taliesin”, Project Gutenberg: https://www.gutenberg.org/ebooks/5160 (quoted: the opening; the cauldron “of Inspiration and Science”; the three drops; “by reason of his beauty”; “Behold a radiant brow!”).',
    'Patrick K. Ford, ed., Ystoria Taliesin (University of Wales Press, 1992).',
    'Marged Haycock, ed., Legendary Poems from the Book of Taliesin (2007).',
    'Rachel Bromwich, ed., Trioedd Ynys Prydein (4th ed., 2014).',
    'Ronald Hutton, Blood and Mistletoe: The History of the Druids in Britain (2009).',
    'Robert Graves, The White Goddess (1948).',
  ],
};
