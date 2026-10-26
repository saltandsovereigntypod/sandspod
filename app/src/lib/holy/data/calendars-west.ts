// Pages for the events of the Roman, Attic and Old Icelandic calendars
// (lib/calendars/roman.ts, attic.ts, icelandic.ts): what each day was, who
// was honoured, what the sources say and where they stop, and how to keep it
// now. Second days of a festival get a short page pointing to the first.
// Quotations are from public-domain texts only (the Latin, or translations
// published before 1929); everything else is in our own words. Pure data.

import type { HolyPage } from '../types.ts';

const R = 'Roman';
const SCULLARD = 'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (Thames & Hudson, 1981)';
const FASTI = (book: number) => `Ovid, Fasti ${book} (Latin text): https://www.thelatinlibrary.com/ovid/ovid.fasti${book}.shtml`;
const VARRO = 'Varro, De Lingua Latina 6.12–26 (Latin text): https://www.thelatinlibrary.com/varro.ll6.html';
const CALENDARIUM = 'W. Smith, Dictionary of Greek and Roman Antiquities (1875), “Calendarium”, at LacusCurtius: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA*/Calendarium.html';
const PLUT_RQ = 'Plutarch, Roman Questions (Loeb, 1936), at LacusCurtius: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Roman_Questions*/home.html';
const MACROBIUS = 'Macrobius, Saturnalia 1.7–1.16';
const BEARD = 'M. Beard, J. North & S. Price, Religions of Rome (Cambridge, 1998), vols. 1–2';


export const CALENDAR_WEST_PAGES: HolyPage[] = [
  // ─── Roman: January ─────────────────────────────────────────────────────
  {
    ref: 'roman-compitalia',
    title: 'Compitalia',
    aka: ['Feast of the Crossroads', 'Lares Compitales', 'Ludi Compitalicii'],
    tradition: R,
    summary: 'The feast of the Lares of the crossroads, kept by neighbourhoods and farms at the little shrines where paths and boundaries met, in the first days of the new year.',
    honours: 'The Lares Compitales, the guardian spirits of the crossroads and of everyone who lived around them: free, freed and enslaved alike. The Lares were the closest gods a Roman had, the ones who watched over a house, a field, a street. At the Compitalia the whole neighbourhood honoured them together, and the household’s own Lares were not forgotten.',
    history: `Where the paths of several farms met, or where streets crossed in the city, stood a small shrine, the compitum, open on each side so that each household faced its own Lares. The Compitalia was a movable feast: each year the praetor announced it for a day soon after the Saturnalia. Under the Empire it settled on 3–5 January, the dates kept here.

Each household hung a woollen doll at the shrine for every free person in it, and a woollen ball for every enslaved person, as Festus and Macrobius report; ancient writers already argued about what this meant, some calling the dolls substitutes for the people themselves. On farms the enslaved workers had a share in the feast and, says Cato, an extra ration of wine. In the city the feast was run by neighbourhood associations, many of them led by freedmen, and the games that went with it could become rowdy enough that the Senate banned them for a time in the late Republic.

Augustus reorganised the street shrines around 7 BCE, adding his own Genius beside the Lares, now called the Lares Augusti, so that the neighbourhood cult also became a cult of the emperor. Small altars and paintings from Pompeii show crossroad shrines with their two dancing Lares and a snake below.`,
    knowAndDont: {
      known: 'That it was a feast of the Lares at the crossroads, set yearly by the praetor in early January; that households hung woollen figures and balls at the shrine; that the enslaved took part and had extra rations; that Augustus reshaped the neighbourhood shrines. Many shrines survive at Pompeii.',
      unknown: 'Exactly what the woollen dolls and balls meant, and whether they once stood in for human offerings, as some ancient writers guessed (there is no evidence that they did). The precise words and order of the rite. How much of the rural and the city feast were the same.',
    },
    celebrate: [
      'Visit a crossroads, a corner or a path near your home, and leave a small offering for the spirits of the neighbourhood: a little grain, a flower, a drop of wine poured on soil.',
      'Honour your own household Lares at home with incense, salted flour and a few words for everyone who lives with you.',
      'Hang a small woollen tassel or pompom by your door for each person in the home, as a reminder of who the Lares keep.',
      'Do something kind for the people you live among: shovel a neighbour’s path, share food, learn a name you didn’t know.',
    ],
    ritual: { premade: 'folk-lararium-offering', title: 'Offering at the Lararium, for the Lares of the house and street' },
    correspondences: {
      deities: ['Lares Compitales', 'Lares', 'Genius of the household'],
      herbs: ['Frankincense', 'Bay', 'Rosemary'],
      colors: ['White Candle', 'Red Candle'],
      foods: ['Honey cakes', 'Salted flour (mola salsa)', 'Wine'],
      symbols: ['Crossroads', 'Woollen dolls and balls', 'Two dancing Lares'],
    },
    sources: [SCULLARD, MACROBIUS + ' (Saturnalia 1.7.34–35 on the dolls)', 'Cato, De Agri Cultura 57', 'H. Flower, The Dancing Lares and the Serpent in the Garden (Princeton, 2017)', 'https://en.wikipedia.org/wiki/Compitalia', CALENDARIUM],
  },
  {
    ref: 'roman-agonalia',
    title: 'Agonalia of Janus',
    aka: ['Agonium', 'Dies Agonalis'],
    tradition: R,
    summary: 'The first great sacrifice of the Roman year, a ram offered to Janus, god of doors and beginnings, by the king of sacred things.',
    honours: 'Janus, the two-faced god of doorways, gates, passages and beginnings, who was named first in Roman prayers because every act begins by passing through him. A Roman praying to any god began with Janus and ended with Vesta.',
    history: `On 9 January the rex sacrorum, the “king of sacred things” who kept the old priestly duties of the kings, sacrificed a ram in the Regia, the old king’s house in the Forum. Varro explains the name from the sacrificer’s question before he struck, “agone?”, “shall I do it?” Ovid, who opens his Fasti with Janus, offers several more guesses and admits none is certain.

There were four Agonia in the year: 9 January, 17 March, 21 May and 11 December, honouring different gods. The January one belonged to Janus, fitting the month that bore his name. Janus had no myth to speak of in early Rome; he was the god of the threshold itself, his double-faced image looking out and in, back to the old year and on to the new. The gates of his shrine in the Forum stood open in time of war and were closed only in rare years of peace.`,
    knowAndDont: {
      known: 'The date, the priest (the rex sacrorum), the place (the Regia) and the victim (a ram), from the calendars, Varro and Ovid.',
      unknown: 'What “Agonalia” really means: the ancients themselves offered rival etymologies. The prayers spoken. Why the Agonia fell on the four dates they did.',
    },
    celebrate: [
      'Make the first act of a project or of the day a deliberate one: pause at the door, name what you are starting, and step through.',
      'Clean or bless your front door and threshold, Janus’s place.',
      'Offer Janus a small cake or a little spelt or flour with salt, and a drop of wine or juice, first before any other god.',
      'Look back over the past year and forward to the next, writing one line for each face of Janus.',
    ],
    ritual: {
      title: 'A blessing at the door for Janus',
      outline: [
        'Stand inside your front door with a small dish of flour and salt, a candle and a cup of wine or juice.',
        'Light the candle (keep it away from curtains and coats) and wash your hands.',
        'Open the door. Greet Janus first, as Romans did, and ask him to open well what you begin this year.',
        'Sprinkle a pinch of the salted flour on the threshold and pour a few drops from the cup outside.',
        'Name one thing you are leaving behind as you look out, and one thing you are beginning as you turn to look in.',
        'Close the door, snuff the candle, and greet Vesta last, at the hearth or the stove.',
      ],
    },
    correspondences: {
      deities: ['Janus', 'Vesta'],
      herbs: ['Bay', 'Frankincense'],
      colors: ['White Candle', 'Gold Candle'],
      foods: ['Spelt or flour with salt', 'Honey cakes', 'Wine'],
      symbols: ['Two faces', 'Doorway', 'Key', 'Ram'],
    },
    sources: [VARRO + ' (6.12 on the name)', FASTI(1) + ' (1.317–336)', SCULLARD, CALENDARIUM],
  },
  {
    ref: 'roman-carmentalia',
    title: 'Carmentalia',
    aka: ['Feast of Carmenta'],
    tradition: R,
    summary: 'The first day of the feast of Carmenta, the prophetic goddess who sings the fate of every child born, kept by Roman women; no leather was allowed into her shrine.',
    honours: 'Carmenta, or Carmentis, a goddess of prophecy and childbirth whose name was linked with carmen, a sung charm or prophecy. In legend she was the mother of Evander, the Arcadian who settled on the Palatine before Rome was founded, and she foretold Rome’s greatness. She had her own priest, the flamen Carmentalis, and a shrine by the gate named after her, the Porta Carmentalis.',
    history: `The feast fell on two days, 11 and 15 January. Ovid says that leather, as a thing taken from a dead animal, was not to be brought into her shrine, and the mothers of Rome kept her rites.

The second day had a story: when women were forbidden to ride in their carriages (carpenta), they refused to bear children until the right was restored, and a second feast was added in thanks. Plutarch and Ovid both tell versions of it; it is an aetiological tale, a story invented to explain a custom, but a telling one about whose festival this was.

Carmenta was also honoured as two sisters or aspects, Porrima (or Antevorta) and Postverta, who looked forward and back. Gellius, quoting Varro, says they were invoked for births: one for a child coming head first, the other for a child coming feet first.`,
    knowAndDont: {
      known: 'The two dates, her flamen and her shrine by the Porta Carmentalis; the ban on leather; her link with childbirth and prophecy; the paired names Porrima and Postverta.',
      unknown: 'What the women actually did in her rites. Whether the carriage story reflects any real event. How old her link with Evander really is.',
    },
    celebrate: [
      'Honour the midwives, doulas, nurses and parents in your life, or give to a maternity charity.',
      'Keep leather out of your shrine or altar space for the day, as her worshippers did.',
      'Write or speak a blessing for a child, or for your own birth: what you hope has been sung over your life.',
      'Practise a gentle form of divination: write your question, sit quietly, and listen for the first words that come.',
    ],
    ritual: {
      title: 'A song for the newborn',
      outline: [
        'Clear a small space and remove anything made of leather from it.',
        'Light a white candle safely and offer a little milk, honey or a small cake to Carmenta.',
        'Speak the name of a child (or a new project) and ask her to sing it a kind fate.',
        'Look back with Postverta: name what has led here. Look forward with Porrima: name what you hope for.',
        'Write the blessing down and keep it, or give it to the family it was for.',
      ],
    },
    correspondences: {
      deities: ['Carmenta', 'Juno'],
      herbs: ['Bay', 'Lavender'],
      crystals: ['Moonstone'],
      colors: ['White Candle'],
      foods: ['Milk and honey', 'Small cakes'],
      symbols: ['Song', 'Carriage', 'Two faces looking forward and back'],
    },
    sources: [FASTI(1) + ' (1.461–636)', 'Aulus Gellius, Attic Nights 16.16', 'Plutarch, Roman Questions 56: ' + PLUT_RQ, VARRO, SCULLARD],
  },
  {
    ref: 'roman-carmentalia-2',
    title: 'Carmentalia (second day)',
    aka: ['Carmentalia II'],
    tradition: R,
    summary: 'The second day of Carmenta’s feast, four days after the first. See the Carmentalia for the full story.',
    honours: 'Carmenta again, especially as Porrima and Postverta, who look forward and back at a birth.',
    history: `Ovid and Plutarch say the second day was added after Roman women refused to bear children until their right to ride in carriages was given back. Whatever the truth of that story, the two days belonged together as one feast of Carmenta. The fuller page is on the Carmentalia, 11 January.`,
    knowAndDont: {
      known: 'That the calendars mark 15 January as a second Carmentalia.',
      unknown: 'Why the feast had two days four days apart; the carriage story is a later explanation.',
    },
    celebrate: [
      'Return to the blessing you made on the first day and read it aloud again.',
      'Give a small thanks for a safe birth, your own or another’s.',
    ],
    ritual: { title: 'See the Carmentalia', outline: ['Light the candle again, offer milk or honey, and reread your blessing from the first day.'] },
    correspondences: { deities: ['Carmenta'], colors: ['White Candle'] },
    sources: [FASTI(1) + ' (1.617–636)', SCULLARD],
  },

  // ─── Roman: February ────────────────────────────────────────────────────
  {
    ref: 'roman-quirinalia',
    title: 'Quirinalia',
    aka: ['Feast of Quirinus', 'Stultorum feriae', 'Feast of Fools'],
    tradition: R,
    summary: 'The feast of Quirinus, god of the Roman people as citizens, later identified with Romulus made divine; also the “feast of fools” for anyone who had missed their own oven festival.',
    honours: 'Quirinus, one of Rome’s oldest gods, who with Jupiter and Mars formed the ancient triad and had one of the three major flamens. The Romans called themselves Quirites, citizens, and by the late Republic Quirinus was taken to be Romulus, the founder, carried up to the gods in a storm.',
    history: `On 17 February the flamen Quirinalis sacrificed to Quirinus at his temple on the Quirinal hill. Ovid tells the story of Romulus vanishing in a thunderstorm and appearing afterwards to Proculus Julius, asking to be worshipped as Quirinus.

The day was also the last chance to keep the Fornacalia, the festival of ovens, when each curia (the old voting divisions of the people) roasted spelt in honour of Fornax, the oven goddess. The curio maximus posted notices saying which curia kept it when; those who did not know their own curia, or missed the day, kept it on the Quirinalia, which is why it was nicknamed the feast of fools.`,
    knowAndDont: {
      known: 'The date, the flamen, the temple on the Quirinal; the link with the Fornacalia from Varro and Ovid; the late-Republican identification of Quirinus with Romulus.',
      unknown: 'Who Quirinus was before he became Romulus, a question argued by scholars for a century (a god of the community, of the Sabines, or of peaceful farming are all proposed). What the Fornacalia rite looked like in detail.',
    },
    celebrate: [
      'Bake bread, or roast grain in the oven, for the Fornacalia you may have “missed”.',
      'Do one act of good citizenship: vote, volunteer, write to a representative, help a neighbour.',
      'Laugh at your own foolishness: make up a small thing you forgot or put off.',
      'Read the story of Romulus’s disappearance in Ovid’s Fasti or Livy 1.16.',
    ],
    ritual: { premade: 'kitchen-prosperity-bread', title: 'Bread for the oven goddess and the people' },
    correspondences: {
      deities: ['Quirinus', 'Fornax', 'Mars', 'Jupiter'],
      herbs: ['Bay', 'Oak'],
      colors: ['Red Candle', 'Brown Candle'],
      foods: ['Roasted spelt or farro', 'Bread'],
      symbols: ['Oven', 'Spear', 'Storm'],
    },
    sources: [FASTI(2) + ' (2.475–532)', VARRO + ' (6.13)', 'Livy 1.16', SCULLARD],
  },
  {
    ref: 'roman-caristia',
    title: 'Caristia',
    aka: ['Cara Cognatio', 'Day of Dear Kin'],
    tradition: R,
    summary: 'The family feast after the days of the dead: the living kin sat down together, set aside their quarrels and gave a share of the meal to the household Lares.',
    honours: 'The living family, and the Lares of the house who watch over it. It follows directly on the Parentalia (13–21 February), the days for honouring the family dead, as if to turn from the grave back to the table.',
    history: `Ovid describes the day: after visiting the tombs, the family turns to its living members. Those who had wronged their kin (a cruel brother, a grasping heir, a harsh stepmother, Ovid lists them) should stay away. Incense was offered to the family’s gods, food was set out for the Lares in a dish, and at nightfall the family drank to one another and to the emperor.

Valerius Maximus says the feast was meant to settle family disputes, with no outsiders present so that any quarrel could be made up among kin. It is one of the most human of Roman festivals, and one of the easiest to keep now.`,
    knowAndDont: {
      known: 'The date and the shape of the day, from Ovid (Fasti 2.617–638) and Valerius Maximus 2.1.8: a family meal, offerings to the Lares, reconciliation.',
      unknown: 'How widely it was kept, and how old it is; it appears in the calendars but little else.',
    },
    celebrate: [
      'Share a meal with your family, of blood or of choice. Set a small plate aside for the household spirits.',
      'Reach out to someone you have fallen out with, if it is safe and kind to do so.',
      'Raise a glass to each person at the table in turn, saying one good thing about them.',
      'If you are estranged from family for good reasons, keep it with the people who are kin to you now.',
    ],
    ritual: { premade: 'kitchen-family-meal-blessing', title: 'Blessing the family meal' },
    correspondences: {
      deities: ['Lares', 'Concordia'],
      herbs: ['Frankincense', 'Rosemary'],
      colors: ['Pink Candle', 'White Candle'],
      foods: ['A shared meal', 'Wine', 'Small cakes for the Lares'],
      symbols: ['The family table', 'The dish for the Lares'],
    },
    sources: [FASTI(2) + ' (2.617–638)', 'Valerius Maximus, Memorable Doings and Sayings 2.1.8', SCULLARD],
  },
  {
    ref: 'roman-terminalia',
    title: 'Terminalia',
    aka: ['Feast of Terminus'],
    tradition: R,
    summary: 'The feast of Terminus, god of boundary stones: neighbours met at the stone between their lands, garlanded it and shared a sacrifice and a feast.',
    honours: 'Terminus, the god present in every boundary marker, who kept the peace between neighbours by staying exactly where he was put. When Jupiter’s great temple was built on the Capitol, said the story, Terminus alone refused to move, so his stone stayed inside, under a hole in the roof, because he must see the sky.',
    history: `On 23 February the owners of neighbouring fields met at the boundary stone. Ovid describes it fondly: each garlanded the stone from his own side and brought a cake; an altar was built, the farmer’s wife carried fire from the hearth, the old man cut wood, a son threw grain into the flames three times and a daughter offered honeycomb; wine was poured, a lamb or a suckling pig might be sacrificed, and the neighbours feasted together singing Terminus’s praises.

There was also a public rite at the sixth milestone on the road to Laurentum, once Rome’s boundary. Varro notes that the Terminalia had been the last day of the old year, when the year began in March. Roman law took boundaries seriously: moving a boundary stone was an ancient crime.`,
    knowAndDont: {
      known: 'The shape of the rural rite from Ovid’s vivid account, the public rite at the sixth milestone, and the Capitol story (Livy, Ovid, Dionysius).',
      unknown: 'Whether every farm kept it as fully as Ovid describes, or whether his account is idealised (it probably is, a little).',
    },
    celebrate: [
      'Walk the edges of your home or garden, and mark or tidy a boundary: a fence post, a doorstep, the edge of a bed.',
      'Share cakes, honey or a drink with a neighbour.',
      'Take stock of your own boundaries, with people and with time, and name one you want to keep firmer.',
      'Don’t move anyone else’s marker, literally or otherwise.',
    ],
    ritual: {
      premade: 'green-garden-boundary-planting',
      title: 'A blessing for the boundary',
      outline: [
        'Choose a boundary: a fence, a garden edge, a stone, or the threshold of your room.',
        'Garland it with a ribbon, a sprig or a flower.',
        'Offer a small cake and a little honey beside it, and pour a few drops of wine or juice.',
        'Thank Terminus for keeping the peace between you and your neighbours, and ask for a good year on both sides of the line.',
        'Share the rest of the cakes with a neighbour if you can.',
      ],
    },
    correspondences: {
      deities: ['Terminus', 'Jupiter'],
      herbs: ['Oak', 'Rosemary'],
      crystals: ['Hematite', 'Smoky Quartz'],
      colors: ['Brown Candle', 'White Candle'],
      foods: ['Cakes', 'Honeycomb', 'Wine'],
      symbols: ['Boundary stone', 'Garland', 'Hole in the temple roof'],
    },
    sources: [FASTI(2) + ' (2.639–684)', VARRO + ' (6.13)', 'Livy 1.55', SCULLARD],
  },
  {
    ref: 'roman-regifugium',
    title: 'Regifugium',
    aka: ['Fugalia', 'Flight of the King'],
    tradition: R,
    summary: 'The “flight of the king”: after a sacrifice in the Comitium, the rex sacrorum ran from the Forum. The Romans tied it to the expulsion of their last king; what it first meant is lost.',
    honours: 'The god of the sacrifice is not recorded. The day remembers the end of the monarchy and the beginning of the Republic, and perhaps, more anciently, a turning of the year.',
    history: `Ovid connects the day to the flight of Tarquin the Proud, the last king of Rome, driven out around 509 BCE. Plutarch knew the rite: the rex sacrorum offered a sacrifice in the Comitium, the assembly place, and then fled from it at once.

Modern scholars doubt the link with Tarquin. The day falls straight after the Terminalia, at the end of the old year that began in March; some see a rite of the year’s ending, others link it with the two days marked Q.R.C.F. (“when the king has gone to the assembly, it is lawful”) in March and May. No explanation has won out.`,
    knowAndDont: {
      known: 'The date and the bare rite: a sacrifice in the Comitium and the flight of the rex sacrorum (Plutarch, Roman Questions 63; Ovid, Fasti 2.685–852).',
      unknown: 'Its original meaning; the god honoured; whether it had anything to do with Tarquin.',
    },
    celebrate: [
      'Reflect on power: who has it over you, who you have it over, and what you would want to flee or let go of.',
      'Read the story of Lucretia and the founding of the Republic (Livy 1.57–60), with care: it is a story of violence.',
      'Close something properly before the new season begins: finish, return, release.',
    ],
    ritual: {
      title: 'Leaving the old year behind',
      outline: [
        'Write on a slip of paper something you are done with: a role, a habit, an old rule over you.',
        'Light a candle safely and read it aloud once.',
        'Tear the paper and put it in the bin or compost, then walk out of the room without looking back.',
        'Come back after a few minutes, wash your hands and begin something new.',
      ],
    },
    correspondences: {
      deities: ['Jupiter', 'Janus'],
      colors: ['Purple Candle', 'White Candle'],
      symbols: ['Running figure', 'Empty throne'],
    },
    sources: [FASTI(2) + ' (2.685–852)', 'Plutarch, Roman Questions 63: ' + PLUT_RQ, SCULLARD, 'A. K. Michels, The Calendar of the Roman Republic (Princeton, 1967)'],
  },
  {
    ref: 'roman-equirria',
    title: 'Equirria',
    aka: ['Equirria (February)', 'Horse races of Mars'],
    tradition: R,
    summary: 'Horse races for Mars on the Campus Martius, the first of two (the second is 14 March), as the season of war drew near.',
    honours: 'Mars, god of war and of the young men of the community, and in early Rome also a guardian of fields and boundaries. The Romans’ year once began in his month, March.',
    history: `Ovid says Romulus himself founded the Equirria. The races were held on the Campus Martius, the “field of Mars” outside the old city, or, when the Tiber flooded the field, on the Caelian hill. A second Equirria followed on 14 March.

Like the other festivals of Mars in February and March (the dances of the Salii, the purifying of the trumpets, the October Horse at the season’s end), the races seem to prepare horses and men for the year’s campaigns. The details of the races themselves are not recorded.`,
    knowAndDont: {
      known: 'The dates, the place and the dedication to Mars, from the calendars, Ovid (Fasti 2.857–862, 3.517–522) and Varro.',
      unknown: 'How the races were run, who rode, and what rites went with them.',
    },
    celebrate: [
      'Get your body moving: run, ride, cycle, or go for a long brisk walk.',
      'Prepare for something demanding ahead: plan, train, mend your gear.',
      'Light a red candle for Mars and ask for courage and discipline in a struggle you face.',
    ],
    ritual: { premade: 'cosmic-tuesday-mars-courage', title: 'A spark of courage for Mars' },
    correspondences: {
      deities: ['Mars'],
      herbs: ['Bay', 'Ginger', 'Black Pepper'],
      crystals: ['Carnelian', 'Bloodstone', 'Red Jasper'],
      colors: ['Red Candle'],
      symbols: ['Horse', 'Spear', 'Racecourse'],
    },
    sources: [FASTI(2) + ' (2.857–862)', VARRO + ' (6.13)', SCULLARD],
  },

  // ─── Roman: March ───────────────────────────────────────────────────────
  {
    ref: 'roman-equirria-2',
    title: 'Equirria (March)',
    aka: ['Second Equirria'],
    tradition: R,
    summary: 'The second horse races for Mars, two weeks into his own month, on the Campus Martius (or the Caelian when the Tiber flooded). See the February Equirria.',
    honours: 'Mars, at the height of his month, as the campaigning season opened.',
    history: `Ovid places the second Equirria on 14 March and again sends the races to the Caelian if the Campus Martius was under water. It belongs with the other rites of Mars’s month: the Salii dancing through the city with their sacred shields, the Quinquatrus and the Tubilustrium. The fuller page is on the Equirria, 27 February.`,
    knowAndDont: {
      known: 'The date and place (Ovid, Fasti 3.517–522).',
      unknown: 'As with the first Equirria, the races themselves are not described.',
    },
    celebrate: [
      'Repeat what you began at the first Equirria: training, preparation, courage.',
      'Notice the lengthening days and the spring coming in, the season Mars once opened.',
    ],
    ritual: { premade: 'cosmic-tuesday-mars-courage', title: 'See the Equirria (February)' },
    correspondences: { deities: ['Mars'], crystals: ['Carnelian'], colors: ['Red Candle'], symbols: ['Horse'] },
    sources: [FASTI(3) + ' (3.517–522)', SCULLARD],
  },
  {
    ref: 'roman-liberalia',
    title: 'Liberalia',
    aka: ['Feast of Liber Pater'],
    tradition: R,
    summary: 'The feast of Liber and Libera, gods of growth, wine and freedom: old women crowned with ivy sold honey cakes in the streets, and boys often put on the toga of manhood.',
    honours: 'Liber Pater, an old Italian god of growth and of the free (liber), identified with the Greek Dionysus; his partner Libera; and Ceres, with whom they shared a temple on the Aventine, the temple of the plebs, from 493 BCE.',
    history: `Ovid describes old women, crowned with ivy, sitting in the streets with portable hearths, selling liba, cakes of flour, cheese and honey, and offering a piece of each to the god on behalf of the buyer. Varro says much the same. It was also the usual day for a Roman boy of about fifteen or sixteen to lay aside the purple-bordered toga of childhood and put on the plain white toga virilis, with a procession to the Capitol.

Augustine, quoting Varro, describes a cruder country form of the feast at Lavinium, with a phallus carried through the fields for fertility; he was writing to condemn it, so his account should be read with care. In 186 BCE the Senate suppressed the Bacchanalia, the secret Bacchic societies, but the Liberalia itself carried on.`,
    knowAndDont: {
      known: 'The date, the honey cakes and the old women selling them (Ovid, Fasti 3.713–790; Varro 6.14), and the coming-of-age custom.',
      unknown: 'How Liber was worshipped before he merged with Dionysus; the details of the rural rites outside Augustine’s hostile summary.',
    },
    celebrate: [
      'Bake liba, simple honey-and-cheese cakes (Cato gives a recipe: cheese, flour and egg, baked on bay leaves; don’t eat the leaves), and give a piece first to the god.',
      'Mark a coming of age: a young person’s milestone, or your own step into a new freedom.',
      'Pour a small libation of wine or grape juice to Liber.',
      'Wear or hang ivy (it is a decoration only: ivy is not for eating).',
    ],
    ritual: { premade: 'kitchen-honey-sweetening-cake', title: 'Honey cakes for Liber' },
    correspondences: {
      deities: ['Liber Pater', 'Bacchus', 'Libera', 'Ceres', 'Dionysus'],
      herbs: ['Bay'],
      crystals: ['Amethyst'],
      colors: ['Purple Candle', 'Green Candle'],
      foods: ['Liba (honey and cheese cakes)', 'Wine or grape juice', 'Honey'],
      symbols: ['Ivy', 'Toga', 'Wine cup'],
    },
    sources: [FASTI(3) + ' (3.713–790)', VARRO + ' (6.14)', 'Cato, De Agri Cultura 75 (libum)', 'Augustine, City of God 7.21', SCULLARD],
  },
  {
    ref: 'roman-quinquatrus',
    title: 'Quinquatrus',
    aka: ['Quinquatria', 'Greater Quinquatrus', 'Feast of Minerva'],
    tradition: R,
    summary: 'Minerva’s five-day festival of crafts, learning and healing (19–23 March), kept by artisans, teachers, doctors and students; once a single day for Mars.',
    honours: 'Minerva, goddess of skill of hand and mind: of weaving and every craft, of teachers and their pupils, of doctors, poets and painters, and later of war strategy, identified with the Greek Athena. On the first day, Mars too was honoured by the dancing Salii.',
    history: `The name means “the fifth day after” (the Ides), and Varro points out that it was really only one day, misread as five because of the name. Still, by Ovid’s time it ran five days: the first, the anniversary of Minerva’s temple on the Aventine, had no bloodshed; the next four had gladiatorial shows.

Ovid lists who should pray to Minerva at this feast: girls and boys learning, spinners and weavers, fullers and dyers, cobblers, carpenters, doctors, teachers, painters, sculptors and poets. Schoolchildren had holidays and brought their teachers a fee, the minerval. A “lesser Quinquatrus” for the flute-players fell on 13 June.`,
    knowAndDont: {
      known: 'The dates, the link with Minerva’s Aventine temple, the list of trades, the minerval, and Varro’s note that it began as one day (Varro 6.14; Ovid, Fasti 3.809–848).',
      unknown: 'How Mars and Minerva came to share the day; what the earliest single-day rite involved.',
    },
    celebrate: [
      'Bless your tools: a pen, a laptop, needles, brushes, a stethoscope, whatever you work with.',
      'Thank a teacher, or give to a school, library or craft guild.',
      'Learn or practise a skill for an hour with full attention.',
      'Finish a piece of handwork you’ve left aside.',
    ],
    ritual: { premade: 'cosmic-wednesday-mercury-study', title: 'A desk and tool blessing for Minerva’s feast' },
    correspondences: {
      deities: ['Minerva', 'Mars', 'Athena'],
      herbs: ['Rosemary', 'Sage', 'Bay'],
      crystals: ['Fluorite', 'Lapis Lazuli', 'Sodalite'],
      colors: ['Blue Candle', 'Yellow Candle'],
      foods: ['Olives', 'Honey'],
      symbols: ['Owl', 'Olive', 'Loom', 'Tools of a trade'],
    },
    sources: [FASTI(3) + ' (3.809–848)', VARRO + ' (6.14)', SCULLARD, 'https://en.wikipedia.org/wiki/Quinquatria'],
  },
  {
    ref: 'roman-tubilustrium',
    title: 'Tubilustrium',
    aka: ['Purification of the Trumpets'],
    tradition: R,
    summary: 'The purifying of the sacred trumpets used in ritual, on the last day of the Quinquatrus; repeated on 23 May.',
    honours: 'Mars, and perhaps Nerio, his consort; the trumpets (tubae) themselves, which called the people to sacrifices and to war.',
    history: `Varro explains the day in one line: the trumpets of the sacred rites were purified in the Hall of the Shoemakers (Atrium Sutorium). A ewe lamb was sacrificed. The trumpets, like the shields of the Salii and the weapons purified at the Armilustrium in October, had to be ritually clean before the season’s work.

Ovid attaches the day to Minerva, as the close of her Quinquatrus, and to Mars. The same rite was repeated on 23 May.`,
    knowAndDont: {
      known: 'The dates, the place, the purification of ritual trumpets and the lamb, from Varro (6.14) and the calendars.',
      unknown: 'The exact rite of purification and the god it was offered to, which the sources leave unclear.',
    },
    celebrate: [
      'Clean and bless a musical instrument, a bell or anything you use to call or begin.',
      'Clear the air of your home with sound: a bell, a drum, a singing bowl, or clapping in the corners.',
      'Ring something to open the next season’s work.',
    ],
    ritual: {
      title: 'Clearing with sound',
      outline: [
        'Open a window.',
        'Wipe down your instrument, bell or chime with clean water.',
        'Sound it once in each corner of the room, moving clockwise.',
        'Sound it at the centre and say what the coming season’s work is for.',
        'Close the window and put the instrument where you will see it.',
      ],
    },
    correspondences: { deities: ['Mars', 'Minerva'], herbs: ['Bay', 'Rosemary'], colors: ['Red Candle', 'Gold Candle'], symbols: ['Trumpet', 'Bell'] },
    sources: [VARRO + ' (6.14)', FASTI(3) + ' (3.849–850)', SCULLARD],
  },

  // ─── Roman: April ───────────────────────────────────────────────────────
  {
    ref: 'roman-veneralia',
    title: 'Veneralia',
    aka: ['Festival of Venus Verticordia', 'Kalends of April'],
    tradition: R,
    summary: 'The feast of Venus Verticordia, “turner of hearts”, and Fortuna Virilis on 1 April: women washed the goddess’s statue, decked it with flowers, and bathed crowned with myrtle.',
    honours: 'Venus, goddess of love, beauty and desire, here as Verticordia, who turns hearts towards virtue; and Fortuna Virilis, Fortune who smiles on women in their dealings with men. April, said the Romans, was her month.',
    history: `Ovid tells the women of Rome to take the golden necklaces off the goddess’s statue, wash it, dry it, put the jewels back and give her fresh flowers and roses. Then they themselves bathed, crowned with myrtle, and offered incense to Fortuna Virilis, so that any flaw of the body would be hidden from men’s eyes. They also drank a mix of poppy, milk and honey, as Venus did when she was first led to her husband.

The temple of Venus Verticordia was built in 114 BCE after a scandal involving three Vestal Virgins, when the Sibylline books advised it. Whether married women and poorer women kept the feast in different ways (one bathing in the men’s baths, as one source has it) is debated.`,
    knowAndDont: {
      known: 'The shape of the rite, from Ovid (Fasti 4.133–164), and the founding of Verticordia’s temple (Valerius Maximus 8.15.12).',
      unknown: 'Exactly which groups of women did what; the history of Fortuna Virilis and how she came to share the day.',
    },
    celebrate: [
      'Wash and dress a statue, image or candle of Venus, and give her fresh flowers.',
      'Take a slow, cleansing bath with rose petals and a sprig of myrtle or rosemary.',
      'Spend time on care of your body that is for you, not for anyone’s eyes.',
      'Ask Venus to turn your heart toward what is good for it.',
    ],
    ritual: { premade: 'cosmic-friday-venus-love', title: 'A rose bath for Venus Verticordia' },
    correspondences: {
      deities: ['Venus', 'Fortuna Virilis'],
      herbs: ['Rose', 'Jasmine', 'Vanilla'],
      crystals: ['Rose Quartz', 'Emerald'],
      colors: ['Pink Candle', 'Green Candle'],
      foods: ['Milk and honey'],
      symbols: ['Myrtle crown', 'Mirror', 'Dove'],
    },
    sources: [FASTI(4) + ' (4.133–164)', 'Valerius Maximus 8.15.12', SCULLARD],
  },
  {
    ref: 'roman-megalesia',
    title: 'Megalesia',
    aka: ['Ludi Megalenses', 'Games of the Great Mother', 'Megalensia'],
    tradition: R,
    summary: 'Seven days of games (4–10 April) for the Magna Mater, Cybele, brought to Rome from Phrygia in 204 BCE: processions to drum and cymbal, plays in front of her temple, and dinner parties among the leading families.',
    honours: 'The Magna Mater, the Great Mother of the gods, the Phrygian Cybele of Mount Ida, mistress of wild beasts and of mountain places, drawn in a chariot by lions. Her consort Attis came with her worship.',
    history: `In 204 BCE, during the war with Hannibal, the Sibylline books and the oracle at Delphi told Rome to bring the Mother of the gods from Asia Minor. Her sacred black stone was shipped from Pessinus by way of Pergamon. Ovid tells how the ship stuck in the Tiber mud until the noblewoman Claudia Quinta, whose chastity had been doubted, drew it free with her girdle. Her temple on the Palatine was dedicated in 191 BCE.

Her priests, the galli, were eunuchs who castrated themselves in devotion, and Roman citizens were at first forbidden to join them. They processed through the streets begging alms, with frenzied music. The Roman elite, meanwhile, held the games in her honour with plays (several of Terence’s comedies were first performed at them) and gave each other dinners, the mutitationes. Ovid says moretum, a pounded dish of herbs and cheese, was set before the goddess because the earliest people ate the earth’s herbs.

The later great spring festival of Cybele and Attis, with mourning and rejoicing in late March, belongs to the Empire and is a separate thing.`,
    knowAndDont: {
      known: 'The arrival of the goddess in 204 BCE (Livy 29.10–14), the temple, the games and plays, the dinners, and the galli, from Livy, Ovid (Fasti 4.179–372), Cicero and others.',
      unknown: 'How the Phrygian rites were adapted for Rome in detail; how far the galli’s practice was shared with or hidden from ordinary Roman worshippers.',
    },
    celebrate: [
      'Host a dinner for friends, as the Roman families did, and return the invitation through the year.',
      'Make moretum, a garlic, herb and cheese spread (Virgil’s Moretum poem gives the idea), and offer the first spoonful to the Mother.',
      'Play or listen to drumming and cymbals, music that moves the body.',
      'See a play or read one aloud with friends.',
      'Honour the wild places: the mountains, the untamed land, the lions of her chariot.',
    ],
    ritual: {
      title: 'A drum for the Great Mother',
      outline: [
        'Set out an image of a lion, a mountain or a black stone for the Mother, with a candle.',
        'Light the candle safely and offer a little moretum, honey or bread.',
        'Drum, clap or shake a rattle for a few minutes, letting the rhythm build.',
        'In the quiet after, speak your thanks for the earth that holds you up.',
        'Snuff the candle and share the food with others.',
      ],
    },
    correspondences: {
      deities: ['Magna Mater (Cybele)', 'Attis'],
      herbs: ['Garlic', 'Rosemary', 'Myrrh'],
      crystals: ['Obsidian', 'Jet', 'Garnet'],
      colors: ['Red Candle', 'Purple Candle'],
      foods: ['Moretum (herb and cheese)', 'Bread', 'Honey'],
      symbols: ['Lions', 'Turreted crown', 'Drum and cymbals', 'Black stone', 'Pine'],
    },
    sources: ['Livy 29.10–14, 36.36', FASTI(4) + ' (4.179–372)', SCULLARD, BEARD, 'L. Roller, In Search of God the Mother: The Cult of Anatolian Cybele (California, 1999)'],
  },
  {
    ref: 'roman-cerialia',
    title: 'Cerialia',
    aka: ['Ludi Ceriales', 'Games of Ceres'],
    tradition: R,
    summary: 'The games and festival of Ceres, goddess of grain and growing things (12–19 April), ending with the Cerialia proper, when foxes with burning torches were let loose in the Circus.',
    honours: 'Ceres, goddess of the grain, of the growing crops and of the laws of the earth, mother of Proserpina; identified with the Greek Demeter. Her temple on the Aventine, shared with Liber and Libera, was the heart of the Roman plebs and held their archives.',
    history: `The games ran from 12 April, with the last and main day, the Cerialia, on the 19th, when there were races in the Circus Maximus. Ovid explains a strange custom of that day with a story from Carseoli: a boy wrapped a fox in straw and set it alight, and it ran through the crops and burned them; foxes were burned in the Circus in memory. Modern readers see a rite to protect the grain from blight or fire, but this is a guess.

Ovid also says Ceres is happy with little: a little spelt, a pinch of salt, grains of incense, and no ox, since the ox works the fields. People wore white for her. Her worship was closely tied to the plebs: the aediles of the plebs ran her temple, and offenders against the plebeian tribunes could be made forfeit to her.`,
    knowAndDont: {
      known: 'The dates, the games and races, the fox rite and the white clothing, from Ovid (Fasti 4.393–620, 4.679–712) and the calendars; the temple’s plebeian role from Livy and others.',
      unknown: 'The real meaning of the foxes. How much of the cult was originally Italian and how much Greek, since her priestesses were brought in from Greek cities.',
    },
    celebrate: [
      'Wear white, and offer Ceres spelt or bread, a pinch of salt and a little incense.',
      'Sow seeds, tend a garden or a windowsill pot, or support a local farmer.',
      'Give to a food bank: Ceres’s temple was the people’s.',
      'Bake bread from scratch, kneading slowly.',
      'Keep the fox safe: protect, don’t harm.',
    ],
    ritual: { premade: 'green-seed-blessing-before-sowing', title: 'Seed blessing for Ceres' },
    correspondences: {
      deities: ['Ceres', 'Liber Pater', 'Libera', 'Proserpina', 'Demeter', 'Persephone'],
      herbs: ['Calendula', 'Meadowsweet', 'Frankincense'],
      crystals: ['Citrine', 'Moss Agate'],
      colors: ['White Candle', 'Gold Candle', 'Green Candle'],
      foods: ['Spelt', 'Bread', 'Salt', 'Honey'],
      symbols: ['Wheat ears', 'Torch', 'Poppy', 'Fox'],
    },
    sources: [FASTI(4) + ' (4.393–620, 4.679–712)', VARRO + ' (6.15)', SCULLARD, 'B. Spaeth, The Roman Goddess Ceres (Texas, 1996)'],
  },
  {
    ref: 'roman-fordicidia',
    title: 'Fordicidia',
    aka: ['Hordicidia'],
    tradition: R,
    summary: 'A pregnant cow was offered to Tellus, Mother Earth, in each of the thirty curiae and on the Capitol, for the fertility of fields and herds; the eldest Vestal burned the unborn calves and kept the ashes for the Parilia.',
    honours: 'Tellus, the Earth, in April when she too is “pregnant” with the seed, as Ovid says.',
    history: `The name comes from forda, a cow in calf (Varro). Ovid gives the details: thirty-one cows, one for each curia and one on the Capitol; the unborn calves were taken by attendants and burned by the senior Vestal, and the ash was kept to be mixed into the suffimen, the purifying fumigation, used at the Parilia six days later. He also tells how King Numa learned the rite in a dream sent by Faunus during a famine.

It is one of the oldest and starkest Roman rites, and it ties three April festivals together: Fordicidia, Cerialia and Parilia. Modern Roman polytheists do not repeat the sacrifice and instead make bloodless offerings to the Earth.`,
    knowAndDont: {
      known: 'The rite as Ovid describes it (Fasti 4.629–672), the name (Varro 6.15) and the use of the ash at the Parilia.',
      unknown: 'What prayers were said; how the curiae shared the meat; how much Ovid’s story of Numa reflects old tradition.',
    },
    celebrate: [
      'Make a bloodless offering to the Earth: milk, grain, flowers or compost given to the soil.',
      'Sit or lie on the ground for a while and feel what is growing beneath you.',
      'Support farmers who treat their animals and land well.',
      'Collect a little ash from a safe hearth or incense to keep for the Parilia.',
    ],
    ritual: { premade: 'green-land-spirit-garden-offering', title: 'An offering to the Earth' },
    correspondences: {
      deities: ['Tellus', 'Vesta', 'Faunus'],
      herbs: ['Dandelion', 'Comfrey'],
      crystals: ['Moss Agate', 'Smoky Quartz'],
      colors: ['Green Candle', 'Brown Candle'],
      foods: ['Milk', 'Grain'],
      symbols: ['Cow', 'Ash', 'Furrow'],
    },
    sources: [FASTI(4) + ' (4.629–672)', VARRO + ' (6.15)', SCULLARD],
  },
  {
    ref: 'roman-parilia',
    title: 'Parilia',
    aka: ['Palilia', 'Natale di Roma', 'Birthday of Rome', 'Dies Natalis Romae'],
    tradition: R,
    summary: 'The festival of Pales, protector of shepherds and flocks, and the birthday of Rome: sheepfolds were swept and smoked, and people and flocks leapt through bonfires of straw to be purified.',
    honours: 'Pales, the guardian of shepherds and their flocks, whose gender even the Romans were unsure of; and Rome itself, founded, by tradition, on this day in 753 BCE.',
    history: `Ovid, who says he leapt the fires himself, gives a full account. People went to the Vestals for the suffimen, a mix of the ash of the calves burned at the Fordicidia, the blood of the October Horse and bean stalks. At dawn the shepherd sprinkled his sheep with water, swept the fold and decked it with branches and garlands, burned sulphur so the sheep bleated in the smoke, and offered millet cakes and milk to Pales. Facing east, he prayed four times, asking pardon for anything done unknowingly: grazing a sacred grove, disturbing a spring, sitting under a holy tree. Then he washed his hands in dew, drank milk and wine, and leapt through the burning straw.

It was also Rome’s birthday, and it is still celebrated in Rome as the Natale di Roma, with parades of historical re-enactors on 21 April each year.`,
    knowAndDont: {
      known: 'The rural rite in detail from Ovid (Fasti 4.721–862) and Propertius 4.4; the suffimen; the link with Rome’s founding.',
      unknown: 'Pales’s gender and origin; how the shepherd rite became the city’s birthday.',
    },
    celebrate: [
      'Clean your home or the place where your animals live, and freshen it with branches and flowers.',
      'Ask pardon for any harm done unknowingly to the land, its waters and its trees.',
      'Bless your pets or any animals in your care with clean water and a kind word.',
      'Don’t leap a bonfire: walk past a candle flame or a small, contained fire pit instead, with water at hand.',
      'Raise a glass of milk to Rome’s birthday, or watch the Natale di Roma parade online.',
    ],
    ritual: {
      title: 'A purifying smoke for home and animals',
      outline: [
        'Sweep and tidy the room or the animals’ space, and decorate it with a green branch.',
        'Light a little incense or a bundle of bay or rosemary in a fire-safe dish; keep it away from pets’ noses and open a window.',
        'Carry the smoke around the space, asking Pales to keep the household and its creatures healthy.',
        'Offer a little milk and millet or plain biscuits on a dish.',
        'Ask pardon for any harm done unknowingly to the land, then wash your hands in cool water.',
        'Pass your hands over a candle flame once (not through it), and snuff the candle.',
      ],
    },
    correspondences: {
      deities: ['Pales', 'Vesta', 'Romulus (Quirinus)'],
      herbs: ['Bay', 'Rosemary', 'Juniper'],
      crystals: ['Red Jasper', 'Carnelian'],
      colors: ['Red Candle', 'White Candle', 'Green Candle'],
      foods: ['Milk', 'Millet cakes', 'Wine'],
      symbols: ['Straw bonfire', 'Sheepfold', 'She-wolf'],
    },
    sources: [FASTI(4) + ' (4.721–862)', 'Propertius 4.4.73–78', VARRO + ' (6.15)', SCULLARD, 'https://en.wikipedia.org/wiki/Parilia'],
  },
  {
    ref: 'roman-vinalia',
    title: 'Vinalia Priora',
    aka: ['First Vinalia', 'Vinalia Urbana'],
    tradition: R,
    summary: 'The wine festival of Jupiter: last year’s wine was opened and its first draught poured for him; Venus too was honoured, especially by the women of the streets at her temple by the Colline Gate.',
    honours: 'Jupiter, to whom the first of the new wine belonged, and Venus, who in Ovid’s version shares the day.',
    history: `Varro says plainly that the day belongs to Jupiter, not Venus, even though many think otherwise. The wine pressed the autumn before was tasted for the first time, and the first of it poured as a libation to Jupiter before anyone could sell or drink it.

Ovid tells two stories. One is of the Etruscan king Mezentius, who demanded the first of the Latins’ wine, so that they vowed it to Jupiter instead and won. The other is of the temple of Venus Erycina outside the Colline Gate, dedicated in 181 BCE, where the prostitutes of Rome came with myrtle, mint, rushes and roses to pray for beauty and favour.`,
    knowAndDont: {
      known: 'The date, Jupiter’s claim to the first wine (Varro 6.16), and the cult of Venus Erycina on the day (Ovid, Fasti 4.863–900).',
      unknown: 'The exact rite of the libation, and how Venus’s share in the festival came about.',
    },
    celebrate: [
      'Open a bottle you have been keeping, or a fresh juice, and pour the first of it out for Jupiter.',
      'Give the first and best of something to the gods before you enjoy it yourself.',
      'Offer Venus myrtle, mint and roses.',
      'If you don’t drink, use grape juice: the offering is the first share, not the alcohol.',
    ],
    ritual: {
      title: 'The first cup',
      outline: [
        'Set out a cup, the bottle unopened, and a dish or patch of earth to pour into.',
        'Wash your hands and light a candle safely.',
        'Open the bottle and pour the first cup, all of it, for Jupiter, naming what you are thankful for from the past year.',
        'Then pour a cup for yourself and drink.',
        'Lay a sprig of mint or a rose for Venus beside the candle.',
      ],
    },
    correspondences: {
      deities: ['Jupiter', 'Venus'],
      herbs: ['Mint', 'Rose', 'Bay'],
      crystals: ['Amethyst'],
      colors: ['Purple Candle', 'Gold Candle'],
      foods: ['Wine or grape juice'],
      symbols: ['Wine jar', 'Myrtle', 'Thunderbolt'],
    },
    sources: [VARRO + ' (6.16)', FASTI(4) + ' (4.863–900)', 'Pliny, Natural History 18.287', SCULLARD],
  },
  {
    ref: 'roman-robigalia',
    title: 'Robigalia',
    aka: ['Feast of Robigus'],
    tradition: R,
    summary: 'Offerings to Robigus, the power of the red rust that blights grain, to keep it from the young wheat, at a grove on the Via Claudia.',
    honours: 'Robigus (or Robigo), the spirit of wheat rust and mildew, worshipped not out of love but to be turned away: Romans honoured some powers so that they would keep their distance.',
    history: `Ovid says he met the procession on his way back from Nomentum: the flamen Quirinalis, in white, was going to the grove of Robigus to burn the entrails of a dog and a sheep with incense and wine. He gives the priest’s prayer, which asks the harsh goddess to spare the crops and turn her rust to swords and iron instead. Varro says simply that sacrifice was made to Robigus so that rust would not seize the crops. There were also races for men and boys.

Red dogs were sacrificed in other rites for the crops as well, perhaps because their colour matched the rust. The Christian Major Litany, with its procession for the crops on 25 April, may have taken over the day; scholars have long suggested so, though it cannot be proved.`,
    knowAndDont: {
      known: 'The date, the priest, the grove at the fifth milestone, the sacrifice and the prayer (Ovid, Fasti 4.901–942; Varro 6.16).',
      unknown: 'How old the cult was and whether the Christian rogation procession was its direct successor.',
    },
    celebrate: [
      'Walk your garden or a nearby field, and check young plants for rust, mildew and pests.',
      'Treat plant diseases gently and organically; clear away infected leaves.',
      'Ask whatever might harm what you are growing, in the garden or in life, to pass you by.',
      'Make a bloodless offering of incense and a little wine at the edge of the garden.',
    ],
    ritual: {
      title: 'Turning blight away',
      outline: [
        'Go to the edge of your garden or the pots you are growing.',
        'Light a little incense in a fire-safe holder.',
        'Pour a few drops of wine or juice on the ground, outside the growing area.',
        'Ask Robigus to stay away from the crops this year, and name what you want to keep safe.',
        'Look over each plant carefully and tend what needs it.',
      ],
    },
    correspondences: {
      deities: ['Robigus', 'Ceres', 'Quirinus'],
      herbs: ['Frankincense', 'Garlic', 'Yarrow'],
      crystals: ['Moss Agate', 'Green Aventurine'],
      colors: ['White Candle', 'Green Candle'],
      foods: ['Wine', 'Incense'],
      symbols: ['Wheat with red rust', 'Grove', 'Dog'],
    },
    sources: [FASTI(4) + ' (4.901–942)', VARRO + ' (6.16)', 'Pliny, Natural History 18.284–285', SCULLARD],
  },

  // ─── Roman: May–June ────────────────────────────────────────────────────
  {
    ref: 'roman-mercuralia',
    title: 'Mercuralia',
    aka: ['Feast of Mercury', 'Ides of May'],
    tradition: R,
    summary: 'The festival of Mercury on the Ides of May, the birthday of his temple: merchants dipped laurel in water from his spring and sprinkled themselves and their goods for luck in trade.',
    honours: 'Mercury, god of merchants, trade, travel and messages, identified with the Greek Hermes; and his mother Maia, after whom May was named, who also received a sacrifice on the day.',
    history: `Mercury’s temple by the Circus Maximus was dedicated on 15 May 495 BCE, and the merchants’ guild met there. Ovid describes a spring of Mercury near the Porta Capena: the merchant, belted, draws water in a jar, dips a laurel branch, sprinkles the goods he is selling and his own head, and prays, with a wink from the poet, that Mercury will wash away the lies he has told and the oaths he has broken, and bring him profit.

The Ides of May was also the day of the Argei, when the Vestals threw rush figures of men from the Pons Sublicius into the Tiber, a rite as puzzling to the Romans as it is to us.`,
    knowAndDont: {
      known: 'The temple date (Livy 2.21, 2.27), the water rite and the merchant’s prayer (Ovid, Fasti 5.663–692).',
      unknown: 'Whether the water rite was a public ritual or a merchants’ custom; much about the Argei on the same day.',
    },
    celebrate: [
      'Bless your workplace, shop, tools or online business with water and a sprig of bay.',
      'Promise honesty in your dealings for the coming month: the reverse of Ovid’s merchant.',
      'Send messages you owe, and pay small debts.',
      'Plan or bless a journey.',
    ],
    ritual: {
      title: 'Mercury’s water for honest trade',
      outline: [
        'Fill a jar or bowl with fresh water, from a spring if you can.',
        'Dip a bay sprig in it and sprinkle your wallet, tools, shop door or workspace.',
        'Sprinkle a little on your own head.',
        'Ask Mercury for fair dealing and good trade, and promise honesty in return.',
        'Pour what’s left on a plant.',
      ],
    },
    correspondences: {
      deities: ['Mercury', 'Maia', 'Hermes'],
      herbs: ['Bay', 'Lavender', 'Peppermint'],
      crystals: ['Citrine', 'Green Aventurine', 'Fluorite'],
      colors: ['Orange Candle', 'Yellow Candle'],
      foods: ['Bread', 'Wine'],
      symbols: ['Caduceus', 'Purse', 'Winged hat', 'Laurel sprinkler'],
    },
    sources: [FASTI(5) + ' (5.663–692)', 'Livy 2.21, 2.27', SCULLARD],
  },
  {
    ref: 'roman-matralia',
    title: 'Matralia',
    aka: ['Feast of Mater Matuta'],
    tradition: R,
    summary: 'The festival of Mater Matuta, goddess of the dawn and of mothers, kept by women married only once, who prayed for their sisters’ children before their own.',
    honours: 'Mater Matuta, “Mother of the Morning”, an old Italian goddess of the dawn, of growth and of children, identified by the Romans with the Greek Ino, who became the sea-goddess Leucothea.',
    history: `Her temple stood in the Forum Boarium, next to that of Fortuna. Only univirae, women in their first marriage, could garland her image. Ovid says they baked golden cakes in earthenware pots (Varro calls them testuacia) for her, and that a slave-woman was led into the temple and then driven out with blows, which Ovid explains by Ino’s jealousy of a slave who was her husband’s lover. The women prayed first for their sisters’ children.

Plutarch was puzzled by both customs, and modern scholars still argue about them. Some see the care of nieces and nephews as a trace of an older family structure; others as the bonds of sisters that held Roman families together.`,
    knowAndDont: {
      known: 'The temple, the univirae, the cakes, the expelled slave-woman and the prayers for sisters’ children (Ovid, Fasti 6.473–568; Plutarch, Roman Questions 16–17; Varro 5.106).',
      unknown: 'The original meaning of the customs, and how Mater Matuta was understood before her identification with Ino.',
    },
    celebrate: [
      'Get up for the dawn and watch the light come.',
      'Do something for your nieces, nephews, godchildren or your siblings’ families.',
      'Bake small golden cakes and share them.',
      'Thank the women who have mothered you, by blood or by care.',
    ],
    ritual: {
      title: 'A dawn prayer for the children of the family',
      outline: [
        'Rise before sunrise and face east with a candle and a small cake.',
        'Light the candle as the sky brightens.',
        'Name the children of your siblings, friends or community, one by one, asking Mater Matuta to watch over them.',
        'Then name your own, if you have them.',
        'Offer the cake and snuff the candle once the sun is up.',
      ],
    },
    correspondences: {
      deities: ['Mater Matuta', 'Leucothea', 'Fortuna'],
      herbs: ['Calendula', 'Chamomile'],
      crystals: ['Sunstone', 'Moonstone'],
      colors: ['Yellow Candle', 'Pink Candle'],
      foods: ['Golden cakes baked in earthenware'],
      symbols: ['Dawn', 'Mother and child', 'Sea'],
    },
    sources: [FASTI(6) + ' (6.473–568)', 'Plutarch, Roman Questions 16–17: ' + PLUT_RQ, 'Varro, De Lingua Latina 5.106', SCULLARD],
  },
  {
    ref: 'roman-fors-fortuna',
    title: 'Fors Fortuna',
    aka: ['Feast of Lucky Fortune'],
    tradition: R,
    summary: 'The festival of Fors Fortuna, goddess of luck, at her temples across the Tiber: ordinary people and the enslaved floated down the river in garlanded boats to her shrines and drank on the way back.',
    honours: 'Fors Fortuna, Fortune as pure chance and good luck, worshipped especially by the common people. Her temples were said to have been founded by King Servius Tullius, himself born, the story went, of an enslaved mother.',
    history: `Her temples stood on the right bank of the Tiber, at the first and sixth milestones of the road to Portus. Ovid tells the people to go there joyfully, some on foot, some by boat, and not to be ashamed to come home tipsy, garlanded young men drinking in the boats. Because Servius Tullius was of humble birth, the festival belonged especially to the plebs and to the enslaved.

The date, close to the summer solstice, is also noted by the farm writer Columella, who mentions the gardeners’ joyful holiday on the day.`,
    knowAndDont: {
      known: 'The temples, the boats and the merrymaking (Ovid, Fasti 6.773–786), its popularity with the poor and enslaved, and the link with Servius Tullius (Varro 6.17).',
      unknown: 'What rites took place at the temples themselves.',
    },
    celebrate: [
      'Take a boat trip, or walk by a river, and float a small biodegradable flower offering for luck.',
      'Treat friends who have less, or give to a cause for workers’ rights.',
      'Try your luck in some small way that harms nobody.',
      'Picnic outdoors near the solstice.',
    ],
    ritual: { premade: 'sea-river-flower-offering', title: 'A river offering for Fortune' },
    correspondences: {
      deities: ['Fors Fortuna', 'Fortuna'],
      herbs: ['Basil', 'Mint', 'Calendula'],
      crystals: ['Green Aventurine', 'Citrine', 'Tiger Eye'],
      colors: ['Green Candle', 'Gold Candle'],
      foods: ['Wine', 'Picnic food'],
      symbols: ['Wheel', 'Rudder', 'Cornucopia', 'Garlanded boat'],
    },
    sources: [FASTI(6) + ' (6.773–786)', VARRO + ' (6.17)', 'Columella, On Agriculture 10 (the gardeners’ holiday of Fors Fortuna)', SCULLARD],
  },

  // ─── Roman: July ────────────────────────────────────────────────────────
  {
    ref: 'roman-poplifugia',
    title: 'Poplifugia',
    aka: ['Flight of the People'],
    tradition: R,
    summary: 'The “flight of the people”, an old festival of Jupiter whose meaning the Romans themselves explained in different ways.',
    honours: 'Jupiter, by the calendars. Nothing else certain is known of the rite.',
    history: `Varro says the people fled in sudden panic on that day, probably, he thinks, before an attack by neighbouring peoples after the Gauls had sacked Rome. Plutarch and Dionysius tell instead that it was the day Romulus vanished in a storm, and the people scattered in terror. Macrobius and others link it with the Nonae Caprotinae two days later, when, the story went, slave-women saved Rome from a Latin attack.

The confusion itself is the main fact: by the late Republic, the Romans no longer knew what their own rite meant. Modern scholars have suggested a ritual flight like the Regifugium, but nobody knows.`,
    knowAndDont: {
      known: 'That 5 July was marked Poplifugia, a feast of Jupiter, in the calendars; Varro’s and Plutarch’s explanations.',
      unknown: 'What the rite was or meant. Almost everything.',
    },
    celebrate: [
      'Sit with not knowing: a whole festival survived as a name only.',
      'Think about crowds and fear, and how a community recovers from panic.',
      'Make a small offering to Jupiter for steadiness and good order.',
    ],
    ritual: {
      title: 'A steadying for Jupiter',
      outline: [
        'Light a candle safely and sit quietly with your feet on the floor.',
        'Breathe slowly until any rush or panic in you settles.',
        'Offer a little wine or water to Jupiter for order and safety in your community.',
        'Name one thing you can do to be steady for others when panic spreads.',
      ],
    },
    correspondences: { deities: ['Jupiter'], crystals: ['Smoky Quartz', 'Hematite'], colors: ['Blue Candle', 'White Candle'], symbols: ['Crowd', 'Storm'] },
    sources: [VARRO + ' (6.18)', 'Plutarch, Romulus 27, Camillus 33', MACROBIUS + ' (1.11.36–40)', SCULLARD],
  },
  {
    ref: 'roman-ludi-apollinares',
    title: 'Ludi Apollinares',
    aka: ['Games of Apollo'],
    tradition: R,
    summary: 'Games for Apollo (6–13 July), vowed in 212 BCE during the war with Hannibal: plays in the theatre and, on the last day, races in the Circus, with the people watching crowned with laurel.',
    honours: 'Apollo, god of healing, prophecy, music and the laurel, one of the few Greek gods the Romans took over with his own name; and Latona, his mother.',
    history: `Livy tells how, in 212 BCE, the prophecies of a seer named Marcius advised games for Apollo to drive the enemy from Italy. They were held with sacrifices in the Greek manner, the people watched wearing garlands, and married women prayed at the temples. In 208 BCE, during a plague, they were made yearly and given a fixed date.

Apollo’s temple in Rome stood in the Campus Martius, built in 431 BCE after another plague, for Apollo Medicus, the healer. Later Augustus raised a magnificent temple to Apollo on the Palatine, next to his own house. The games came to last eight days, mostly theatrical, with the races in the Circus on the 13th.`,
    knowAndDont: {
      known: 'The founding and the vow (Livy 25.12, 27.23), the dates, the plays and races, the laurel crowns.',
      unknown: 'Which plays were performed in most years, and how the rites at the temple were carried out.',
    },
    celebrate: [
      'Go to the theatre, a concert or an open-air play; or read a play aloud.',
      'Wear or hang a laurel (bay) crown.',
      'Give to a cause for public health or medical care.',
      'Make music for Apollo.',
    ],
    ritual: {
      title: 'Laurel and music for Apollo',
      outline: [
        'Weave a small crown or bundle of bay leaves.',
        'Wash your hands and light a candle safely.',
        'Offer a leaf or two, a little honey or a cake, and ask Apollo for health and clarity.',
        'Play, sing or read aloud a poem for him.',
        'Wear the crown for a while, then hang it in your home.',
      ],
    },
    correspondences: {
      deities: ['Apollo', 'Latona'],
      herbs: ['Bay', 'Saffron', 'Calendula'],
      crystals: ['Sunstone', 'Citrine', 'Amber'],
      colors: ['Gold Candle', 'Yellow Candle'],
      foods: ['Honey cakes', 'Wine'],
      symbols: ['Laurel crown', 'Lyre', 'Theatre mask'],
    },
    sources: ['Livy 25.12, 27.23', SCULLARD, BEARD],
  },
  {
    ref: 'roman-lucaria',
    title: 'Lucaria',
    aka: ['Festival of the Grove'],
    tradition: R,
    summary: 'The festival of the grove (lucus), on 19 and 21 July, perhaps to win the favour of the spirits of a wood before clearing it; little else is known.',
    honours: 'The numina, the divine powers, of sacred groves. Romans believed a grove had its own presiding god or goddess, even when they did not know its name.',
    history: `Festus, our main source, says the Lucaria was held in a great grove between the Via Salaria and the Tiber, where the Romans had taken refuge after their defeat by the Gauls at the Allia in 390 BCE. Plutarch connects the word lucar, the money paid to actors, with revenues from sacred groves.

Cato, writing about farming, gives the prayer a farmer should say before thinning a grove: a pig was offered to the god or goddess to whom the grove was sacred, asking for favour on the household. The Lucaria may have had a similar purpose, but no text says so.`,
    knowAndDont: {
      known: 'The two dates and the grove by the Via Salaria (Festus); Cato’s grove-thinning prayer (De Agri Cultura 139).',
      unknown: 'The god or goddess honoured, the rite, and its true purpose; it is one of the most obscure festivals in the calendar.',
    },
    celebrate: [
      'Go into a wood or park and sit quietly under the trees.',
      'If you need to cut back a tree or hedge, ask its spirit first and give an offering.',
      'Plant a tree, or support a woodland trust.',
      'Pick up litter in a park or forest.',
    ],
    ritual: { premade: 'green-tree-befriending-offering', title: 'Befriending the grove' },
    correspondences: {
      deities: ['Silvanus', 'Diana', 'Faunus'],
      herbs: ['Oak', 'Birch', 'Willow'],
      crystals: ['Moss Agate', 'Jade'],
      colors: ['Green Candle', 'Brown Candle'],
      symbols: ['Grove', 'Oak leaf'],
    },
    sources: ['Festus, De Verborum Significatu, s.v. Lucaria', 'Plutarch, Roman Questions 88: ' + PLUT_RQ, 'Cato, De Agri Cultura 139', SCULLARD],
  },
  {
    ref: 'roman-lucaria-2',
    title: 'Lucaria (second day)',
    aka: ['Lucaria II'],
    tradition: R,
    summary: 'The second day of the festival of the grove, two days after the first. See the Lucaria.',
    honours: 'The spirits of sacred groves.',
    history: `The calendars mark both 19 and 21 July as Lucaria. As with other paired festivals, the reason for two days is not recorded. The fuller page is on the Lucaria, 19 July.`,
    knowAndDont: { known: 'That both days were marked.', unknown: 'Why there were two, or how the second differed.' },
    celebrate: ['Return to the wood or tree you visited on the first day and leave a little water at its roots.', 'Spend some time outdoors under leaves.'],
    ritual: { premade: 'green-tree-befriending-offering', title: 'See the Lucaria' },
    correspondences: { herbs: ['Oak'], colors: ['Green Candle'], symbols: ['Grove'] },
    sources: [SCULLARD],
  },
  {
    ref: 'roman-furrinalia',
    title: 'Furrinalia',
    aka: ['Feast of Furrina'],
    tradition: R,
    summary: 'The feast of Furrina, an ancient goddess with a grove and spring on the Janiculum; by Varro’s time hardly anyone remembered who she was, though she kept her own flamen.',
    honours: 'Furrina, a goddess so old that she had one of the fifteen flamens, the priests of the oldest cults, yet so forgotten that Varro wrote her name was known to few.',
    history: `Varro says simply that the Furrinalia is named for Furrina, for whom the day is a public festival, and that the flamen Furrinalis kept her rites, though her name was now barely known. Her grove, the Lucus Furrinae, lay on the slopes of the Janiculum, across the Tiber; it was there that Gaius Gracchus died in 121 BCE. Cicero, guessing, linked her with the Furies.

Inscriptions from the site under the Empire speak of nymphs, Furrinae, which suggests a goddess, or goddesses, of a spring. The site later held a sanctuary of Syrian gods, whose ruins have been excavated.`,
    knowAndDont: {
      known: 'Her name, her flamen, her grove and its spring, from Varro (5.84, 6.19), Cicero, Plutarch and inscriptions.',
      unknown: 'Who she was and what her worship involved. She is a lesson in how gods can be forgotten.',
    },
    celebrate: [
      'Visit a spring, a fountain or a stream, and leave a flower.',
      'Remember a forgotten god, ancestor or tradition: learn its name and say it aloud.',
      'Write down something about your own practice that you would not want lost.',
    ],
    ritual: {
      title: 'For the forgotten goddess',
      outline: [
        'Pour fresh water into a bowl and set a candle beside it.',
        'Light the candle safely and say Furrina’s name three times.',
        'Admit honestly that we don’t know who she was, and offer the water and a flower anyway.',
        'Name any other forgotten powers or people you want remembered.',
        'Pour the water on a plant or into the earth outside.',
      ],
    },
    correspondences: { deities: ['Furrina', 'Nymphs'], herbs: ['Willow', 'Mint'], crystals: ['Aquamarine'], colors: ['Blue Candle', 'Grey Candle'], symbols: ['Spring', 'Grove'] },
    sources: [VARRO + ' (6.19)', 'Cicero, On the Nature of the Gods 3.46', 'Plutarch, Gaius Gracchus 17', SCULLARD, 'https://en.wikipedia.org/wiki/Furrina'],
  },

  // ─── Roman: August ──────────────────────────────────────────────────────
  {
    ref: 'roman-diana',
    title: 'Ides of August: Diana',
    aka: ['Nemoralia', 'Festival of Torches', 'Dies natalis of Diana on the Aventine', 'Servorum dies festus'],
    tradition: R,
    summary: 'The birthday of Diana’s temple on the Aventine and a holiday for the enslaved; women washed their hair, and at her grove by Lake Nemi worshippers came with torches.',
    honours: 'Diana, goddess of the wild woods, of hunting, of the moon and of women in childbirth; in the Aventine temple a protector of the Latin peoples and of the lowly, since the temple was said to have been founded by Servius Tullius. At Nemi she was Diana Nemorensis, “of the grove”, with the water-nymph Egeria and the hero Virbius.',
    history: `Festus calls the Ides of August a holiday of slaves, because Servius Tullius, born of an enslaved mother, dedicated Diana’s temple on the Aventine that day. Plutarch asks why women washed their hair on the Ides of August, and suggests it was for the same reason.

At Aricia, by the volcanic lake of Nemi in the Alban hills, Diana had a great sanctuary in a grove. Ovid and Propertius describe women coming there with torches, garlanded, to give thanks for prayers answered. The poet Statius, writing around 90 CE, says that on the Ides of August the whole grove shone with torches, hunting dogs were garlanded and rested, and the wild animals left in peace. Votive offerings from Nemi include many models of wombs, breasts and babies, showing her care for childbirth.

“Nemoralia” is a modern name for this festival, popular among pagans and witches today, who often keep it with candles and moon-lit vows, sometimes at the August full moon. The ancient evidence supports the torches, the rest and the holiday; the specific modern rituals are new.`,
    knowAndDont: {
      known: 'The Aventine temple’s day and the slaves’ holiday (Festus), the hair-washing (Plutarch, Roman Questions 100), the torch procession at Nemi (Ovid, Fasti 3.261–272; Propertius 2.32; Statius, Silvae 3.1.52–60), and the votive offerings.',
      unknown: 'Whether the torchlit pilgrimage was kept on this one day or at other times too. The name “Nemoralia” for the day is modern, as are its present-day rites. The story of the “King of the Grove” at Nemi, made famous by Frazer, is real but unrelated to this date.',
    },
    celebrate: [
      'Give yourself, and anyone who works for you, a day off.',
      'Wash your hair as an act of devotion, and dress it with flowers.',
      'Light candles or lanterns at a window or by water at dusk; never leave them burning unattended.',
      'Walk in a wood or by a lake, and let wild things be.',
      'Give thanks for a prayer answered, or make a vow to Diana for a birth or a hope.',
    ],
    ritual: {
      title: 'Torches for Diana',
      outline: [
        'At dusk, wash your hair or your face in cool water.',
        'Set candles or lanterns safely by a bowl of water, or by a window facing the moon.',
        'Light them one by one, each for something you want to thank Diana for or ask her for.',
        'Tie a ribbon to a branch or to the bowl as your vow.',
        'Sit in the quiet of the light for a while, then snuff the candles.',
      ],
    },
    correspondences: {
      deities: ['Diana', 'Egeria', 'Virbius'],
      herbs: ['Mugwort', 'Willow', 'Jasmine'],
      crystals: ['Moonstone', 'Selenite', 'Labradorite'],
      colors: ['Silver Candle', 'White Candle'],
      foods: ['Apples', 'Honey cakes'],
      symbols: ['Torch', 'Crescent moon', 'Hunting dog', 'Deer', 'Lake'],
    },
    sources: ['Festus, De Verborum Significatu, s.v. Servorum dies', 'Plutarch, Roman Questions 100: ' + PLUT_RQ, FASTI(3) + ' (3.261–272)', 'Statius, Silvae 3.1.52–60', 'C. M. C. Green, Roman Religion and the Cult of Diana at Aricia (Cambridge, 2007)', 'https://en.wikipedia.org/wiki/Nemoralia'],
  },
  {
    ref: 'roman-portunalia',
    title: 'Portunalia',
    aka: ['Feast of Portunus'],
    tradition: R,
    summary: 'The feast of Portunus, god of harbours, doors and keys, at his temple by the Tiber port.',
    honours: 'Portunus, the god of the portus (harbour) and the porta (gate or door), shown holding a key; later identified with the Greek Palaemon, a sea god who helped sailors. He had his own flamen, so his worship was very old.',
    history: `Varro says the day is named for Portunus, whose temple was built in the Tiber port and whose festival was then established. The small, beautifully preserved Ionic temple in the Forum Boarium beside the river, long called the Temple of Fortuna Virilis, is now usually identified as his.

Festus records that his flamen anointed the weapons of Quirinus with oil, a rite whose day and meaning are unclear. Many modern books say that on the Portunalia keys were thrown into a fire for luck; we have not found an ancient source for this, so treat it with caution.`,
    knowAndDont: {
      known: 'The date, the temple by the river port, the flamen, and Portunus as god of harbours and keys (Varro 6.19; Festus).',
      unknown: 'What the rite involved. The often-repeated custom of throwing keys into the fire lacks a clear ancient source.',
    },
    celebrate: [
      'Bless your keys and your front door.',
      'Oil a stiff lock or hinge, as an act of care for your thresholds.',
      'Visit a harbour, a river port or a canal, and give thanks for safe arrivals.',
      'Bless a journey by water.',
    ],
    ritual: { premade: 'kitchen-threshold-salt-blessing', title: 'A blessing for the door and its keys' },
    correspondences: {
      deities: ['Portunus', 'Janus', 'Neptune'],
      herbs: ['Rosemary', 'Bay'],
      crystals: ['Aquamarine', 'Hematite'],
      colors: ['Blue Candle', 'Silver Candle'],
      symbols: ['Key', 'Harbour', 'Door'],
    },
    sources: [VARRO + ' (6.19)', 'Festus, s.v. Portunus, persillum', SCULLARD, 'https://en.wikipedia.org/wiki/Portunus_(mythology)'],
  },
  {
    ref: 'roman-vinalia-rustica',
    title: 'Vinalia Rustica',
    aka: ['Country Vinalia', 'Second Vinalia'],
    tradition: R,
    summary: 'The country wine festival: the priest of Jupiter opened the grape harvest by cutting the first grapes, praying for the vintage.',
    honours: 'Jupiter, master of the weather that makes or ruins a vintage; and Venus, two of whose temples were dedicated on this day.',
    history: `Varro says the flamen Dialis, the priest of Jupiter, began the grape harvest: he sacrificed a ewe lamb and, between cutting the meat and offering it, picked the first grapes. Until this was done, no new grapes could be brought into the city. The rite asked Jupiter to protect the ripening vines from storms in the last weeks before harvest.

Temples of Venus were dedicated on the day, among them Venus Obsequens in 295 BCE, and the gardeners kept it as a holiday. The April Vinalia opened last year’s wine; this one opened the new harvest.`,
    knowAndDont: {
      known: 'The flamen Dialis’s auspicatio vindemiae, the first picking of grapes (Varro 6.16), and the dedications to Venus.',
      unknown: 'How Venus came to be linked with the Vinaliae, a question the Romans themselves discussed.',
    },
    celebrate: [
      'Eat the first grapes, plums or blackberries of the season, and offer the first to Jupiter.',
      'Pray for good weather for the harvest, and for farmers facing storms or drought.',
      'Visit a vineyard, orchard or farm market.',
    ],
    ritual: {
      title: 'The first grapes',
      outline: [
        'Set a bunch of grapes or the first ripe fruit of the season on a plate.',
        'Wash your hands and light a candle safely.',
        'Cut the first grape and set it aside for Jupiter, asking him to guard the harvest from storms.',
        'Eat the rest with thanks, and share them.',
        'Leave Jupiter’s portion outside on the earth.',
      ],
    },
    correspondences: { deities: ['Jupiter', 'Venus'], herbs: ['Bay', 'Oak'], crystals: ['Amethyst'], colors: ['Purple Candle', 'Green Candle'], foods: ['Grapes', 'Wine or grape juice'], symbols: ['Vine', 'Pruning knife'] },
    sources: [VARRO + ' (6.16, 6.20)', 'Pliny, Natural History 18.289', SCULLARD],
  },
  {
    ref: 'roman-consualia',
    title: 'Consualia',
    aka: ['Feast of Consus'],
    tradition: R,
    summary: 'The festival of Consus, god of the stored harvest, whose altar under the Circus was uncovered today; horses and mules rested and were garlanded, and there were races. (Kept again on 15 December.)',
    honours: 'Consus, god of the grain safely stored, his name probably from condere, “to store away”; closely linked with Ops, the goddess of plenty, whose own feast followed four days later.',
    history: `Consus’s altar stood underground in the Circus Maximus and was uncovered only on his feast days. Livy says it was at the Consualia that Romulus invited the Sabines to games and then seized their daughters, a founding story for Roman marriage. Plutarch says horses and mules were garlanded and rested on the day, and there were races of horses and mules.

Tertullian, a Christian writer, says that on 21 August the flamen Quirinalis and the Vestal Virgins sacrificed at the underground altar. The second Consualia in December, at the end of the autumn sowing, may have blessed the seed put into the earth as this one blessed the grain put into store.`,
    knowAndDont: {
      known: 'The hidden altar, the races, the resting and garlanding of animals (Plutarch, Roman Questions 48), the Sabine story (Livy 1.9) and the priests (Tertullian, De Spectaculis 5).',
      unknown: 'Why the altar was underground; whether Consus was always a god of storage, or also of counsel, as some Romans thought.',
    },
    celebrate: [
      'Give working animals, pets and yourself a day of rest; garland a pet’s collar with a flower.',
      'Fill your pantry, put up preserves or freeze a harvest.',
      'Uncover something you have kept hidden or stored and take stock of it.',
      'Watch or ride in a horse event, or simply visit horses.',
    ],
    ritual: {
      title: 'Blessing the store cupboard',
      outline: [
        'Clear and wipe out a cupboard or pantry shelf.',
        'Light a candle safely beside it.',
        'Set a little of each stored food back in, naming it and giving thanks.',
        'Offer a handful of grain or a crust of bread to Consus and Ops.',
        'Close the cupboard and snuff the candle.',
      ],
    },
    correspondences: { deities: ['Consus', 'Ops'], herbs: ['Bay', 'Meadowsweet'], crystals: ['Citrine', 'Pyrite'], colors: ['Brown Candle', 'Gold Candle'], foods: ['Grain', 'Bread', 'Preserves'], symbols: ['Underground altar', 'Granary', 'Garlanded horse or mule'] },
    sources: ['Livy 1.9', 'Plutarch, Roman Questions 48: ' + PLUT_RQ, 'Tertullian, De Spectaculis 5', VARRO + ' (6.20)', SCULLARD],
  },
  {
    ref: 'roman-volcanalia',
    title: 'Volcanalia',
    aka: ['Feast of Vulcan'],
    tradition: R,
    summary: 'The festival of Vulcan, god of fire, in the dry season when fires threatened the granaries; small fish were thrown into his fire as offerings.',
    honours: 'Vulcan (Volcanus), god of fire, both destructive and useful, and of the forge, identified with the Greek Hephaestus. His oldest shrine, the Volcanal, stood at the foot of the Capitol.',
    history: `Varro says the people threw living creatures into the fire on their own behalf. Festus, writing of a fishermen’s festival in June, says small fish from the Tiber were taken to the Volcanal and offered there in place of human souls; scholars usually take the creatures of the Volcanalia to be fish of the same kind, though no source says so outright. Coming two days after the Consualia, with the harvest just stored, the feast asked the god of fire to spare the grain.

Pliny the Younger says his uncle, the elder Pliny, began studying by lamplight from the Volcanalia onwards, as if this were the day work moved indoors to the lamps. After the great fire of Rome in 64 CE, Domitian built altars to Vulcan in each region of the city, against future fires.`,
    knowAndDont: {
      known: 'The date, the Volcanal, the offering of living creatures (Varro 6.20), and the lamp custom (Pliny, Letters 3.5).',
      unknown: 'Exactly what creatures were offered (fish is likely but inferred), and why; the prayers spoken.',
    },
    celebrate: [
      'Check your smoke alarms, fire extinguisher and escape route.',
      'Clean the stove, the chimney or the grill.',
      'Give thanks for the fire that cooks your food and warms your house.',
      'Begin an evening study habit by lamplight, as Pliny did.',
    ],
    ritual: {
      title: 'Thanking and taming the fire',
      outline: [
        'Have water or a fire blanket at hand before you begin.',
        'Light a single candle in a deep, stable holder.',
        'Thank Vulcan for the fire that serves you, and ask him to keep the house, the harvest and the land from wildfire.',
        'Offer a little grain or a piece of fish to the earth outside, not into the flame.',
        'Snuff the candle and test your smoke alarm.',
      ],
    },
    correspondences: { deities: ['Vulcan', 'Vesta'], herbs: ['Dragon’s Blood', 'Cinnamon'], crystals: ['Carnelian', 'Garnet', 'Obsidian'], colors: ['Red Candle', 'Orange Candle'], foods: ['Small fish', 'Grain'], symbols: ['Forge', 'Hammer and tongs', 'Lamp'] },
    sources: [VARRO + ' (6.20)', 'Festus, s.v. piscatorii ludi', 'Pliny the Younger, Letters 3.5', SCULLARD],
  },
  {
    ref: 'roman-opiconsivia',
    title: 'Opiconsivia',
    aka: ['Opeconsiva', 'Feast of Ops Consiva'],
    tradition: R,
    summary: 'The festival of Ops Consiva, goddess of plenty and of the harvest stored away, in her tiny shrine in the Regia, entered only by the Vestals and the public priest.',
    honours: 'Ops, goddess of abundance and the wealth of the earth, wife of Saturn in Roman theology; here as Consiva, “who stores”, partner of Consus.',
    history: `Varro says her shrine in the Regia was so sacred that only the Vestal Virgins and the public priest could enter it, and the priest went veiled in white. The feast came four days after the Consualia, just as Ops’s winter feast, the Opalia, came four days after the December Consualia, a pairing scholars have noticed for a long time.

Nothing is known of the rite inside the shrine.`,
    knowAndDont: {
      known: 'The shrine in the Regia and who could enter it (Varro 6.21); the pairing with Consus.',
      unknown: 'The rite itself, kept hidden even in antiquity.',
    },
    celebrate: [
      'Count your blessings in a literal way: list what you have stored, saved and grown this year.',
      'Give some of your plenty away.',
      'Keep a small, private act of devotion that no one else needs to see.',
    ],
    ritual: {
      title: 'A hidden shrine of plenty',
      outline: [
        'Choose a small box, jar or cupboard as a private shrine.',
        'Cover your head with a white cloth if you like, as the priest did.',
        'Place in it a little grain, a coin and a written list of what you are thankful for.',
        'Light a candle beside it safely and ask Ops to keep your household in plenty.',
        'Close it and keep it closed until the Opalia in December.',
      ],
    },
    correspondences: { deities: ['Ops', 'Consus', 'Saturn'], herbs: ['Bay', 'Cinnamon'], crystals: ['Citrine', 'Pyrite', 'Green Aventurine'], colors: ['Gold Candle', 'Green Candle'], foods: ['Grain', 'Honey'], symbols: ['Granary', 'Cornucopia', 'White veil'] },
    sources: [VARRO + ' (6.21)', SCULLARD, 'https://en.wikipedia.org/wiki/Ops'],
  },

  // ─── Roman: September–October ───────────────────────────────────────────
  {
    ref: 'roman-ludi-romani',
    title: 'Ludi Romani',
    aka: ['Roman Games', 'Ludi Magni', 'Epulum Iovis'],
    tradition: R,
    summary: 'The Roman Games for Jupiter Best and Greatest, the city’s oldest games, with the Epulum Iovis, a feast laid for the Capitoline gods, on the Ides of September.',
    honours: 'Jupiter Optimus Maximus, the chief god of Rome, with Juno and Minerva, the Capitoline triad, whose great temple was dedicated, by tradition, on the Ides of September in the first year of the Republic.',
    history: `Tradition traced the games to the kings. By Cicero’s time they ran from 5 to 19 September, and a day was added in honour of Julius Caesar after his death, so they began on the 4th. They opened with a grand procession (the pompa circensis) from the Capitol to the Circus, with the images of the gods carried in it, and included chariot races, boxing and, from 364 BCE, plays.

On the Ides the Epulum Iovis was held: the images of Jupiter, Juno and Minerva were set on couches as at a dinner party and served a feast, while the senators dined on the Capitol. On the same day the consul, in early times, drove a nail into the wall of the temple to count the years.`,
    knowAndDont: {
      known: 'The dates and growth of the games, the procession, the Epulum Iovis (Livy, Dionysius of Halicarnassus 7.72, Cicero), and the nail ceremony (Livy 7.3).',
      unknown: 'The real age of the games; how the earliest ones looked before they were expanded.',
    },
    celebrate: [
      'Host a dinner and set a place for the gods: a small plate on the altar or at the head of the table.',
      'Watch or play a sport, and dedicate it to Jupiter.',
      'Mark the year: drive a nail, plant a bulb or make a notch to count it.',
      'Give generously to a public good.',
    ],
    ritual: { premade: 'cosmic-thursday-jupiter-prosperity', title: 'An open hand for Jupiter, and a place set at the feast' },
    correspondences: { deities: ['Jupiter', 'Juno', 'Minerva'], herbs: ['Oak', 'Bay', 'Sage'], crystals: ['Lapis Lazuli', 'Sapphire', 'Amethyst'], colors: ['Purple Candle', 'Blue Candle', 'Gold Candle'], foods: ['A feast', 'Wine', 'Bread'], symbols: ['Eagle', 'Thunderbolt', 'Chariot', 'Banquet couch'] },
    sources: ['Livy 7.2–3', 'Dionysius of Halicarnassus, Roman Antiquities 7.72', 'Cicero, In Verrem 2.5.36', SCULLARD, BEARD],
  },
  {
    ref: 'roman-meditrinalia',
    title: 'Meditrinalia',
    aka: ['Feast of the new wine'],
    tradition: R,
    summary: 'The new wine was first tasted, mixed with old, with the words “I drink new and old wine; I am healed of new and old illness.”',
    honours: 'Jupiter, as the calendars suggest, and the healing power of the wine. Later writers named a goddess Meditrina, “the healer”, perhaps invented to explain the festival’s name.',
    history: `Varro gives the day and the words, in Latin: “Novum vetus vinum bibo: novo veteri morbo medeor”, “I drink new and old wine; I cure new and old illness.” He says the day is named from medendo, healing, and that the custom was kept in Latium. The new wine of the harvest was poured first as a libation and then tasted, mixed with last year’s.

Festus names the goddess Meditrina. No temple or other rite of hers is known.`,
    knowAndDont: {
      known: 'The date and the formula, from Varro (6.21).',
      unknown: 'Whether Meditrina was ever a goddess before the name was explained by her; how the rite went beyond the tasting.',
    },
    celebrate: [
      'Pour a little of last year’s and this year’s wine, juice or cider together, say Varro’s words, and drink.',
      'Name an old hurt and a new one, and ask for healing for both.',
      'Make a healing broth or tea for someone who is ill.',
      'If you avoid alcohol, use fresh grape juice and last year’s preserve or jam.',
    ],
    ritual: {
      title: 'New and old',
      outline: [
        'Pour a little old wine or juice and a little new into one cup.',
        'Pour the first few drops on the ground as an offering.',
        'Say: “I drink new and old wine; I am healed of new and old illness.”',
        'Drink slowly, thinking of one old and one new wound.',
        'Write down one step toward healing each.',
      ],
    },
    correspondences: { deities: ['Jupiter', 'Meditrina'], herbs: ['Bay', 'Thyme', 'Chamomile'], crystals: ['Amethyst', 'Bloodstone'], colors: ['Purple Candle', 'Green Candle'], foods: ['New wine or grape juice', 'Old wine'], symbols: ['Two cups', 'Vine'] },
    sources: [VARRO + ' (6.21, the formula)', 'Festus, s.v. Meditrinalia', SCULLARD],
  },
  {
    ref: 'roman-fontinalia',
    title: 'Fontinalia',
    aka: ['Fontanalia', 'Feast of Fons'],
    tradition: R,
    summary: 'The festival of Fons, god of springs: garlands were thrown into springs and wells, and wellheads were crowned with flowers.',
    honours: 'Fons (or Fontus), god of springs and fresh water, called a son of Janus; and all the springs that fed the city before and alongside its aqueducts.',
    history: `Varro says the Fontinalia is named for Fons, whose feast day it is, “and so they throw garlands into springs and crown wells.” Fons had an altar on the Janiculum and a temple near the Porta Fontinalis, the “spring gate”, vowed in 231 BCE.

Fresh water was sacred in Roman religion; every spring had its spirit, and many were also honoured by nymphs. The custom of dressing wells with flowers lived on in many places in Europe, though the English well-dressings of Derbyshire are a separate, later tradition.`,
    knowAndDont: {
      known: 'The date, the garlands and well-crowning (Varro 6.22), the temple (Cicero, On the Laws 2.56).',
      unknown: 'Any further rite, and the origin of Fons’s link with Janus.',
    },
    celebrate: [
      'Lay a garland or a few flowers by a spring, a fountain or a well (natural, biodegradable ones only).',
      'Clean up a stream bank or support clean-water work.',
      'Drink a glass of fresh water slowly, with thanks.',
      'Find out where your tap water comes from.',
    ],
    ritual: {
      title: 'Crowning the well',
      outline: [
        'Make a small circlet of flowers and greenery.',
        'Go to a spring, fountain, stream or your kitchen tap.',
        'Thank Fons for the water that keeps you alive.',
        'Lay the garland beside the water, or float a single flower if it’s natural water.',
        'Drink a cup of water there, and pour the last of it back.',
      ],
    },
    correspondences: { deities: ['Fons', 'Janus', 'Nymphs'], herbs: ['Mint', 'Willow', 'Meadowsweet'], crystals: ['Aquamarine', 'Blue Lace Agate', 'Clear Quartz'], colors: ['Blue Candle', 'Silver Candle'], foods: ['Fresh spring water'], symbols: ['Garland', 'Well', 'Spring'] },
    sources: [VARRO + ' (6.22)', 'Cicero, On the Laws 2.56', SCULLARD, 'https://en.wikipedia.org/wiki/Fontinalia'],
  },
  {
    ref: 'roman-october-horse',
    title: 'October Horse',
    aka: ['Equus October', 'Ides of October'],
    tradition: R,
    summary: 'A chariot race for Mars on the Ides of October; the right-hand horse of the winning team was sacrificed to him, at the end of the season of war.',
    honours: 'Mars, as the campaigning year closed. The rite also served the city’s purification: the horse’s blood was kept for the Parilia in April.',
    history: `On the Campus Martius two-horse chariots raced, and the right-hand horse of the winning team was killed with a spear at the altar of Mars. Its head was cut off and decorated with loaves of bread, and two neighbourhoods, the people of the Sacred Way and the people of the Subura, fought for it: if the Sacred Way won, it was hung on the Regia; if the Subura, on the Mamilian tower. The tail was carried at a run to the Regia so that its blood dripped on the hearth, and the blood was kept by the Vestals for the Parilia suffimen.

The sources (Festus, Plutarch, Polybius) are brief and puzzling. Ancient writers linked the horse with Troy; modern scholars have compared horse sacrifices in other Indo-European cultures. It is one of the strangest rites in Roman religion.`,
    knowAndDont: {
      known: 'The outline of the rite from Festus, Plutarch (Roman Questions 97) and Polybius (12.4b), including the fight over the head and the blood kept for the Parilia.',
      unknown: 'Its meaning: a harvest rite, a war rite, a royal rite, or all three.',
    },
    celebrate: [
      'Close a season of struggle: put away tools, kit or work you no longer need.',
      'Give thanks to Mars for strength through the year, and ask for rest.',
      'Bake bread and share it, recalling the loaves that crowned the horse.',
      'Make a donation to a horse sanctuary or animal welfare charity.',
    ],
    ritual: {
      title: 'Closing the campaign',
      outline: [
        'Gather objects that stand for the year’s hard work: a planner, a uniform, tools.',
        'Light a red candle safely.',
        'Thank Mars for the strength you had this year, and name what you won and lost.',
        'Offer a small loaf or a piece of bread.',
        'Put the objects away, snuff the candle, and rest for the evening.',
      ],
    },
    correspondences: { deities: ['Mars'], herbs: ['Bay', 'Oak'], crystals: ['Bloodstone', 'Red Jasper'], colors: ['Red Candle'], foods: ['Bread loaves'], symbols: ['Horse', 'Spear', 'Chariot'] },
    sources: ['Festus, s.v. October equus, Panibus', 'Plutarch, Roman Questions 97: ' + PLUT_RQ, 'Polybius 12.4b', SCULLARD, 'https://en.wikipedia.org/wiki/October_Horse'],
  },
  {
    ref: 'roman-armilustrium',
    title: 'Armilustrium',
    aka: ['Purification of Arms'],
    tradition: R,
    summary: 'The purifying of arms on the Aventine, as the campaigning season closed and the Salii danced for Mars.',
    honours: 'Mars, and perhaps Minerva; the weapons and the men who had carried them.',
    history: `Varro explains the name from the place, the Armilustrium on the Aventine, where men under arms performed rites, and from the purifying (lustrare) of arms. The Salii, the leaping priests of Mars who had danced through the city with their sacred shields in March, danced again, closing the season they had opened. Trumpets may have sounded, as at the Tubilustrium.

As the Quinquatrus and Tubilustrium in March prepared the arms of war, the October Horse and the Armilustrium put them away clean.`,
    knowAndDont: {
      known: 'The name, place and purpose (Varro 5.153, 6.22); the Salii’s role.',
      unknown: 'The details of the purification itself.',
    },
    celebrate: [
      'Clean and put away tools, gear or sports equipment for the winter.',
      'Lay down an argument or a fight that has gone on long enough.',
      'Remember those who served in war, and those harmed by it.',
    ],
    ritual: {
      title: 'Cleansing the tools',
      outline: [
        'Gather tools or gear you have used hard this year.',
        'Make khernips-style water: plunge a lit match or bay sprig into a bowl of water (keep it away from anything flammable).',
        'Wipe each tool with the water, thanking it for its work.',
        'Oil or sharpen what needs it, and put it away.',
        'Pour the rest of the water outside.',
      ],
    },
    correspondences: { deities: ['Mars', 'Minerva'], herbs: ['Bay', 'Rosemary', 'Hyssop'], crystals: ['Hematite', 'Black Tourmaline'], colors: ['Red Candle', 'White Candle'], symbols: ['Shield', 'Spear', 'Dancing priests'] },
    sources: [VARRO + ' (6.22)', 'Varro, De Lingua Latina 5.153', 'Plutarch, Romulus 23', SCULLARD],
  },

  // ─── Roman: November–December ───────────────────────────────────────────
  {
    ref: 'roman-ludi-plebeii',
    title: 'Ludi Plebeii',
    aka: ['Plebeian Games', 'Epulum Iovis (November)'],
    tradition: R,
    summary: 'The Plebeian Games (4–17 November), with plays and races, and the Epulum Iovis, the feast of Jupiter on the Capitol, on the Ides.',
    honours: 'Jupiter Optimus Maximus, and the Roman plebs, the common people, for whom the games were held.',
    history: `The Plebeian Games were established by the late third century BCE, and probably held in the Circus Flaminius. Like the Roman Games in September, they had a great feast for Jupiter on the Ides (13 November) and, by the late Republic, ran for about two weeks, most days given to plays. Plautus’s comedy Stichus was first performed at them in 200 BCE.

They were organised by the plebeian aediles, the officials of the common people, and were part of the long political struggle in which the plebs won their own institutions alongside the patricians’.`,
    knowAndDont: {
      known: 'The games, the Epulum Iovis and the performance of plays (Livy; the production notice of Plautus’s Stichus).',
      unknown: 'Their exact founding date and early form.',
    },
    celebrate: [
      'See a comedy or a show with friends, and laugh.',
      'Share a meal and set a place for Jupiter.',
      'Support community theatre or free public events.',
    ],
    ritual: {
      title: 'A place at the table for Jupiter',
      outline: [
        'Lay the table for a meal with one extra small place.',
        'Light a candle safely there.',
        'Serve the first portion of the food and drink to Jupiter’s place.',
        'Eat together and tell stories or jokes.',
        'Afterwards, give the god’s portion to the earth.',
      ],
    },
    correspondences: { deities: ['Jupiter', 'Juno', 'Minerva'], herbs: ['Oak', 'Sage'], crystals: ['Lapis Lazuli'], colors: ['Purple Candle', 'Blue Candle'], foods: ['A shared feast'], symbols: ['Theatre mask', 'Banquet couch'] },
    sources: ['Livy 23.30, 25.2', SCULLARD, BEARD],
  },
  {
    ref: 'roman-faunalia',
    title: 'Faunalia',
    aka: ['Rustic Faunalia', 'Nones of December'],
    tradition: R,
    summary: 'Country people honoured Faunus, god of woods and flocks, with wine, a kid and dancing in the fields.',
    honours: 'Faunus, the wild god of woods, pasture and flocks, who spoke prophecy in the voices of the forest and was identified with the Greek Pan.',
    history: `Horace’s ode to Faunus (Odes 3.18) is the main witness. Faunus is asked to pass gently through the poet’s fields and be kind to the young of the flock, for a kid falls to him at the year’s end and wine is plentiful. When the Nones of December come round, “cum tibi Nonae redeunt Decembres”, the whole village takes its holiday in the meadows with the oxen at rest; the wolf wanders among unafraid lambs, the woods scatter their leaves for him, and the labourer delights to stamp the hated earth in a three-beat dance.

Faunus also had a temple on the Tiber island, dedicated on the Ides of February, and was involved in the Lupercalia. The rural Faunalia of December was a country feast, not a state festival.`,
    knowAndDont: {
      known: 'The country feast as Horace describes it, around 23 BCE.',
      unknown: 'How widely it was kept beyond Horace’s own Sabine district; the rite in detail.',
    },
    celebrate: [
      'Take a walk in the fields or woods and leave a little wine or milk for Faunus.',
      'Give working animals, and yourself, a holiday.',
      'Dance, even badly, on the cold ground.',
      'Listen to the woods, and notice what they say.',
    ],
    ritual: { premade: 'hedge-hearing-the-land-walk', title: 'Hearing the land for Faunus' },
    correspondences: { deities: ['Faunus', 'Silvanus'], herbs: ['Oak', 'Holly', 'Juniper'], crystals: ['Moss Agate', 'Tiger Eye'], colors: ['Green Candle', 'Brown Candle'], foods: ['Wine', 'Milk'], symbols: ['Goat', 'Pan pipes', 'Fallen leaves'] },
    sources: ['Horace, Odes 3.18 (Latin text): https://www.thelatinlibrary.com/horace/carm3.shtml', SCULLARD],
  },
  {
    ref: 'roman-consualia-2',
    title: 'Consualia (December)',
    aka: ['Second Consualia'],
    tradition: R,
    summary: 'The second festival of Consus, god of the stored harvest, as the autumn sowing ended. See the Consualia of 21 August.',
    honours: 'Consus, god of what is stored away, and probably the seed put into the earth.',
    history: `Consus was honoured twice, in August when the harvest was stored and in December when the sowing was done; four days later, on each occasion, came a feast of Ops, his partner. The December rite is even less described than the August one. The fuller page is on the Consualia, 21 August.`,
    knowAndDont: { known: 'The date and the pairing with the Opalia.', unknown: 'The December rite itself.' },
    celebrate: ['Check your winter stores and seeds.', 'Give working animals a rest, as on the August feast.'],
    ritual: { title: 'See the Consualia', outline: ['Bless your store cupboard or seed box with a candle and a handful of grain for Consus.'] },
    correspondences: { deities: ['Consus', 'Ops'], colors: ['Brown Candle'], foods: ['Grain'] },
    sources: [SCULLARD],
  },
  {
    ref: 'roman-opalia',
    title: 'Opalia',
    aka: ['Feast of Ops'],
    tradition: R,
    summary: 'The winter festival of Ops, goddess of plenty and the earth’s riches, during the Saturnalia.',
    honours: 'Ops, goddess of abundance and of the earth, wife of Saturn, honoured in the middle of his Saturnalia.',
    history: `Macrobius says Ops was the wife of Saturn and stood for the earth, which brings forth every good thing, and that her worshippers prayed to her sitting, touching the earth. Her festival fell on 19 December, in the middle of the Saturnalia, four days after the December Consualia.

Very little else is known; her feast was overshadowed by her husband’s.`,
    knowAndDont: {
      known: 'The date, the link with Saturn, and the custom of praying seated on the ground (Macrobius, Saturnalia 1.10.20–22).',
      unknown: 'The rest of the rite.',
    },
    celebrate: [
      'Sit on the ground, palms on the earth or the floor, and give thanks for plenty.',
      'Share food during the winter festivities, especially with those who have little.',
      'Open the box of thanks you set up at the Opiconsivia, if you did.',
    ],
    ritual: {
      title: 'Hands on the earth',
      outline: [
        'Sit on the ground or floor with a candle and a bowl of grain, nuts or bread.',
        'Light the candle safely.',
        'Put both palms flat on the earth and thank Ops for what the year has given.',
        'Offer a handful of the food on the earth outside, and eat some.',
        'Give something away before the year ends.',
      ],
    },
    correspondences: { deities: ['Ops', 'Saturn'], herbs: ['Cinnamon', 'Clove'], crystals: ['Pyrite', 'Citrine', 'Garnet'], colors: ['Gold Candle', 'Green Candle'], foods: ['Nuts', 'Honey', 'Bread'], symbols: ['Cornucopia', 'Earth'] },
    sources: [MACROBIUS + ' (1.10.18–22)', SCULLARD],
  },
  {
    ref: 'roman-divalia',
    title: 'Divalia',
    aka: ['Angeronalia', 'Feast of Angerona'],
    tradition: R,
    summary: 'The festival of Angerona, a goddess shown with her finger to her sealed lips, at the winter solstice; offerings were made in the shrine of Volupia. She was said to guard the secret name of Rome.',
    honours: 'Angerona, a goddess of silence, and perhaps of the turning year, whose statue showed her with her mouth bound and sealed. Pliny says Rome had a secret name that was never to be spoken, and Angerona kept it.',
    history: `Varro says the Angeronalia was named for Angerona, to whom sacrifice was made in the Curia Acculeia. Macrobius adds that the pontiffs sacrificed to her in the shrine of Volupia, goddess of pleasure, and that her statue there had its mouth bound and sealed. Ancient writers offered explanations: that she cured quinsy (angina), a throat disease; that she drove away anguish (angor); or that her silence protected Rome’s secret name, which Pliny says a tribune was put to death for revealing.

Coming on 21 December, close to the solstice, the feast has been read by modern writers as a rite of the sun’s turning, when the days stop shortening, but no ancient source says so.`,
    knowAndDont: {
      known: 'The date, the sealed mouth of her statue, the places of sacrifice (Varro 6.23; Macrobius 1.10.7–9) and the secret name of Rome (Pliny, Natural History 3.65).',
      unknown: 'Her original nature; whether the solstice had anything to do with her.',
    },
    celebrate: [
      'Keep an hour or an evening of silence.',
      'Write down something you will keep secret and safe, and seal it.',
      'Mind your words: speak less, listen more, keep confidences.',
      'Sit in the dark of the solstice and let it be quiet.',
    ],
    ritual: {
      title: 'A sealed silence',
      outline: [
        'Light a single candle safely in a dark room.',
        'Place a finger to your lips and sit in silence for ten minutes.',
        'Write on paper something that should be kept: a vow, a hope, a name.',
        'Fold it, seal it with wax or tape, and put it away until the year turns.',
        'Snuff the candle without speaking, and stay quiet for a while.',
      ],
    },
    correspondences: { deities: ['Angerona', 'Volupia'], herbs: ['Myrrh', 'Lavender', 'Mugwort'], crystals: ['Obsidian', 'Labradorite', 'Amethyst'], colors: ['Black Candle', 'Indigo Candle'], symbols: ['Finger to lips', 'Seal', 'Solstice'] },
    sources: [VARRO + ' (6.23)', MACROBIUS + ' (1.10.7–9)', 'Pliny, Natural History 3.65', SCULLARD],
  },
  {
    ref: 'roman-larentalia',
    title: 'Larentalia',
    aka: ['Larentinalia', 'Feast of Acca Larentia'],
    tradition: R,
    summary: 'Offerings for the dead at the tomb of Acca Larentia, foster-mother of Romulus and Remus.',
    honours: 'Acca Larentia, in one story the shepherd’s wife who nursed the twins Romulus and Remus, and mother of the first Arval Brothers; in another a wealthy woman who left her estate to the Roman people. Both stories honour a mother of Rome.',
    history: `Varro says that the priests made a funeral offering (parentatio) at her tomb in the Velabrum, near the foot of the Palatine. Gellius and Macrobius add that the flamen Quirinalis was present. It was also a feast of Jupiter.

Plutarch tells both stories of Larentia: the nurse of the twins, sometimes called lupa (which can mean she-wolf or prostitute, a pun the Romans enjoyed), and the courtesan who, after spending a night in Hercules’ temple, married a rich man and left all her wealth to Rome. Whichever she was, Rome honoured her among its dead.`,
    knowAndDont: {
      known: 'The offering at her tomb in the Velabrum and the priests involved (Varro 6.23–24; Gellius 7.7; Macrobius 1.10.11–17); the two legends (Plutarch, Romulus 4–5).',
      unknown: 'Who she was, if anyone; whether she was once a goddess of the dead or of the Lares, as her name might suggest.',
    },
    celebrate: [
      'Honour those who raised you, especially those who were not your birth parents.',
      'Visit a grave and leave flowers, or light a candle for the family dead.',
      'Give to a children’s or foster-care charity.',
      'Retell the story of the she-wolf and the twins.',
    ],
    ritual: { premade: 'hedge-ancestor-candle-evening', title: 'An evening for the ones who raised us' },
    correspondences: { deities: ['Acca Larentia', 'Lares', 'Jupiter'], herbs: ['Rosemary', 'Cypress', 'Myrrh'], crystals: ['Jet', 'Smoky Quartz'], colors: ['Black Candle', 'White Candle'], foods: ['Milk', 'Bread', 'Wine'], symbols: ['She-wolf', 'Twins', 'Tomb'] },
    sources: [VARRO + ' (6.23–24)', 'Aulus Gellius, Attic Nights 7.7', MACROBIUS + ' (1.10.11–17)', 'Plutarch, Romulus 4–5', SCULLARD],
  },

  // ─── Attic monthly holy days ────────────────────────────────────────────
  {
    ref: 'attic-athena',
    title: 'Athena’s day (Tritomenis)',
    aka: ['Tritē histamenou', 'The Third', 'Tritogeneia’s birthday'],
    tradition: 'Hellenic',
    summary: 'The third day of every Attic month, kept as Athena’s monthly birthday: she was called Tritogeneia, “third-born”, and the Athenians honoured her on the third.',
    honours: 'Athena, goddess of Athens, of wisdom, crafts, weaving and the defence of the city, born fully armed from the head of Zeus. In Athens she was Polias, guardian of the city, and Parthenos, the maiden of the Parthenon.',
    history: `The Greeks gave several of their gods a monthly birthday, a day in every month that was theirs. Athena’s was the third. Ancient scholars explained her old title Tritogeneia as “born on the third”, though it may first have meant “born by the waters of Triton”; either way the Athenians took the third as her day. Her greatest festival, the Panathenaia, fell on the 28th of Hekatombaion, which, counting the last days of the month backwards as the Athenians did, was also a “third”, the third of the waning month.

These monthly days were not usually great public festivals. They were days when a god was especially near, and when private offerings, household prayers and small gatherings made sense. Modern Hellenic polytheists keep them with simple offerings at home.`,
    knowAndDont: {
      known: 'That the third was Athena’s day, from ancient scholars and lexicographers, gathered by Mikalson; the Panathenaia’s date.',
      unknown: 'How ordinary Athenians kept the monthly day, if at all, beyond the great festivals that fell on it; the original meaning of Tritogeneia.',
    },
    celebrate: [
      'Make khernips, wash your hands, and pour a libation of water, olive oil or wine for Athena.',
      'Offer her an olive, a little oil in a lamp or a small cake.',
      'Do a piece of careful, skilled work: weave, write, study, mend.',
      'Ask for good counsel in a decision you are facing.',
    ],
    ritual: { premade: 'folk-khernips-libation', title: 'Khernips and a libation for Athena' },
    correspondences: {
      deities: ['Athena', 'Hestia'],
      herbs: ['Frankincense', 'Rosemary'],
      crystals: ['Lapis Lazuli', 'Sodalite'],
      colors: ['Blue Candle', 'White Candle'],
      foods: ['Olives', 'Olive oil', 'Honey cakes'],
      symbols: ['Owl', 'Olive tree', 'Aegis', 'Loom'],
    },
    sources: ['J. D. Mikalson, The Sacred and Festival Calendar of Athens (Princeton, 1975)', 'R. Parker, Polytheism and Society at Athens (Oxford, 2005)', 'https://en.wikipedia.org/wiki/Attic_calendar', 'https://www.theoi.com/Olympios/Athena.html'],
  },
  {
    ref: 'attic-tetras',
    title: 'The Fourth (Tetras)',
    aka: ['Tetartē histamenou', 'Day of Hermes and Aphrodite'],
    tradition: 'Hellenic',
    summary: 'The fourth of every Attic month, sacred to Hermes, Aphrodite, Herakles and Eros. Hermes and Herakles were said to be born on a fourth; Hesiod calls it a good day to bring home a bride.',
    honours: 'Hermes, the messenger, guide of travellers and souls, god of luck, trade and herms at the door; Aphrodite, goddess of love and beauty; Eros; and Herakles, the hero who laboured for others.',
    history: `The Homeric Hymn to Hermes says he was born on the fourth day of the month, at dawn, and by evening had stolen Apollo’s cattle. Herakles too was said to be born on a fourth, and a proverb about someone “born on the fourth” meant a person who toils for others’ benefit, like him. Aphrodite and Eros shared the day.

Hesiod advises: “On the fourth of the month bring home your bride, but choose the omens which are best for this business” (Works and Days 800, tr. Evelyn-White, 1914). Theophrastus, in his sketch of the superstitious man, has him on the fourth and the seventh of every month send his household to mull wine while he buys myrtle and frankincense and spends the day garlanding images of the gods at home: a joke at his expense, but proof that ordinary people kept these days. There were also clubs called Tetradistai, “Fourth-day people”, who met on the fourth.`,
    knowAndDont: {
      known: 'The day’s gods, from the Homeric Hymn to Hermes, Hesiod, Theophrastus and later scholia; the existence of Fourth-day clubs.',
      unknown: 'What the Tetradistai did when they met; how Aphrodite and Herakles came to share the day.',
    },
    celebrate: [
      'Leave an offering at your door or at a boundary for Hermes: a coin, a little honey, a stone added to a cairn.',
      'Do something kind for someone you love, or plan a date.',
      'Take on a job for someone else’s benefit, as Herakles did.',
      'Lay myrtle, roses or frankincense on your shrine, as Theophrastus’s man did.',
    ],
    ritual: {
      title: 'For Hermes and Aphrodite on the fourth',
      outline: [
        'Wash your hands in khernips or clean water.',
        'Light a candle or lamp and greet Hestia first.',
        'At your front door, offer Hermes a coin or a little honey, and ask for good journeys and good luck.',
        'At your shrine, offer Aphrodite a flower or a little frankincense, and ask for love in your home.',
        'Pour a short libation for Herakles and Eros, then greet Hestia last.',
      ],
    },
    correspondences: {
      deities: ['Hermes', 'Aphrodite', 'Eros', 'Herakles', 'Hestia'],
      herbs: ['Frankincense', 'Rose', 'Lavender'],
      crystals: ['Rose Quartz', 'Citrine'],
      colors: ['Pink Candle', 'Yellow Candle'],
      foods: ['Honey', 'Wine', 'Cakes'],
      symbols: ['Herm', 'Caduceus', 'Myrtle', 'Dove', 'Club'],
    },
    sources: ['Homeric Hymn to Hermes 19 (tr. Evelyn-White): https://www.theoi.com/Text/HomericHymns1.html', 'Hesiod, Works and Days 800 (tr. Evelyn-White, 1914): https://www.theoi.com/Text/HesiodWorksDays.html', 'Theophrastus, Characters 16 (The Superstitious Man): https://www.gutenberg.org/ebooks/58242', 'J. D. Mikalson, The Sacred and Festival Calendar of Athens (Princeton, 1975)'],
  },
  {
    ref: 'attic-artemis',
    title: 'Artemis’s day',
    aka: ['Hektē histamenou', 'The Sixth'],
    tradition: 'Hellenic',
    summary: 'The sixth of the month, the birthday of Artemis and sacred to her; several of her annual festivals fell on a sixth.',
    honours: 'Artemis, the huntress, mistress of wild animals and wild places, guardian of girls and of women in childbirth, twin sister of Apollo.',
    history: `Diogenes Laertius says Socrates was born on the sixth of Thargelion, the day on which the Athenians purified the city and the Delians said Artemis was born. Her monthly birthday followed. Several of her Athenian festivals fell on a sixth: the Elaphebolia, for Artemis the deer-shooter, on 6 Elaphebolion; and on 6 Boedromion the great yearly thank-offering of goats to Artemis Agrotera, the huntress, vowed before the battle of Marathon.

Like the other monthly birthdays, it was a day when her presence was felt rather than a great civic event every month.`,
    knowAndDont: {
      known: 'Her birthday on the sixth (Diogenes Laertius 2.44), the Elaphebolia and the Marathon offering (Plutarch, On the Malice of Herodotus 26; Xenophon, Anabasis 3.2.12).',
      unknown: 'Exactly what households did on the monthly sixth.',
    },
    celebrate: [
      'Go walking in wild country, or at least under trees, and keep your eyes open for animals.',
      'Offer Artemis water, honey cakes or a sprig of something wild, left outside.',
      'Support wildlife conservation, or girls’ education and sport.',
      'Honour your own independence for a day.',
    ],
    ritual: {
      title: 'An offering in the wild for Artemis',
      outline: [
        'Wash your hands in clean water.',
        'Go to a wild or green place, or a window looking out on one.',
        'Greet Artemis, huntress and protector, and pour a little water or leave a honey cake.',
        'Sit quietly and watch for birds or animals; don’t chase them.',
        'Ask her protection for someone young or vulnerable, and leave nothing behind but the offering.',
      ],
    },
    correspondences: {
      deities: ['Artemis', 'Apollo'],
      herbs: ['Mugwort', 'Wormwood', 'Cypress'],
      crystals: ['Moonstone', 'Selenite'],
      colors: ['Silver Candle', 'White Candle', 'Green Candle'],
      foods: ['Honey cakes', 'Water'],
      symbols: ['Bow', 'Deer', 'Crescent moon', 'Torch'],
    },
    sources: ['Diogenes Laertius, Lives 2.44', 'Plutarch, On the Malice of Herodotus 26', 'J. D. Mikalson, The Sacred and Festival Calendar of Athens (Princeton, 1975)', 'https://www.theoi.com/Olympios/Artemis.html'],
  },
  {
    ref: 'attic-apollo',
    title: 'Apollo’s day (Hebdomē)',
    aka: ['Hebdomē histamenou', 'The Holy Seventh'],
    tradition: 'Hellenic',
    summary: 'The seventh of the month, the birthday of Apollo, holy to him; Hesiod calls it a holy day “on which Leto bare Apollo with the blade of gold”.',
    honours: 'Apollo, god of light, prophecy, music, healing and purification, whose oracle was at Delphi; called Hebdomeios and Hebdomagetes, “of the seventh”.',
    history: `Hesiod lists the first, the fourth and the seventh as holy days: the seventh, “on which Leto bare Apollo with the blade of gold” (Works and Days 770–771, tr. Evelyn-White, 1914). Callimachus tells that swans circled Delos seven times as he was born. Many of his Athenian festivals fell on a seventh: the Thargelia on 7 Thargelion, the Pyanepsia on 7 Pyanepsion and the Boedromia on 7 Boedromion. At Delphi the oracle was said to have spoken at first only once a year, on his birthday, the seventh of the month Bysios.`,
    knowAndDont: {
      known: 'The seventh as Apollo’s holy day, from Hesiod, the festival calendar and Plutarch.',
      unknown: 'How it was kept by ordinary households each month; Theophrastus’s superstitious man suggests garlands and incense at home.',
    },
    celebrate: [
      'Purify yourself with khernips and offer Apollo bay leaves, frankincense or a little honey.',
      'Play, sing or listen to music with full attention.',
      'Do something for your health: a walk in the sun, a check-up you have put off.',
      'Practise a little divination and listen carefully to the answer.',
    ],
    ritual: {
      title: 'Bay and song for Apollo',
      outline: [
        'Make khernips by quenching a lit bay leaf or match in a bowl of water, and wash your hands.',
        'Light a lamp or candle and greet Hestia first.',
        'Burn a pinch of frankincense or lay a bay leaf on the shrine for Apollo (burn only in a fire-safe dish).',
        'Sing, play or read aloud a hymn or poem for him.',
        'Ask for clarity or healing, then pour a libation and greet Hestia last.',
      ],
    },
    correspondences: {
      deities: ['Apollo', 'Leto', 'Artemis'],
      herbs: ['Bay', 'Frankincense', 'Saffron'],
      crystals: ['Sunstone', 'Citrine', 'Amber'],
      colors: ['Gold Candle', 'Yellow Candle', 'White Candle'],
      foods: ['Honey cakes', 'Wine'],
      symbols: ['Lyre', 'Laurel', 'Swan', 'Bow'],
    },
    sources: ['Hesiod, Works and Days 765–771 (tr. Evelyn-White, 1914): https://www.theoi.com/Text/HesiodWorksDays.html', 'Callimachus, Hymn to Delos 249–255', 'Plutarch, Greek Questions 9', 'J. D. Mikalson, The Sacred and Festival Calendar of Athens (Princeton, 1975)'],
  },
  {
    ref: 'attic-poseidon-theseus',
    title: 'Poseidon and Theseus',
    aka: ['Ogdoē histamenou', 'The Eighth'],
    tradition: 'Hellenic',
    summary: 'The eighth of the month, sacred to Poseidon and to his son Theseus, the hero of Athens.',
    honours: 'Poseidon, god of the sea, of earthquakes and of horses, called Asphaleios, “the steadfast”, and Gaieochos, “earth-holder”; and Theseus, the hero who killed the Minotaur and united Attica, Poseidon’s son in one version of his story.',
    history: `Plutarch explains it in his life of Theseus. The Athenians held their chief sacrifice to Theseus, the Theseia, on 8 Pyanepsion, the day he came back from Crete; they honoured him on the eighth of other months too, either because he first came to Athens on 8 Hekatombaion, or because they also honoured Poseidon on the eighth. Eight, Plutarch says, is the first cube of an even number and double the first square, so it stands for the steadiness and immovability of the god who holds the earth firm.

Hesiod also counts the eighth among the good days of the waxing month for work.`,
    knowAndDont: {
      known: 'The eighth as the day of Theseus and Poseidon, and the reasons Plutarch gives (Theseus 36).',
      unknown: 'How Poseidon was honoured on the monthly eighth in practice.',
    },
    celebrate: [
      'Pour a libation of water with a pinch of salt for Poseidon, at the sea or a basin.',
      'Ask for steadiness: a firm footing in a shaky time.',
      'Read the story of Theseus and think about courage that serves a city, not only oneself.',
      'Thank the sea for what it gives, and give to a coastal clean-up or lifeboat charity.',
    ],
    ritual: {
      title: 'Salt water for the Earth-Holder',
      outline: [
        'Wash your hands in khernips or clean water.',
        'Light a lamp and greet Hestia first.',
        'Stir a pinch of sea salt into a bowl of water and offer it to Poseidon, asking him to hold the earth steady beneath you.',
        'Pour a little wine or juice for Theseus, and name a place where you need courage.',
        'Pour the salt water away outside, not on plants, and greet Hestia last.',
      ],
    },
    correspondences: {
      deities: ['Poseidon', 'Theseus', 'Hestia'],
      herbs: ['Juniper'],
      crystals: ['Aquamarine', 'Hematite'],
      colors: ['Blue Candle', 'Indigo Candle'],
      foods: ['Sea salt', 'Wine', 'Fish'],
      symbols: ['Trident', 'Horse', 'Bull', 'Labyrinth'],
    },
    sources: ['Plutarch, Theseus 36 (Loeb, 1914): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Theseus*.html', 'Hesiod, Works and Days 772–773', 'J. D. Mikalson, The Sacred and Festival Calendar of Athens (Princeton, 1975)'],
  },

  // ─── Old Icelandic calendar ─────────────────────────────────────────────
  {
    ref: 'icelandic-skerpla',
    title: 'First day of Skerpla',
    aka: ['Skerpla', 'Eggtíð', 'Stekktíð'],
    tradition: 'Old Icelandic calendar',
    summary: 'The second month of summer begins, on a Saturday in mid-May: the time of lambing, eggs and the first spring work in the home fields.',
    honours: 'The season itself: the land waking after winter, the lambs and the birds’ eggs. No god is attached to the month in the sources.',
    history: `In the list of months in Snorri’s Edda (13th century) this month is called eggtíð or stekktíð, “egg time” or “lambing-pen time”, when birds’ eggs were gathered from the cliffs and ewes and lambs were kept in small pens (stekkir). The name Skerpla appears later and nobody knows what it means; some have guessed it was the name of a forgotten goddess, like Harpa before it, but that is only a guess.

The month’s work was practical: lambing, mending walls, spreading manure on the home field, and gathering eggs and down.`,
    knowAndDont: {
      known: 'Its place in the calendar, its old names in Snorri’s Edda, and the farming work of the season.',
      unknown: 'The meaning of the name Skerpla, and whether any rite marked the day.',
    },
    celebrate: [
      'Eat eggs, or decorate a few, as a nod to egg time.',
      'Do a piece of spring work outside: weed, mend a fence, plant out seedlings.',
      'Look for birds nesting and give them space.',
    ],
    ritual: {
      title: 'Spring work blessing',
      outline: [
        'Go out to your garden, balcony or a nearby green space.',
        'Pour a little milk or water on the ground for the land spirits (landvættir).',
        'Do one real job: plant, weed, mend.',
        'Thank the land for the season’s growth, and go in.',
      ],
    },
    correspondences: { deities: ['Freyr', 'Landvættir'], herbs: ['Birch', 'Dandelion'], crystals: ['Moss Agate'], colors: ['Green Candle'], foods: ['Eggs', 'Skyr', 'Milk'], symbols: ['Egg', 'Lamb', 'Lambing pen'] },
    sources: ['Snorri Sturluson, Edda, Skáldskaparmál (list of the months)', 'Árni Björnsson, Saga daganna (Reykjavík, 1993)', 'Almanak Háskóla Íslands: https://almanak.hi.is/rim.html', 'https://en.wikipedia.org/wiki/Icelandic_calendar'],
  },
  {
    ref: 'icelandic-solmanudur',
    title: 'First day of Sólmánuður',
    aka: ['Sólmánuður', 'Selmánuður', 'Sun month'],
    tradition: 'Old Icelandic calendar',
    summary: 'The sun month begins, on a Monday in mid-June, near midsummer, when in Iceland the sun barely sets.',
    honours: 'The sun, at its height. In this month falls Jónsmessa, Midsummer (24 June), with some of Iceland’s best-loved folk beliefs.',
    history: `Snorri’s Edda calls this month sólmánuður, “sun month”, or selmánuður, “shieling month”, when animals were taken up to summer pastures and their milk made into butter and skyr at the shieling huts (sel).

Midsummer night, Jónsmessunótt, is one of the four magic nights of the Icelandic year in folklore. Rolling naked in the dew was said to heal and protect, magic stones could be found in the hills, and cows could speak. These beliefs are recorded in the 19th-century folklore collections of Jón Árnason; many Icelanders still like to walk out on that night.`,
    knowAndDont: {
      known: 'The month’s place and old names (Snorri) and the Jónsmessa folklore (Jón Árnason, 19th century).',
      unknown: 'How old the Midsummer beliefs are, and whether any pre-Christian rite marked the month.',
    },
    celebrate: [
      'Watch the sunset and sunrise around midsummer, and stay up for the short night.',
      'Walk barefoot in the morning dew (bathing in it is optional).',
      'Make butter or skyr, or eat the dairy foods of the shieling.',
      'Spend the longest day outside.',
    ],
    ritual: {
      title: 'Dew and sun',
      outline: [
        'Go out early on a midsummer morning.',
        'Wash your face, hands and feet in the dew on the grass.',
        'Face the sun and thank it for the light.',
        'Look for a smooth stone to keep as a reminder of the night.',
      ],
    },
    correspondences: { deities: ['Sól', 'Freyr', 'Baldur'], herbs: ['St John’s Wort', 'Meadowsweet', 'Yarrow'], crystals: ['Sunstone', 'Amber'], colors: ['Gold Candle', 'Yellow Candle'], foods: ['Skyr', 'Butter', 'Milk'], symbols: ['Sun', 'Dew', 'Shieling hut'] },
    sources: ['Snorri Sturluson, Edda, Skáldskaparmál (list of the months)', 'Jón Árnason, Íslenzkar þjóðsögur og æfintýri (1862–1864)', 'Árni Björnsson, Saga daganna (Reykjavík, 1993)', 'https://en.wikipedia.org/wiki/Icelandic_calendar'],
  },
  {
    ref: 'icelandic-aukanaetur',
    title: 'Aukanætur',
    aka: ['The extra nights', 'Aukanætur of midsummer'],
    tradition: 'Old Icelandic calendar',
    summary: 'The four extra nights of midsummer, between Sólmánuður and Heyannir, that make the year 52 whole weeks.',
    honours: 'Time itself: the reckoning that let a farming people keep their year in step with the sun without writing.',
    history: `Twelve months of thirty days make 360 days. The old Icelanders added four nights (they counted in nights, not days) at midsummer to make 364, exactly fifty-two weeks, so that every month began on the same weekday every year. Íslendingabók, written by Ari the Learned around 1125, says that the first settlers counted 364 days in the year.

Aukanætur belong to no month. They come between the third and fourth months of summer, just before the hay harvest.`,
    knowAndDont: {
      known: 'The rule and its purpose, from Íslendingabók and the almanac.',
      unknown: 'Whether the days were ever marked by any custom; they appear to have been purely a matter of reckoning.',
    },
    celebrate: [
      'Take four days, or four evenings, as “time between”: don’t schedule anything you don’t have to.',
      'Learn how your own calendar works, and why it has leap days.',
      'Prepare tools and plans for the busy harvest month ahead.',
    ],
    ritual: {
      title: 'Four nights outside time',
      outline: [
        'On each of the four evenings, light a candle safely at dusk.',
        'Sit for a few minutes without a clock or screen.',
        'Note one thing you noticed that day, in a notebook kept just for these nights.',
        'On the fourth night, read the four notes together and snuff the candle.',
      ],
    },
    correspondences: { deities: ['Sól', 'Máni'], crystals: ['Clear Quartz'], colors: ['White Candle'], symbols: ['Week', 'Wheel of the year', 'Midsummer night'] },
    sources: ['Ari Þorgilsson, Íslendingabók ch. 4', 'Almanak Háskóla Íslands: https://almanak.hi.is/rim.html', 'https://en.wikipedia.org/wiki/Icelandic_calendar'],
  },
  {
    ref: 'icelandic-sumarauki',
    title: 'Sumarauki',
    aka: ['The summer increase', 'Leap week'],
    tradition: 'Old Icelandic calendar',
    summary: 'The “summer increase”: a leap week added in some years before Heyannir, so the calendar keeps pace with the sun.',
    honours: 'Þorsteinn surtr, the Icelander remembered for proposing it, and the long human effort to make our counting match the sky.',
    history: `Íslendingabók, written by Ari the Learned in the early 12th century, tells the story. The early settlers’ 364-day year was slipping: people noticed that summer was moving back into spring. A man named Þorsteinn surtr, who had dreamed he was at the Law Rock, proposed at the Althing that a week be added every seventh summer to see how it worked. The proposal was accepted, around 955 by most estimates, and Ari says it was the best of improvements.

Seven days every seven years was still not quite right, and the rule was changed over the centuries; after Iceland took the Gregorian calendar in 1700 the almanac fixed the modern rule. The last sumarauki was in 2023; the next is in 2029.`,
    knowAndDont: {
      known: 'Its origin in Þorsteinn surtr’s proposal (Íslendingabók ch. 4) and the modern almanac rule.',
      unknown: 'The exact year of the reform, and how consistently the early rule was applied.',
    },
    celebrate: [
      'Use the extra week for something you never have time for.',
      'Give thanks for the people who keep calendars, maps and records accurate.',
      'Notice where your own life has drifted out of step with its seasons, and add the time it needs.',
    ],
    ritual: {
      title: 'A week added to summer',
      outline: [
        'At the start of the week, write down one thing you will use the gift of time for.',
        'Light a candle safely and say Þorsteinn surtr’s name in thanks.',
        'Each day of the week, do a little of the thing you named.',
        'At the end, note what you did with the extra week.',
      ],
    },
    correspondences: { deities: ['Sól'], crystals: ['Sunstone', 'Clear Quartz'], colors: ['Gold Candle', 'Green Candle'], symbols: ['Seven days', 'Law Rock'] },
    sources: ['Ari Þorgilsson, Íslendingabók ch. 4', 'Þorsteinn Sæmundsson & Gunnlaugur Björnsson, “Hvað er sumarauki og á hvaða árum er hann?”, Vísindavefurinn: https://www.visindavefur.is/svar.php?id=69821', 'https://en.wikipedia.org/wiki/%C3%8Dslendingab%C3%B3k'],
  },
  {
    ref: 'icelandic-heyannir',
    title: 'First day of Heyannir',
    aka: ['Heyannir', 'Hay month'],
    tradition: 'Old Icelandic calendar',
    summary: 'Hay-making month begins, on a Sunday in late July: the busiest time of the farming year, when the winter’s fodder was cut and dried.',
    honours: 'The hay, the weather, and the workers. In a land with little grain, the hay decided whether the animals, and so the people, would survive the winter.',
    history: `Heyannir means “hay work”. The whole household and hired workers mowed the home field (tún) first, whose best hay was called taða, and then the outlying meadows, working long hours in the light summer nights. When the home-field hay was all in, a feast called töðugjöld was given to the workers, with better food than usual: a custom recorded well into the 20th century.

The month begins after the extra nights of midsummer, so it is the fourteenth week of summer, or the fifteenth in a year with sumarauki.`,
    knowAndDont: {
      known: 'The month’s name and place, and the farm customs of haymaking and töðugjöld, recorded by Icelandic ethnographers.',
      unknown: 'Whether any ritual, beyond the harvest feast, marked the start of the month.',
    },
    celebrate: [
      'Gather and dry herbs from your garden or the wild, ethically.',
      'Throw a small feast for the people who have worked hard with you this year.',
      'Pray, in whatever way you do, for good weather for those bringing in the harvest.',
    ],
    ritual: { premade: 'green-drying-hanging-herb-bundles', title: 'Drying the harvest' },
    correspondences: { deities: ['Freyr', 'Sif', 'Thor'], herbs: ['Meadowsweet', 'Yarrow', 'Thyme'], crystals: ['Citrine', 'Tiger Eye'], colors: ['Gold Candle', 'Green Candle'], foods: ['Bread and butter', 'Pancakes (pönnukökur)', 'Coffee'], symbols: ['Scythe', 'Haystack'] },
    sources: ['Árni Björnsson, Saga daganna (Reykjavík, 1993)', 'Almanak Háskóla Íslands: https://almanak.hi.is/rim.html', 'https://en.wikipedia.org/wiki/Icelandic_calendar'],
  },
  {
    ref: 'icelandic-tvimanudur',
    title: 'First day of Tvímánuður',
    aka: ['Tvímánuður', 'Kornskurðarmánuður'],
    tradition: 'Old Icelandic calendar',
    summary: 'Tvímánuður begins, on a Tuesday in late August, in the late summer harvest.',
    honours: 'The late harvest: grain where it grew, berries on the heaths, and the last of the hay.',
    history: `Snorri’s Edda calls this month kornskurðarmánuður, “grain-cutting month”, which suits medieval Iceland, where barley was grown in the south until the climate cooled. The later name Tvímánuður, “two-month”, is usually explained as the month when two months of summer remain, or as the second month of the harvest.

It is still the season for picking crowberries and bilberries on the heaths, an outing many Icelandic families keep.`,
    knowAndDont: {
      known: 'The month’s place and names; its farm work.',
      unknown: 'The exact meaning of “two-month”.',
    },
    celebrate: [
      'Go berry-picking, and make jam or a simple dessert with skyr.',
      'Harvest the last herbs before autumn, with thanks.',
      'Count the weeks of summer left and plan how to spend them.',
    ],
    ritual: { premade: 'green-harvesting-herbs-with-thanks', title: 'Harvesting with thanks' },
    correspondences: { deities: ['Freyr', 'Sif'], herbs: ['Yarrow', 'Juniper'], crystals: ['Garnet', 'Citrine'], colors: ['Orange Candle', 'Purple Candle'], foods: ['Berries', 'Skyr', 'Barley bread'], symbols: ['Sickle', 'Berry basket'] },
    sources: ['Snorri Sturluson, Edda, Skáldskaparmál (list of the months)', 'Árni Björnsson, Saga daganna (Reykjavík, 1993)', 'https://en.wikipedia.org/wiki/Icelandic_calendar'],
  },
  {
    ref: 'icelandic-haustmanudur',
    title: 'First day of Haustmánuður',
    aka: ['Haustmánuður', 'Autumn month'],
    tradition: 'Old Icelandic calendar',
    summary: 'Autumn month, the last of summer, begins on a Thursday in late September: the sheep are gathered from the highlands (göngur and réttir).',
    honours: 'The flocks and the people who bring them home; the turning of the year toward winter.',
    history: `In September Icelanders go up into the highlands on foot and horseback to gather the sheep that have grazed freely all summer (göngur), and drive them down to the sorting pens (réttir), where each farmer finds their own by the ear-mark. The réttir are still a great social event, with singing and drink, and many people come home from the towns to help.

The month leads to Winter Nights and the first day of winter, when the old sources speak of feasts and of sacrifices for a good year.`,
    knowAndDont: {
      known: 'The month’s place, the round-up customs (still kept), and the medieval sagas’ references to autumn feasts.',
      unknown: 'Exactly what pre-Christian rites, if any, were held at the start of this month rather than at Winter Nights.',
    },
    celebrate: [
      'Gather in what is yours: tidy, bring things home, call the family together.',
      'Make lamb soup (kjötsúpa) or a hearty vegetable stew to share.',
      'Hold a small blót of thanks for the summer’s end.',
    ],
    ritual: { premade: 'folk-simple-blot', title: 'A simple blót for the summer’s end' },
    correspondences: { deities: ['Freyr', 'Odin', 'Frigg'], herbs: ['Juniper', 'Birch'], crystals: ['Smoky Quartz', 'Tiger Eye'], colors: ['Brown Candle', 'Orange Candle'], foods: ['Lamb soup', 'Rye bread'], symbols: ['Sheep', 'Sorting pen', 'Shepherd’s crook'] },
    sources: ['Árni Björnsson, Saga daganna (Reykjavík, 1993)', 'Almanak Háskóla Íslands: https://almanak.hi.is/rim.html', 'https://en.wikipedia.org/wiki/Icelandic_calendar'],
  },
  {
    ref: 'icelandic-ylir',
    title: 'First day of Ýlir',
    aka: ['Ýlir', 'Frermánuður'],
    tradition: 'Old Icelandic calendar',
    summary: 'The second month of winter begins, on a Monday in late November, as the dark closes in toward Yule.',
    honours: 'The deepening winter. Ýlir’s name may be linked with Yule (jól); one of Odin’s many names in the Eddas is Jólnir, “the Yule one”.',
    history: `Snorri’s Edda calls this month frermánuður, “frost month”. The name Ýlir is of uncertain origin; it is often linked with jól, Yule, the midwinter feast, but the connection is not certain.

In Ýlir, by modern custom, the Icelandic Yule Lads (jólasveinar) begin coming down from the mountains, one each night from 12 December, leaving small gifts in children’s shoes on the windowsill. They are folklore figures, once frightening, softened into gift-bringers in the 20th century.`,
    knowAndDont: {
      known: 'The month’s place and its name in Snorri; the Yule Lads tradition, recorded since the 17th century and reshaped in the 20th.',
      unknown: 'What Ýlir means.',
    },
    celebrate: [
      'Prepare for midwinter: plan gifts, light the first candles at the window.',
      'Read the Hávamál on a dark evening.',
      'Leave a shoe on the windowsill for the Yule Lads if you have children in the house.',
    ],
    ritual: { premade: 'folk-havamal-reflection', title: 'Hávamál on a dark evening' },
    correspondences: { deities: ['Odin', 'Frigg'], herbs: ['Juniper', 'Holly'], crystals: ['Smoky Quartz', 'Jet'], colors: ['Indigo Candle', 'White Candle'], foods: ['Laufabrauð (leaf bread)', 'Hot chocolate'], symbols: ['Frost', 'Shoe on the windowsill'] },
    sources: ['Snorri Sturluson, Edda, Skáldskaparmál (list of the months)', 'Árni Björnsson, Saga daganna (Reykjavík, 1993)', 'https://en.wikipedia.org/wiki/Icelandic_calendar'],
  },
  {
    ref: 'icelandic-morsugur',
    title: 'First day of Mörsugur',
    aka: ['Mörsugur', 'Jólmánuður', 'Hrútmánuður'],
    tradition: 'Old Icelandic calendar',
    summary: 'Mörsugur, the midwinter month, begins on a Wednesday (20–27 December), around the solstice.',
    honours: 'Midwinter and the returning light; the household gathered at Yule; and, in folk belief, the elves and hidden people, who move house at New Year.',
    history: `“Mörsugur” means “fat-sucker”, from the rich, fatty foods eaten at midwinter. It was also called jólmánuður, Yule month; Snorri’s Edda calls it hrútmánuður, “ram month”, when the rams were put to the ewes.

The month holds Iceland’s whole Christmas season: Þorláksmessa on 23 December, when many still eat fermented skate; Christmas Eve at six o’clock; New Year’s Eve, one of the magic nights when elves move house and cows speak; and Þrettándinn, Twelfth Night on 6 January, with bonfires and elf dances as the Yule Lads go home. In the pre-Christian period, jól was a midwinter feast with drinking and sacrifice, as the sagas record, but its exact form is unclear.`,
    knowAndDont: {
      known: 'The month’s names and its place; the modern and folk customs of the Icelandic Christmas season.',
      unknown: 'The form of the heathen jól in Iceland; the sagas describe it in general terms and were written by Christians centuries later.',
    },
    celebrate: [
      'Leave a little food out for the house spirit or the hidden people on New Year’s Eve.',
      'Light candles through the darkest days (safely).',
      'Share a rich, warming meal with others.',
      'Clean the house before the year turns, as was done for the elves’ visit.',
    ],
    ritual: { premade: 'hedge-house-spirit-offering', title: 'An offering to the house spirit at midwinter' },
    correspondences: { deities: ['Odin', 'Frigg', 'Freyr', 'Baldur'], herbs: ['Juniper', 'Holly', 'Mistletoe'], crystals: ['Garnet', 'Sunstone'], colors: ['Red Candle', 'Gold Candle', 'White Candle'], foods: ['Smoked lamb (hangikjöt)', 'Leaf bread', 'Rice pudding'], symbols: ['Candle', 'Bonfire', 'Elves'] },
    sources: ['Snorri Sturluson, Edda, Skáldskaparmál (list of the months)', 'Jón Árnason, Íslenzkar þjóðsögur og æfintýri (1862–1864)', 'Árni Björnsson, Saga daganna (Reykjavík, 1993)'],
  },
  {
    ref: 'icelandic-konudagur',
    title: 'Konudagur',
    aka: ['First day of Góa', 'Woman’s Day', 'Wife’s Day'],
    tradition: 'Old Icelandic calendar',
    summary: 'The first day of Góa, “wife’s day”, a Sunday in late February: in folk custom the woman of the house welcomed Góa in, and today wives and partners are given flowers and treats.',
    honours: 'Góa, the late winter month, imagined as a woman; and the women of the household. The month pairs with Þorri before it, whose first day, bóndadagur, is the husband’s day.',
    history: `A medieval story (in Orkneyinga saga and the related tale “How Norway was settled”) makes Þorri a king of the far north whose daughter Gói vanished; a month after his midwinter feast, the Þorrablót, he held another sacrifice, the Góiblót, to find her. Whatever its age, the story shows that the months were already imagined as people in the Middle Ages.

Folk custom recorded in the 19th century said the housewife should rise first on the morning of Góa and welcome her into the house, as the husband welcomed Þorri a month before. The earliest references to the day as “konudagur” come from the mid-19th century. Giving flowers and treats to wives and partners is a 20th-century custom that has grown with the help of florists and bakers, and it is now kept all over Iceland.`,
    knowAndDont: {
      known: 'The story of Gói and the Góiblót (Orkneyinga saga ch. 1–2), the 19th-century folk custom of welcoming Góa, and the modern customs.',
      unknown: 'Whether the Góiblót was ever a real feast in Iceland or Norway, or only a story.',
    },
    celebrate: [
      'Give flowers, a cake or a kind word to the women in your life.',
      'Welcome the late-winter month at your door with a small greeting in the morning.',
      'Enjoy a Sunday treat: pancakes with cream, or a cream bun.',
      'Notice the lengthening light.',
    ],
    ritual: {
      title: 'Welcoming Góa',
      outline: [
        'Rise early, before the others in the house if you can.',
        'Open the front door and welcome Góa in, by name, with a few words of your own.',
        'Light a candle safely and set out a flower and a small treat.',
        'Give thanks for the women of your household and your family line.',
        'Share the treat with the household later in the day.',
      ],
    },
    correspondences: { deities: ['Frigg', 'Freyja'], herbs: ['Rose', 'Birch'], crystals: ['Rose Quartz', 'Moonstone'], colors: ['Pink Candle', 'White Candle'], foods: ['Cream cake', 'Pancakes', 'Coffee'], symbols: ['Flowers', 'Open door'] },
    sources: ['Orkneyinga saga ch. 1–2 (Fundinn Noregr)', 'Árni Björnsson, Saga daganna (Reykjavík, 1993)', 'https://en.wikipedia.org/wiki/Konudagur', 'https://islensktalmanak.is/dagar/konudagur/'],
  },
  {
    ref: 'icelandic-einmanudur',
    title: 'First day of Einmánuður',
    aka: ['Einmánuður', 'Yngismannadagur', 'Lads’ Day'],
    tradition: 'Old Icelandic calendar',
    summary: 'The last month of winter begins, on a Tuesday in late March; traditionally the young men’s day (yngismannadagur).',
    honours: 'The last of winter and the waiting for summer; the young men of the household, as Harpa’s first day was the young women’s.',
    history: `Einmánuður, “one month” or “single month”, is the last month of winter, probably named because one month remained before summer. Folk custom, as described by Árni Björnsson from older records, made its first day yngismannadagur, the young men’s day, when the young women of the household were to look after them, returning the favour the young men had shown on the first day of summer, yngismeyjadagur, the maidens’ day.

Like bóndadagur and konudagur, these were half-joking customs of the farm household, and they never became public holidays.`,
    knowAndDont: {
      known: 'The month’s place and name; the folk custom of the young men’s day, reported in Icelandic ethnography.',
      unknown: 'How widely or how long the young men’s day was kept.',
    },
    celebrate: [
      'Do something kind for the young people in your life.',
      'Start clearing for spring: look over seeds, tools and plans.',
      'Count down the weeks to the first day of summer.',
    ],
    ritual: {
      title: 'One month to summer',
      outline: [
        'Light a candle safely at the window.',
        'Write a list of what you will do when summer comes.',
        'Do one small thing today to get ready for it.',
        'Give a small gift or a treat to a young person in your household.',
      ],
    },
    correspondences: { deities: ['Freyr', 'Baldur'], herbs: ['Birch', 'Willow'], crystals: ['Green Aventurine', 'Clear Quartz'], colors: ['Green Candle', 'Yellow Candle'], foods: ['Pancakes', 'Hot soup'], symbols: ['Thaw', 'Lengthening light'] },
    sources: ['Árni Björnsson, Saga daganna (Reykjavík, 1993)', 'Árni Björnsson, High Days and Holidays in Iceland (Reykjavík, 1995)', 'Almanak Háskóla Íslands: https://almanak.hi.is/rim.html'],
  },
];
