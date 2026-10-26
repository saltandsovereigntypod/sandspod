// Each Living Library deity's sacred days and simple daily devotions, for
// the patron page, Today and reminders. `basis` is honest: 'ancient' only
// where an ancient source ties the day to this deity; 'later' for medieval
// texts, folk custom and living religious practice; 'modern' for modern
// Pagan and polytheist custom (weekday names, esbats, most Celtic and Slavic
// days). Fixed dates use months 1–12. Pure data.

import type { DeityDevotion } from './types';

// ─── Shared sources ──────────────────────────────────────────────────────

const ATTIC_MONTHLY =
  'Jon D. Mikalson, The Sacred and Civil Calendar of the Athenian Year (Princeton, 1975), pp. 13–24, on the monthly days (3 Athena; 4 Herakles, Hermes, Aphrodite, Eros; 6 Artemis; 7 Apollo; 8 Poseidon and Theseus)';
const HESIOD_WD =
  'Hesiod, Works and Days 770–771, on the first, fourth and seventh days as holy, the seventh being Apollo’s birthday: https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0132:card=765';
const PARKE =
  'H. W. Parke, Festivals of the Athenians (London, 1977)';
const DEUBNER = 'Ludwig Deubner, Attische Feste (Berlin, 1932)';
const OVID_FASTI =
  'Ovid, Fasti, trans. J. G. Frazer (Loeb), on LacusCurtius: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Ovid/Fasti/home.html';
const ROMAN_FESTIVALS =
  'H. H. Scullard, Festivals and Ceremonies of the Roman Republic (London, 1981)';
const MACROBIUS_KAL_IDES =
  'Macrobius, Saturnalia 1.15.14–19, on the Ides as sacred to Jupiter and the Kalends to Juno: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Macrobius/Saturnalia/1*.html';
const WEEKDAYS =
  'On the planetary week and the weekday names (Latin dies Solis, Lunae, Martis, Mercurii, Iovis, Veneris, Saturni; Old English Tīwesdæg, Wōdnesdæg, Þunresdæg, Frīgedæg): Eviatar Zerubavel, The Seven Day Circle (1985); Oxford English Dictionary, s.v. Tuesday, Wednesday, Thursday, Friday';
const HUTTON_TRIUMPH =
  'Ronald Hutton, The Triumph of the Moon (1999; 2nd edn 2019), on the modern esbat and the Wheel of the Year';
const HUTTON_STATIONS = 'Ronald Hutton, The Stations of the Sun (Oxford, 1996)';
const HAKONAR =
  'Snorri Sturluson, Hákonar saga góða ch. 14 (Heimskringla), on the Yule toasts to Odin, then Njörðr and Freyr “for a good year and peace”, trans. Lee M. Hollander (1964)';
const YNGLINGA_8 =
  'Snorri Sturluson, Ynglinga saga ch. 8 (Heimskringla): sacrifices at winter’s start for a good year, at midwinter for growth, and at summer for victory';
const ICELANDIC_CAL =
  'Árni Björnsson, Saga daganna (Reykjavík, 1993), on the old Icelandic calendar and its feasts';
const WEP_RONPET =
  'Anthony Spalinger, “Calendars”, in The Oxford Encyclopedia of Ancient Egypt (2001); Wep Ronpet followed the heliacal rising of Sirius (Sopdet), which falls in late July to early August in Egypt today, and modern Kemetic groups set their own dates';
const WAG =
  'The Wag festival (18 Thoth) and Thoth festival (19 Thoth) in Old Kingdom offering formulas naming Anubis and Osiris; Thesaurus Linguae Aegyptiae: https://thesaurus-linguae-aegyptiae.de/sentence/ICQAgA42qQWjp08fp1QRM2HNLz8';
const PHILOCALUS =
  'The Calendar of 354 (Chronography of Filocalus): Isidis navigium on 5 March, the Isia from 28 October and the Hilaria on 3 November; see M. R. Salzman, On Roman Time (1990)';
const DLUGOSZ_MARZANNA =
  'Jan Długosz, Annales seu cronicae incliti regni Poloniae (15th c.), on Marzanna; and the Slavic festivals in this app’s calendar';
const RYAN = 'W. F. Ryan, The Bathhouse at Midnight: Magic in Russia (1999)';
const IVANITS = 'Linda J. Ivanits, Russian Folk Belief (1989), on Ilya, Paraskeva Pyatnitsa and St Vlasii';
const CMT =
  'Cath Maige Tuired §84, ed. and trans. Elizabeth A. Gray (1982), on the Dagda’s meeting with the Morrígan at Samain: https://celt.ucc.ie/published/T300010/';
const MACNEILL = 'Máire MacNeill, The Festival of Lughnasa (1962)';
const HINDU_LIVING =
  'These days belong to a living religion; customs vary by region and family. Gavin Flood, An Introduction to Hinduism (1996); Diana L. Eck, Darśan (1998)';

const ERCHIA =
  'The sacrificial calendar of the deme of Erchia (SEG 21.541), on sacrifices to Hera and Zeus Teleios for the sacred marriage on 27 Gamelion; see Mikalson, The Sacred and Civil Calendar of the Athenian Year';
const EPAGOMENAL_BIRTHS =
  'The five days upon the year and the gods born on them: Pyramid Texts; Papyrus Leiden I 346; Plutarch, On Isis and Osiris 12. Dates here count back from an early-August new year; the app’s Kemetic calendar works them out from the anchor you choose';

export const DEITY_DEVOTIONS: DeityDevotion[] = [
  // ─── Greek ────────────────────────────────────────────────────────────
  {
    key: 'aphrodite',
    sacred: [
      {
        rule: { kind: 'attic', day: 4 },
        name: 'The fourth of the month',
        why: 'In Athens the fourth day of each lunar month belonged to Aphrodite, with Hermes, Herakles and Eros.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'weekday', day: 5 },
        name: 'Friday',
        why: 'Friday was dies Veneris in Latin, the day of the planet Venus, and so is Aphrodite’s by the planetary week. Honouring her on Fridays is a modern custom, not an ancient Greek one.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer a flower or a little rose water with a word of thanks for something beautiful today.',
      'Take a few minutes to care for your body kindly, and dedicate it to her.',
      'Pour a drop of honey or sweet wine and name one bond you are grateful for.',
      'Say a line of the Homeric Hymn to Aphrodite (Hymn 6) over a lit candle.',
    ],
    approach:
      'Aphrodite is approached with beauty, pleasure and gratitude, and with respect for her power over all bonds, not only romance.',
    sources: [ATTIC_MONTHLY, HESIOD_WD, WEEKDAYS],
  },
  {
    key: 'apollo',
    sacred: [
      {
        rule: { kind: 'attic', day: 7 },
        name: 'The seventh, Apollo’s birthday',
        why: 'Hesiod calls the seventh holy, “for on it Leto bore golden-sworded Apollo”, and Athenians honoured him on the seventh of every month.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'thargelia' },
        name: 'Thargelia',
        why: 'Athens’ festival of Apollo on his birthday in Thargelion, with first fruits and the purification of the city.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'pyanepsia' },
        name: 'Pyanepsia',
        why: 'Apollo’s autumn festival in Athens, with a pot of beans and the eiresione branch.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Greet the sunrise or the first daylight with a few words of praise.',
      'Play, sing or listen to one piece of music with your full attention, for him.',
      'Burn or lay down a bay leaf and ask for clear sight and honest words.',
      'Read a short poem aloud, or write four lines of your own.',
      'Do one thing today for your own health, and offer it to Apollo the healer.',
    ],
    approach:
      'Apollo is approached with music, purity and honesty, as a god of healing, prophecy and truth as much as of the sun.',
    sources: [HESIOD_WD, ATTIC_MONTHLY, PARKE, DEUBNER],
  },
  {
    key: 'artemis',
    sacred: [
      {
        rule: { kind: 'attic', day: 6 },
        name: 'The sixth, Artemis’s birthday',
        why: 'Athenians kept the sixth of each month for Artemis, born the day before her twin Apollo.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'mounichia' },
        name: 'Mounichia',
        why: 'Her festival as Artemis Mounichia, with round cakes ringed by small torches.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'thargelia' },
        name: 'Thargelia',
        why: 'The Thargelia began on the sixth of Thargelion, her birthday, before Apollo’s on the seventh.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'moon', phase: 'full' },
        name: 'The full moon',
        why: 'Many modern witches honour Artemis at the full moon. Her link with the moon grew in later antiquity; the monthly esbat is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Pour clean water outside, on earth or a plant, for the goddess of wild places.',
      'Spend five minutes outdoors noticing one wild thing, and thank her for it.',
      'Do one small thing for wildlife: fill a bird bath, pick up litter, leave a corner wild.',
      'Speak a line of the Homeric Hymn to Artemis (Hymn 27) at dusk.',
    ],
    approach:
      'Artemis is approached as a fierce protector of the wild, the young and women in childbirth, with care for wild places rather than only lunar imagery.',
    sources: [ATTIC_MONTHLY, PARKE, DEUBNER, HUTTON_TRIUMPH],
  },
  {
    key: 'hekate',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'hellenic_monthly', id: 'deipnon' },
        name: 'The Deipnon at the dark moon',
        why: 'Athenians left a supper for Hekate at the crossroads on the last day of the lunar month, after cleaning the house.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'samhain' },
        name: 'Samhain',
        why: 'Many modern witches honour Hekate at Samhain as a goddess of the dead and of thresholds. This is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Light a small lamp or candle at your front door for a few minutes after dark.',
      'Sweep or tidy your threshold and ask her to guard what crosses it.',
      'Hold a key you use every day and name one threshold you are standing at.',
      'Pour a little water or wine outside, and walk away without looking back.',
    ],
    approach:
      'Hekate is approached at thresholds and the month’s dark end with care and honesty, keeping the old rule that what is given to her is left and never eaten.',
    sources: [
      'Aristophanes, Wealth 594–597, and the scholia, on the suppers of Hekate',
      'Plutarch, Moralia 709a (Table Talk 7.6), on Hekate’s suppers at the crossroads',
      'Sarah Iles Johnston, Restless Dead (1999)',
      HUTTON_TRIUMPH,
    ],
  },
  {
    key: 'hermes',
    sacred: [
      {
        rule: { kind: 'attic', day: 4 },
        name: 'The fourth, Hermes’s birthday',
        why: 'The Homeric Hymn to Hermes says he was born on the fourth day of the month, and Athenians honoured him on the fourth.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'anthesteria' },
        name: 'Anthesteria (the Chytroi)',
        why: 'On the last day of the Anthesteria, pots of grain were offered to Hermes Chthonios, guide of the dead.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'weekday', day: 3 },
        name: 'Wednesday',
        why: 'Wednesday was dies Mercurii, the day of Mercury, Hermes’s Roman counterpart. Honouring Hermes on Wednesdays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Set a coin on his shrine or by the door before you travel, and ask for a safe road.',
      'Pour a drop of olive oil or wine and thank him for a message, sale or lucky break.',
      'Write one honest message you have been putting off, and send it.',
      'Leave a small stone on a path or cairn as a herm-heap, as travellers once did.',
    ],
    approach:
      'Hermes is approached with wit, small gifts and honest dealing, honouring him as guide of travellers and of souls as well as of luck and trade.',
    sources: [
      'Homeric Hymn to Hermes (4) 19, “born on the fourth day of the month”, trans. H. G. Evelyn-White: https://www.gutenberg.org/ebooks/348',
      ATTIC_MONTHLY,
      'Theopompus, FGrH 115 F 347, on the Chytroi offering to Hermes Chthonios; Parke, Festivals of the Athenians (1977)',
      WEEKDAYS,
    ],
  },
  {
    key: 'persephone',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'eleusinia' },
        name: 'The Eleusinian Mysteries',
        why: 'The Greater Mysteries at Eleusis honoured Demeter and her daughter. The inner rites were secret and are unknown.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'thesmophoria' },
        name: 'Thesmophoria',
        why: 'The women’s festival of Demeter Thesmophoros and Kore (Persephone), in autumn.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'ostara' },
        name: 'The spring equinox',
        why: 'Many modern Pagans mark Persephone’s return from the underworld at the spring equinox. This is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer a few pomegranate seeds, or a little juice, and remember someone who has died.',
      'Tend a plant or a pot of seeds as a small promise of return.',
      'Pour spring water onto earth and name one ending that made room for something new.',
      'Read a few lines of the Homeric Hymn to Demeter about her return.',
    ],
    approach:
      'Persephone is approached as both queen of the dead and bringer of spring, with respect for the secrecy of her ancient Mysteries.',
    sources: [
      'Homeric Hymn to Demeter (2), trans. H. G. Evelyn-White: https://www.gutenberg.org/ebooks/348',
      PARKE,
      'Walter Burkert, Ancient Mystery Cults (1987)',
      HUTTON_TRIUMPH,
    ],
  },
  {
    key: 'demeter',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'thesmophoria' },
        name: 'Thesmophoria',
        why: 'The great women’s festival of Demeter Thesmophoros, kept across the Greek world.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'eleusinia' },
        name: 'The Eleusinian Mysteries',
        why: 'Her Mysteries at Eleusis, the most revered initiation of the ancient world.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'haloa' },
        name: 'Haloa',
        why: 'A winter festival of Demeter at the threshing floor, kept by women.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'skira' },
        name: 'Skira',
        why: 'A midsummer women’s festival of Demeter and Kore ahead of the threshing.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Set aside the first piece of bread at a meal for her, and thank her for food.',
      'Offer a pinch of grain, oats or flour on her shrine or outside.',
      'Cook or bake something simple and share it.',
      'Give to a food bank, or cook for someone who needs it, in her name.',
    ],
    approach:
      'Demeter is approached with bread, grain and gratitude for food, honouring both the grieving mother and the giver of the harvest.',
    sources: [PARKE, DEUBNER, 'Homeric Hymn to Demeter (2), trans. H. G. Evelyn-White: https://www.gutenberg.org/ebooks/348'],
  },
  {
    key: 'dionysus',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'lenaia' },
        name: 'Lenaia',
        why: 'The winter festival of Dionysus Lenaios in Athens, with comedy and tragedy.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'anthesteria' },
        name: 'Anthesteria',
        why: 'The festival of flowers and the new wine, when the jars were opened.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'dionysia' },
        name: 'City Dionysia',
        why: 'His great spring festival in Athens, where the tragedies were first performed.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Pour a little wine or grape juice for him before you drink.',
      'Dance to one song, alone and without caring how it looks.',
      'Watch, read or act out a scene from a play.',
      'Offer a fig or a bunch of grapes and let go of one thing you have been holding too tightly.',
    ],
    approach:
      'Dionysus is approached with wine or juice, theatre, music and release, and with care: his ecstasy never asks anyone to harm themselves or drink beyond their limits.',
    sources: [PARKE, DEUBNER, 'Walter Burkert, Greek Religion (1985), pp. 161–167'],
  },
  {
    key: 'hestia',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'hellenic_monthly', id: 'noumenia' },
        name: 'Noumenia, the new month',
        why: 'On the first day of the month Greek households made offerings to their household gods. Hestia had few festivals of her own; instead she was honoured first and last in every rite.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Light a candle or the stove with a word to Hestia before you cook.',
      'Give her the first and last of what you offer to any god.',
      'Tidy one small part of your home as an offering.',
      'Welcome a guest, or yourself, with a warm drink and full attention.',
    ],
    approach:
      'Hestia is approached through the everyday life of the home, with the first and last portion of every offering, rather than through myth.',
    sources: [
      'Homeric Hymn to Hestia (29), “without you mortals hold no banquet”, trans. H. G. Evelyn-White: https://www.gutenberg.org/ebooks/348',
      ATTIC_MONTHLY,
      'Jon D. Mikalson, Ancient Greek Religion (2nd edn, 2010)',
    ],
  },
  {
    key: 'hades',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'dark' },
        name: 'The dark moon',
        why: 'Hades had almost no festivals in the Greek world; Pausanias mentions a temple at Elis opened once a year. Honouring him at the dark moon is a modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'samhain' },
        name: 'Samhain',
        why: 'Many modern Pagans honour Hades with the dead at Samhain. This is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Pour a little water or dark wine onto earth, not into a bowl, as offerings to the underworld were.',
      'Remember one of your dead by name and say something true about them.',
      'Offer a coin, as the dead once carried one for the ferryman, and keep it on his shrine.',
      'Sit in silence in the dark for a few minutes and accept one thing that has ended.',
    ],
    approach:
      'Hades is approached quietly and with respect, with libations poured into the earth and kept apart from offerings to the Olympians.',
    sources: [
      'Pausanias, Description of Greece 6.25.2, on the temple of Hades at Elis: https://www.theoi.com/Text/Pausanias6B.html',
      'Walter Burkert, Greek Religion (1985), on chthonic sacrifice',
      HUTTON_TRIUMPH,
    ],
  },
  {
    key: 'athena',
    sacred: [
      {
        rule: { kind: 'attic', day: 3 },
        name: 'The third, Athena’s birthday',
        why: 'Athenians honoured Athena on the third of every month, the day of her birth.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'panathenaia' },
        name: 'Panathenaia',
        why: 'Athena’s great birthday festival, when her statue was given a new woven robe.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'plynteria' },
        name: 'Plynteria',
        why: 'The day her ancient statue was washed and her robes cleaned.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Offer a drop of olive oil and ask for clear thinking in one decision.',
      'Spend ten minutes learning something properly, for her.',
      'Make, mend or weave something with your hands, however small.',
      'Speak a line of the Homeric Hymn to Athena (Hymn 11 or 28) before work.',
    ],
    approach:
      'Athena is approached through study, craft and good counsel, as a goddess with real worshippers rather than only a symbol of cleverness.',
    sources: [ATTIC_MONTHLY, PARKE, DEUBNER],
  },
  {
    key: 'selene',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'full' },
        name: 'The full moon',
        why: 'Selene was the moon itself, but little regular cult to her is recorded. Honouring her at the full moon is a modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'weekday', day: 1 },
        name: 'Monday',
        why: 'Monday is the moon’s day (Latin dies Lunae). Honouring Selene on Mondays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Look for the moon tonight and greet her, whatever her phase.',
      'Leave a small glass of water or milk on a windowsill overnight.',
      'Say a line of the Homeric Hymn to Selene (Hymn 32) before sleep.',
      'Note the moon’s phase in your journal with one line about your day.',
    ],
    approach:
      'Selene is approached simply and quietly, as the moon herself, rather than as a stand-in for every lunar goddess.',
    sources: ['Homeric Hymn to Selene (32), trans. H. G. Evelyn-White: https://www.gutenberg.org/ebooks/348', WEEKDAYS, HUTTON_TRIUMPH],
  },
  {
    key: 'nyx',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'dark' },
        name: 'The dark moon',
        why: 'Nyx had little known cult in antiquity. Honouring her on the darkest night of the month is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Sit for a few minutes in the dark before bed and simply rest.',
      'Light incense in silence after nightfall and let the day go.',
      'Read the Orphic Hymn to Night (Hymn 3) by a single candle.',
      'Turn off screens a little earlier tonight, as an offering of rest.',
    ],
    approach:
      'Nyx is approached in silence and darkness as the primordial Night, and devotion to her is largely modern and personal.',
    sources: [
      'Orphic Hymn 3, To Night, trans. Thomas Taylor (1792)',
      'Pausanias, Description of Greece 1.40.6, on an oracle of Nyx at Megara',
      HUTTON_TRIUMPH,
    ],
  },

  {
    key: 'zeus',
    sacred: [
      {
        rule: { kind: 'attic', month: 'Anthesterion', day: 23 },
        name: 'Diasia',
        why: 'The great festival of Zeus Meilichios, the Gentle, outside Athens, with whole families offering cakes shaped like animals as well as sacrifices.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'attic', month: 'Skirophorion', day: 14 },
        name: 'Dipolieia',
        why: 'The Athenian festival of Zeus Polieus, guardian of the city, with the old ox-slaying rite of the Bouphonia.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'attic', month: 'Gamelion', day: 27 },
        name: 'Theogamia, the sacred marriage',
        why: 'The wedding of Zeus and Hera, kept in the month of marriages with sacrifices to Hera and Zeus Teleios.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Pour a little wine or water as a libation and greet Zeus before anything else.',
      'Welcome a guest or a stranger well, in honour of Zeus Xenios.',
      'Keep one promise today and offer it to Zeus Horkios, keeper of oaths.',
      'Add a little food to a jar for Zeus Ktesios, guardian of the household’s goods.',
    ],
    approach:
      'Zeus is approached with dignity and good faith, through the title that fits the need, as a just king and protector of guests, oaths and households.',
    sources: [
      'Thucydides 1.126.6, on the Diasia as the greatest festival of Zeus Meilichios; scholia on Aristophanes, Clouds 408, for its date',
      PARKE + ', on the Diasia and the Dipolieia',
      ERCHIA,
    ],
  },
  {
    key: 'hera',
    sacred: [
      {
        rule: { kind: 'attic', month: 'Gamelion', day: 27 },
        name: 'Theogamia, the sacred marriage',
        why: 'The wedding of Hera and Zeus, kept in Gamelion, the month of weddings, with sacrifices to Hera and Zeus Teleios.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Light a candle and name one commitment you mean to keep.',
      'Offer a flower or a little honey with thanks for a partnership or a family bond.',
      'Do one thing to support a woman or a mother you know.',
      'Stand tall in one small way today, as a queen would.',
    ],
    approach:
      'Hera is approached as a queen and protector of women and marriage, honoured in her cults rather than through the jealous wife of myth.',
    sources: [ERCHIA, 'Pausanias 5.16 on the Heraia at Olympia; 8.22.2 on Hera as Pais, Teleia and Chera at Stymphalos', DEUBNER],
  },
  {
    key: 'poseidon',
    sacred: [
      {
        rule: { kind: 'attic', day: 8 },
        name: 'The eighth of the month',
        why: 'In Athens the eighth day of each lunar month belonged to Poseidon and Theseus.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Pour a little fresh water and ask for safe travel for someone on the move.',
      'Pick up litter from a beach, riverbank or gutter that drains to the sea.',
      'Stand still for a minute and feel the ground under you, steady.',
      'Look at water, the sea, a river or a glass, and thank him for it.',
    ],
    approach:
      'Poseidon is approached with respect for the power of the sea and the shaking earth, and with care for the waters he rules.',
    sources: [ATTIC_MONTHLY, 'Plutarch, Life of Theseus 36, on the eighth day', PARKE],
  },

  {
    key: 'ares',
    sacred: [
      {
        rule: { kind: 'weekday', day: 2 },
        name: 'Tuesday',
        why: 'Tuesday was dies Martis in Latin, the day of the planet Mars, whom the Romans equated with Ares. Honouring Ares on Tuesdays is a modern custom; no Athenian festival of his is known.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Do something physically hard and offer the effort to him.',
      'Pour a little wine or water outside and ask for courage for one thing you fear.',
      'Name one anger you are carrying and decide what to do with it.',
      'Stand up for someone who cannot stand up for themselves.',
    ],
    approach:
      'Ares is approached with respect and self-control, for courage and protection, honest that the Greeks themselves honoured him warily.',
    sources: [WEEKDAYS, 'Pausanias 3.14.9, on Spartan sacrifices to Enyalios', 'Homer, Iliad 5.855–906'],
  },
  {
    key: 'hephaestus',
    sacred: [
      {
        rule: { kind: 'attic', month: 'Pyanepsion', day: 'last' },
        name: 'Chalkeia',
        why: 'The Athenian festival of smiths and craftsmen on the last day of Pyanepsion, kept for Hephaestus and Athena Ergane, Athena of the workers.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Make or mend one small thing with your hands.',
      'Clean and care for a tool you use often.',
      'Light a candle at your workbench or desk before you begin.',
      'Thank someone whose craft you rely on.',
    ],
    approach:
      'Hephaestus is approached through honest work and craft, as the patient maker of the gods.',
    sources: [PARKE + ', on the Chalkeia', 'Harpocration and the Suda, s.v. Chalkeia', DEUBNER],
  },
  {
    key: 'pan',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'beltane' },
        name: 'Beltane',
        why: 'Many modern Pagans honour Pan at Beltane, in the green of spring. This is a modern custom: Herodotus says the Athenians gave Pan yearly sacrifices and a torch race after Marathon, but the day is not known.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Spend a few minutes outside somewhere green and listen.',
      'Play or hum a tune for him.',
      'Pour a little milk or honey onto the ground in a garden or park.',
      'Do something kind for an animal.',
    ],
    approach:
      'Pan is approached with playfulness and respect for the wild, in green places rather than indoors where possible.',
    sources: ['Herodotus 6.105, on Pheidippides and the Athenian cult of Pan', HUTTON_TRIUMPH],
  },
  {
    key: 'gaia',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'ostara' },
        name: 'The spring equinox',
        why: 'Modern Pagans often honour the Earth Mother as the land greens in spring. This is a modern custom; no Athenian festival day of Ge alone is securely known, though she received offerings as Ge Kourotrophos before many others.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Put your hands on the ground and thank her for one thing that grew.',
      'Pour a little water onto soil or a plant with a word of thanks.',
      'Pick up litter from one patch of ground.',
      'Plant a seed or care for a houseplant in her name.',
    ],
    approach:
      'Gaia is approached with gratitude and humility, as the Earth herself, and honoured by caring for the land.',
    sources: ['Hesiod, Theogony 116–187', 'Homeric Hymn 30, To Earth the Mother of All', HUTTON_TRIUMPH],
  },
  {
    key: 'helios',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'hellenic', id: 'pyanepsia' },
        name: 'Pyanepsia',
        why: 'Apollo’s autumn harvest festival, when the eiresione, an olive branch hung with wool and fruit, was carried in procession; a scholiast says it and the Thargelia also honoured Helios and the Horai, the Seasons.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'weekday', day: 0 },
        name: 'Sunday',
        why: 'Sunday is the day of the Sun in the planetary week (Latin dies Solis). Honouring Helios on Sundays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Greet the first daylight you see with a few words.',
      'Burn a pinch of frankincense at sunrise or noon.',
      'Keep one promise today, with him as your witness.',
      'Spend a few minutes in daylight and notice its warmth.',
    ],
    approach:
      'Helios is approached openly and honestly, as the all-seeing Sun who witnesses oaths.',
    sources: ['Scholia on Aristophanes, Knights 729 and Wealth 1054, on Helios and the Horai at the Pyanepsia and Thargelia', 'Homer, Iliad 3.277; Homeric Hymn to Demeter 62–89', WEEKDAYS],
  },
  {
    key: 'eros',
    sacred: [
      {
        rule: { kind: 'attic', day: 4 },
        name: 'The fourth of the month',
        why: 'In Athens the fourth day of each lunar month belonged to Eros, with Aphrodite, Hermes and Herakles.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Offer a rose or a drop of honey and name something you love.',
      'Tell someone plainly that you love or value them.',
      'Read or write a few lines of love poetry.',
      'Do one thing for the sake of a creative longing.',
    ],
    approach:
      'Eros is approached with openness and with respect for other people’s freedom, as the power that draws beings together.',
    sources: [ATTIC_MONTHLY, 'Pausanias 9.27, on Eros at Thespiae', 'Hesiod, Theogony 120–122'],
  },
  {
    key: 'asclepius',
    sacred: [
      {
        rule: { kind: 'attic', month: 'Elaphebolion', day: 8 },
        name: 'Asklepieia',
        why: 'The Athenian festival of Asclepius on 8 Elaphebolion, the first day of the City Dionysia.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'attic', month: 'Boedromion', day: 18 },
        name: 'Epidauria',
        why: 'The day during the Eleusinian Mysteries (the 17th or 18th; sources differ) that remembered Asclepius’ arrival at Athens; later tradition said he came late to be initiated.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Light a candle for someone who is unwell.',
      'Do one thing for your own health today.',
      'Thank a doctor, nurse or carer.',
      'Write down a dream and what it might be telling you about your wellbeing.',
    ],
    approach:
      'Asclepius is approached with trust and thanks, alongside good medical care, never instead of it.',
    sources: [PARKE + ', on the Asklepieia and the Epidauria', 'Philostratus, Life of Apollonius 4.18, on the Epidauria', 'Inscriptiones Graecae IV² 1, 121–124, the healing records of Epidaurus'],
  },

  // ─── Roman ────────────────────────────────────────────────────────────
  {
    key: 'jupiter',
    sacred: [
      {
        rule: { kind: 'fixed', month: 9, day: 13 },
        name: 'Epulum Iovis, the Ides of September',
        why: 'The anniversary of his Capitoline temple and the feast of Jupiter during the Roman Games. Every month’s Ides were also sacred to him.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 4, day: 23 },
        name: 'Vinalia',
        why: 'The first wine of the year was offered to Jupiter at the April Vinalia.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'weekday', day: 4 },
        name: 'Thursday',
        why: 'Thursday was dies Iovis, Jupiter’s day (jeudi, giovedì). Honouring him on Thursdays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Pour a little wine or water and ask him to witness a promise you mean to keep.',
      'Keep one promise today, however small, and offer it to him.',
      'Look up at the sky for a minute and greet Jupiter Optimus Maximus.',
      'Offer a pinch of incense with the simple prayer “Iuppiter, accept this”.',
    ],
    approach:
      'Jupiter is approached with Roman formality and good faith (fides), as guardian of oaths and justice rather than as Zeus with a Latin name.',
    sources: [MACROBIUS_KAL_IDES, OVID_FASTI + ' (4.863–900 on the Vinalia)', ROMAN_FESTIVALS, WEEKDAYS],
  },
  {
    key: 'juno',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'roman', id: 'matronalia' },
        name: 'Matronalia',
        why: 'The festival of Juno Lucina on the Kalends of March. The Kalends of every month were also sacred to her.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 7, day: 7 },
        name: 'Nonae Caprotinae',
        why: 'A festival of Juno Caprotina kept by Roman women, especially slave women, under a wild fig tree.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Light a candle on the first of the month and greet Juno for the month ahead.',
      'Do one act of care or support for a woman in your life.',
      'Offer a few flowers and ask her protection for someone giving birth or recovering.',
      'Pour a little milk with honey and say her title that fits your day: Lucina, Regina, Moneta, Sospita.',
    ],
    approach:
      'Juno is approached through her many Roman titles as protector of women, birth and the state, not through the jealous wife of Greek myth.',
    sources: [MACROBIUS_KAL_IDES, OVID_FASTI + ' (3.167–258 on the Matronalia)', 'Macrobius, Saturnalia 1.11.35–40, on the Nonae Caprotinae', ROMAN_FESTIVALS],
  },
  {
    key: 'minerva',
    sacred: [
      {
        rule: { kind: 'fixed', month: 3, day: 19 },
        name: 'Quinquatrus',
        why: 'Minerva’s festival from 19 March, kept by craftworkers, teachers and students.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 6, day: 13 },
        name: 'Lesser Quinquatrus',
        why: 'The flute-players’ festival of Minerva in June.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Offer a drop of olive oil before study or skilled work.',
      'Practise one skill for ten minutes with full care, for her.',
      'Tidy your tools, desk or workspace as an offering.',
      'Ask her help with one problem and write down the next sensible step.',
    ],
    approach:
      'Minerva is approached through skill, learning and careful work, honoured on Roman terms rather than as Athena under another name.',
    sources: [OVID_FASTI + ' (3.809–848; 6.649–710)', ROMAN_FESTIVALS],
  },
  {
    key: 'vesta',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'roman', id: 'vestalia' },
        name: 'Vestalia',
        why: 'Vesta’s festival in June, when her temple was opened to the women of Rome.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 3, day: 1 },
        name: 'The renewal of the fire',
        why: 'On the Kalends of March, the old new year, Vesta’s sacred fire was relit.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Light a candle or lamp at your hearth or stove and say her name.',
      'Set aside a pinch of the first food of a meal for her, and the last.',
      'Offer a pinch of salt and flour, the Romans’ mola salsa, on her shrine.',
      'Keep one corner of your home clean and calm as her place.',
    ],
    approach:
      'Vesta is approached through the hearth and the daily care of the home, with a tended flame and the first and last portion.',
    sources: [OVID_FASTI + ' (3.135–144; 6.249–468)', 'Macrobius, Saturnalia 1.12.6, on relighting the fire on 1 March', ROMAN_FESTIVALS],
  },
  {
    key: 'diana',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 13 },
        name: 'The Ides of August (Nemoralia)',
        why: 'The birthday of Diana’s temple on the Aventine, and her torchlit festival at Lake Nemi near Aricia.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'moon', phase: 'full' },
        name: 'The full moon',
        why: 'Many modern witches honour Diana at the full moon, and some keep the Nemoralia at August’s full moon. These are modern customs.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Light a small torch or candle at dusk and greet Diana.',
      'Pour clean water onto earth for the goddess of groves and springs.',
      'Do one thing to protect a wild place, an animal, or someone vulnerable.',
      'Walk among trees for a few minutes, in her honour.',
    ],
    approach:
      'Diana is approached in wild places and by torchlight as protector of women and the vulnerable, with honesty about which customs are ancient and which modern.',
    sources: ['Statius, Silvae 3.1.52–60, on the torches at Nemi on the Ides of August', ROMAN_FESTIVALS, HUTTON_TRIUMPH],
  },
  {
    key: 'janus',
    sacred: [
      {
        rule: { kind: 'fixed', month: 1, day: 1 },
        name: 'The Kalends of January',
        why: 'The year began under Janus with sweet gifts and good words for the year ahead.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 1, day: 9 },
        name: 'Agonalia',
        why: 'The rex sacrorum sacrificed a ram to Janus on 9 January.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Pause at your front door before going out and greet Janus.',
      'Name him first, before any other god, whenever you pray.',
      'Offer a little honey or a sweet thing at the start of something new.',
      'Before sleep, look back at today and forward to tomorrow.',
    ],
    approach:
      'Janus is approached at doorways and beginnings, and named first in prayer, as a Roman god with no real Greek counterpart.',
    sources: [OVID_FASTI + ' (1.63–294; 1.317–336)', ROMAN_FESTIVALS],
  },
  {
    key: 'mars',
    sacred: [
      {
        rule: { kind: 'fixed', month: 3, day: 1 },
        name: 'The Kalends of March',
        why: 'The first day of Mars’s own month, when the Salii, his leaping priests, began their dances.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 10, day: 15 },
        name: 'The October Horse',
        why: 'A horse race and sacrifice to Mars on the Campus Martius at the end of the campaigning season.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 10, day: 19 },
        name: 'Armilustrium',
        why: 'The purification of weapons as the campaigning season closed.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Pour a little wine or water and ask him to guard your home and boundaries.',
      'Do some disciplined physical effort and offer it to him.',
      'Walk your boundary, the edge of your home or garden, and ask for protection.',
      'Remember those who have suffered in war, and pray for peace.',
    ],
    approach:
      'Mars is approached as guardian of the community, its fields and boundaries, with discipline and with honesty about the real cost of conflict.',
    sources: [OVID_FASTI + ' (3.1–398)', 'Festus, s.v. October equus; Varro, De Lingua Latina 6.22, on the Armilustrium', ROMAN_FESTIVALS],
  },
  {
    key: 'venus',
    sacred: [
      {
        rule: { kind: 'fixed', month: 4, day: 1 },
        name: 'Veneralia',
        why: 'The festival of Venus Verticordia on the Kalends of April, when women washed her statue and adorned it with flowers.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 4, day: 23 },
        name: 'Vinalia',
        why: 'Ovid links the April Vinalia with Venus as well as Jupiter.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'weekday', day: 5 },
        name: 'Friday',
        why: 'Friday was dies Veneris, Venus’s day (vendredi, venerdì). Honouring her on Fridays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer a rose or a sprig of myrtle with thanks for something lovely.',
      'Tend a plant or a garden for a few minutes, for Venus of gardens.',
      'Do one kind thing to restore harmony in a relationship.',
      'Wear a scent you love and dedicate it to her.',
    ],
    approach:
      'Venus is approached with flowers, beauty and harmony, as a Roman goddess of love, gardens and victory with her own character.',
    sources: [OVID_FASTI + ' (4.133–164; 4.863–900)', ROMAN_FESTIVALS, WEEKDAYS],
  },
  {
    key: 'mercury',
    sacred: [
      {
        rule: { kind: 'fixed', month: 5, day: 15 },
        name: 'The Ides of May',
        why: 'The birthday of Mercury’s temple by the Circus Maximus, when merchants sprinkled their goods with water from his spring.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'weekday', day: 3 },
        name: 'Wednesday',
        why: 'Wednesday was dies Mercurii, Mercury’s day (mercredi, mercoledì). Honouring him on Wednesdays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Set a coin on his shrine before business or a journey.',
      'Deal honestly in one transaction today, and offer it to him.',
      'Sprinkle a few drops of water on your work tools or bag before work.',
      'Send a message you have been putting off.',
    ],
    approach:
      'Mercury is approached with honest trade, coins and messages, remembering that his Roman name was laid over Gaulish and Greek gods with their own traditions.',
    sources: [OVID_FASTI + ' (5.663–692)', ROMAN_FESTIVALS, WEEKDAYS],
  },
  {
    key: 'ceres',
    sacred: [
      {
        rule: { kind: 'fixed', month: 4, day: 19 },
        name: 'Cerialia',
        why: 'The last and greatest day of Ceres’s April games, 12–19 April.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Offer a little bread, spelt or salt with thanks for food.',
      'Set aside a portion of a meal, the first fruits, for her.',
      'Support someone’s right to food or fair treatment, as she guarded the common people.',
      'Plant or tend a seed.',
    ],
    approach:
      'Ceres is approached with grain and gratitude as a Roman goddess of the harvest and of the rights of ordinary people.',
    sources: [OVID_FASTI + ' (4.393–620)', ROMAN_FESTIVALS],
  },

  {
    key: 'saturn',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'roman', id: 'saturnalia' },
        name: 'Saturnalia',
        why: 'Saturn’s festival from 17 December: a public sacrifice and banquet at his temple, then days of feasting, candles, small gifts and the cry “Io Saturnalia”.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'weekday', day: 6 },
        name: 'Saturday',
        why: 'Saturday was dies Saturni, Saturn’s day. Honouring him on Saturdays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Share food with someone, or give a small gift with no reason needed.',
      'Light a taper (and stay with it) for the light of the Golden Age.',
      'Sow a few seeds in a pot, for the god of sowing.',
      'Treat someone who serves you today as an equal and thank them.',
    ],
    approach:
      'Saturn is approached as the generous god of sowing and the Golden Age, not as the grim Saturn of later astrology.',
    sources: ['Macrobius, Saturnalia 1.7–1.10', ROMAN_FESTIVALS, WEEKDAYS],
  },
  {
    key: 'flora',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'roman', id: 'floralia' },
        name: 'Floralia',
        why: 'Flora’s festival and games from 28 April to 3 May, with bright clothes, flowers and scattered beans.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Put a few flowers in water and thank her for them.',
      'Plant seeds or a flower for bees and butterflies.',
      'Wear something bright, as Romans did at her festival.',
      'Stop for a minute at a flowering tree or plant and really look at it.',
    ],
    approach:
      'Flora is approached with delight and colour as the Roman goddess on whose blossom the harvest depends.',
    sources: [OVID_FASTI + ' (5.183–378 on the Floralia)', ROMAN_FESTIVALS],
  },
  {
    key: 'neptune',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'roman', id: 'neptunalia' },
        name: 'Neptunalia',
        why: 'Neptune’s festival on 23 July, in the dry heat of summer, when Romans feasted in shelters of leafy branches.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Pour a cup of fresh water onto a thirsty plant and thank him.',
      'Save water today in one small way.',
      'Pick up litter near a river, a drain or the shore.',
      'Ask him for safe travel for someone crossing water.',
    ],
    approach:
      'Neptune is approached as the Roman god of water, asked for water in drought and safe passage at sea, with care for the waters themselves.',
    sources: ['Festus, s.v. umbrae, on the Neptunalia shelters', ROMAN_FESTIVALS],
  },
  {
    key: 'faunus',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'roman', id: 'lupercalia' },
        name: 'Lupercalia',
        why: 'Ovid ties the Lupercalia of 15 February to Faunus, though which god it honoured is debated. His temple on Tiber Island was dedicated on the Ides, two days before.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 12, day: 5 },
        name: 'Faunalia, the Nones of December',
        why: 'Horace describes the country Faunalia on the Nones of December, with dancing, wine, incense and offerings to Faunus.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Spend a few minutes outdoors, listening.',
      'Pour a little milk or water at the foot of a tree.',
      'Play or hum a tune outside.',
      'Do one kind thing for an animal or a wild place.',
    ],
    approach:
      'Faunus is approached outdoors, with ease and respect, as the god of woods, pastures and flocks.',
    sources: [OVID_FASTI + ' (2.193–194 and 2.267–452)', 'Horace, Odes 3.18', ROMAN_FESTIVALS],
  },
  {
    key: 'sol',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'roman', id: 'sol_invictus' },
        name: 'Dies Natalis Solis Invicti',
        why: 'The birthday of the Unconquered Sun on 25 December, listed in the Roman calendar of 354.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 8, day: 9 },
        name: 'Sol Indiges on the Quirinal',
        why: 'Early Roman calendars mark a sacrifice to Sol Indiges on the Quirinal hill in August.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'weekday', day: 0 },
        name: 'Sunday',
        why: 'Sunday was dies Solis, the Sun’s day. Honouring him on Sundays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Face the sunrise (without looking straight at it) and greet him.',
      'Light a gold or yellow candle in the morning and stay with it.',
      'Open the curtains wide and let the light in with thanks.',
      'Do one thing openly and in good faith, in the light.',
    ],
    approach:
      'Sol is approached with steadiness and gratitude as the Roman sun, honest that his link with the date of Christmas is debated.',
    sources: [PHILOCALUS, 'Steven E. Hijmans, Sol: The Sun in the Art and Religions of Rome (2009)', WEEKDAYS],
  },

  {
    key: 'fortuna',
    sacred: [
      {
        rule: { kind: 'fixed', month: 6, day: 24 },
        name: 'Fors Fortuna',
        why: 'The festival of Fors Fortuna at her temples across the Tiber, when Romans of every class went downriver in garlanded boats and feasted.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 4, day: 1 },
        name: 'Veneralia (Fortuna Virilis)',
        why: 'The Kalends of April, when women honoured Venus Verticordia and Fortuna Virilis, as Ovid and the Praenestine calendar record.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'When something lucky happens, say thank you and give a little of it away.',
      'Drop a coin in a charity box in her name.',
      'Face one setback today with good grace.',
      'Light a candle before something uncertain and ask her to steer it well.',
    ],
    approach:
      'Fortuna is approached with gratitude and good humour, honoured in good luck and bad, and never treated as a promise of winnings.',
    sources: [OVID_FASTI + ' (4.133–164; 6.773–786)', ROMAN_FESTIVALS],
  },
  {
    key: 'bacchus',
    sacred: [
      {
        rule: { kind: 'fixed', month: 3, day: 17 },
        name: 'Liberalia',
        why: 'The festival of Liber Pater, with whom Bacchus was merged: old women sold honey cakes and offered part to the god, and boys took the toga of manhood.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Pour a small cup of wine or grape juice for him.',
      'Put on music that lifts you and let one worry go.',
      'Bake or buy a honey cake and set a piece aside for him.',
      'Do one thing that makes you feel free.',
    ],
    approach:
      'Bacchus and Liber are approached with joy and respect for their power to unsettle, with wine offered rather than overindulged.',
    sources: [OVID_FASTI + ' (3.713–790)', 'Livy 39.8–19, on the Bacchanalia of 186 BCE', ROMAN_FESTIVALS],
  },
  {
    key: 'pluto',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 24 },
        name: 'Mundus patet',
        why: 'The first of the three days the mundus was opened, which Varro called a gateway of the grim gods below; public business stopped.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 10, day: 5 },
        name: 'Mundus patet',
        why: 'The second opening of the mundus, the pit of the gods below.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 11, day: 8 },
        name: 'Mundus patet',
        why: 'The third opening of the mundus, the pit of the gods below.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Pour a little water into the earth and say the names of your dead.',
      'Bury a few black beans with a word of respect.',
      'Accept one ending in your life without fighting it.',
      'Sit quietly for a few minutes in the dark before sleep.',
    ],
    approach:
      'Pluto is approached with gravity and respect, as the rich lord of the dead, never as a devil.',
    sources: ['Macrobius, Saturnalia 1.16.16–18, quoting Varro on the mundus', 'Festus, s.v. Mundus (citing Ateius Capito), on the three days', 'Zosimus 2.5, on Dis and Proserpina at the Secular Games', ROMAN_FESTIVALS],
  },
  {
    key: 'proserpina',
    sacred: [
      {
        rule: { kind: 'fixed', month: 4, day: 19 },
        name: 'Cerealia',
        why: 'The last day of the Cerealia, the festival of her mother Ceres, whose story of loss and search Ovid tells at this season.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'mabon' },
        name: 'The autumn equinox',
        why: 'Many modern Pagans mark her descent to the underworld at the autumn equinox. This is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Eat a few pomegranate seeds and set some aside for her.',
      'Name one thing you lost that has begun to grow again.',
      'Put spring flowers or a sprig of green in water for her.',
      'Pour a little water into the earth for those who have died.',
    ],
    approach:
      'Proserpina is approached with tenderness, honouring both her seasons, below and above.',
    sources: [OVID_FASTI + ' (4.393–620)', 'Cicero, Pro Balbo 55, on the Greek priestesses of Ceres', HUTTON_TRIUMPH],
  },
  {
    key: 'vulcan',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 23 },
        name: 'Volcanalia',
        why: 'The festival of Vulcan in the heat of late summer, when granaries were full and fire most feared, with bonfires and offerings burned whole.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Check your smoke alarm or fire blanket in his name.',
      'Light a candle in a safe holder and ask him to keep your home safe.',
      'Make or mend something with care.',
      'Thank a firefighter or someone who works with fire.',
    ],
    approach:
      'Vulcan is approached with respect and caution, as fire that must be tended and kept in its place.',
    sources: ['Varro, On the Latin Language 6.20', 'Festus, s.v. Piscatorii ludi, on the fish offered for human lives', 'Vitruvius 1.7.1', ROMAN_FESTIVALS],
  },
  {
    key: 'pomona',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'mabon' },
        name: 'The apple harvest (Mabon)',
        why: 'No festival day of Pomona is known. Many modern Pagans and Roman polytheists honour her at the apple harvest; this is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Share a piece of fruit with her and return her half to the earth.',
      'Water or prune a plant with care.',
      'Plant a seed or a fruit tree in her name.',
      'Notice one thing ripening around you.',
    ],
    approach:
      'Pomona is approached through patient care for growing things, as the goddess of the orchard.',
    sources: ['Ovid, Metamorphoses 14.623–771', 'Festus, s.v. Pomonal and flamen Pomonalis', HUTTON_TRIUMPH],
  },
  {
    key: 'bona_dea',
    sacred: [
      {
        rule: { kind: 'fixed', month: 5, day: 1 },
        name: 'The founding of her temple',
        why: 'Ovid gives 1 May as the founding day of Bona Dea’s temple on the Aventine. Her women’s night rite came in early December, at the house of a senior magistrate.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Set out a cup of milk and some honey with a prayer for the health of women you love.',
      'Check in on a friend who is unwell.',
      'Make a cup of herbal tea and drink it slowly, for your own health.',
      'Keep one confidence faithfully.',
    ],
    approach:
      'Bona Dea is approached with care and discretion, as the goddess of women’s healing and the people’s welfare.',
    sources: [OVID_FASTI + ' (5.148–158)', 'Macrobius, Saturnalia 1.12.21–29', 'Plutarch, Life of Caesar 9–10', ROMAN_FESTIVALS],
  },
  {
    key: 'lares_penates',
    sacred: [
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => ({
        rule: { kind: 'fixed' as const, month, day: 1 },
        name: 'The Kalends',
        why: 'The first of the month, when Cato says the housekeeper garlanded the hearth and prayed to the household Lar, as also on the Nones and Ides.',
        basis: 'ancient' as const,
      })),
      {
        rule: { kind: 'fixed', month: 5, day: 1 },
        name: 'Lares Praestites',
        why: 'Ovid says the altar of the Lares Praestites, the guardian Lares of the city, was dedicated on 1 May.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Set a small portion of a meal before the household shrine.',
      'Light a candle or lamp at the lararium and greet the household gods.',
      'Tidy one corner of your home in their honour.',
      'Say the name of someone who once lived in your family home.',
    ],
    approach:
      'The Lares and Penates are approached simply and often, as the family’s own guardians, with daily care rather than ceremony.',
    sources: ['Cato, On Agriculture 143', OVID_FASTI + ' (5.129–146)', 'Plautus, The Pot of Gold, prologue', ROMAN_FESTIVALS],
  },
  {
    key: 'mithras',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'roman', id: 'sol_invictus' },
        name: 'Dies Natalis Solis Invicti',
        why: 'The birthday of the Unconquered Sun on 25 December, in the Calendar of 354, belongs to Sol Invictus, not to Mithras. Some modern devotees keep it for him because his inscriptions call him Sol Invictus Mithras; this is a modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'weekday', day: 0 },
        name: 'Sunday',
        why: 'The day of the Sun in the planetary week, kept by some modern devotees of the sun god Mithras. The cult’s own calendar is unknown.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Share bread and wine, or bread and juice, with someone.',
      'Keep your word in one thing today.',
      'Light a candle in a dark room and sit with it.',
      'Read about a mithraeum and the people who met there.',
    ],
    approach:
      'Mithras is approached with humility about the evidence, since the cult left no texts of its own.',
    sources: [PHILOCALUS, 'Manfred Clauss, The Roman Cult of Mithras (2000)', 'Roger Beck, The Religion of the Mithras Cult in the Roman Empire (2006)', WEEKDAYS],
  },

  // ─── Egyptian ─────────────────────────────────────────────────────────
  {
    key: 'isis',
    sacred: [
      {
        rule: { kind: 'fixed', month: 3, day: 5 },
        name: 'Navigium Isidis',
        why: 'The launching of Isis’s ship at the opening of the sailing season, described by Apuleius and listed in the Roman calendar of 354.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 10, day: 28 },
        name: 'Isia',
        why: 'The Roman festival of Isis seeking Osiris, from 28 October, ending in joy at his finding.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 8, day: 1 },
        name: 'Wep Ronpet, the opening of the year',
        why: 'The Egyptian new year at the rising of Sirius, the star of Isis-Sopdet. The real date follows the star and varies by place; the start of August is a stand-in, so check your community’s date.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Pour a little water or milk and ask her protection for someone you love.',
      'Light a candle and speak one of her many names: Aset, Great of Magic, Mother.',
      'Offer a flower or incense with thanks for healing.',
      'Do one act of care for a child or someone grieving.',
    ],
    approach:
      'Isis is approached as Aset of Egyptian religion, great of magic and devoted mother, while keeping her ancient cult distinct from later Western occult ideas about her.',
    sources: ['Apuleius, Metamorphoses 11', PHILOCALUS, WEP_RONPET],
  },
  {
    key: 'osiris',
    sacred: [
      {
        rule: { kind: 'fixed', month: 10, day: 28 },
        name: 'Isia, the seeking of Osiris',
        why: 'The Roman festival from 28 October mourned Osiris and searched for him.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 11, day: 3 },
        name: 'Hilaria, Osiris found',
        why: 'The Isia ended in rejoicing that Osiris was found, on 3 November in the Roman calendar.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'fixed', month: 8, day: 18 },
        name: 'The Wag festival',
        why: 'An Egyptian feast of the dead and of Osiris on 18 Thoth, early in the new year. Its date in our calendar is approximate, counted from an early-August new year.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Offer bread and water and name one of your dead.',
      'Plant a few seeds of grain in a pot as a small Osiris bed, a sign of life returning.',
      'Light incense and say a short prayer for all who have died.',
      'Tend a grave or a memorial, or tidy a photograph of someone you lost.',
    ],
    approach:
      'Osiris is approached with respect for the dead and the cycle of grain and flood, learning from Kemetic communities and Egyptian sources.',
    sources: [PHILOCALUS, WAG, 'Plutarch, On Isis and Osiris 39, on the mourning and finding of Osiris'],
  },
  {
    key: 'bastet',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 1 },
        name: 'Wep Ronpet, the opening of the year',
        why: 'Bastet’s great festival at Bubastis, described by Herodotus, has no securely known date. Honouring her at the new year, when all the gods are greeted, is a modern Kemetic custom; the start of August stands in for the real, star-set date.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Pour a little milk or water for her and thank her for your home.',
      'Play or sing one joyful song for her.',
      'Spend a few minutes caring for a cat, or support an animal shelter.',
      'Wear a scent you love, as an offering of pleasure.',
    ],
    approach:
      'Bastet is approached with joy, music and care for the home, as a goddess with a real cult and a protective, fierce side, not only a cat aesthetic.',
    sources: ['Herodotus, Histories 2.59–60, on the festival at Bubastis', WEP_RONPET],
  },
  {
    key: 'anubis',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 18 },
        name: 'The Wag festival',
        why: 'Old Kingdom tomb offering formulas ask Anubis for offerings to the dead at the Wag festival. The date is approximate, counted from an early-August new year.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Light a candle and say the names of the dead you remember.',
      'Offer fresh water and bread with a prayer for safe passage for the dying.',
      'Tend a grave, or write a few lines about someone who has died.',
      'Ask his protection before a difficult crossing or decision.',
    ],
    approach:
      'Anubis is approached with quiet respect as guardian and guide of the dead, treating funerary custom seriously rather than as gothic decoration.',
    sources: [WAG, WEP_RONPET],
  },
  {
    key: 'thoth',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 19 },
        name: 'The feast of Thoth',
        why: 'Plutarch says that on the 19th of the first month Egyptians ate honey and figs saying “Sweet is truth”. The date is approximate, counted from an early-August new year.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Write a short prayer or a page of honest notes, and offer it to him.',
      'Eat a fig or a little honey and say “sweet is truth”.',
      'Study for ten minutes with full attention.',
      'Pour fresh water and ask for fair judgement in one matter.',
    ],
    approach:
      'Thoth is approached through writing, study and truthfulness, keeping Egyptian Thoth distinct from the much later occult figure built on his name.',
    sources: ['Plutarch, On Isis and Osiris 68 (Moralia 378b): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/E.html', WAG, WEP_RONPET],
  },
  {
    key: 'hathor',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 1 },
        name: 'Wep Ronpet, the opening of the year',
        why: 'At Dendera the new year was Hathor’s great feast, when her image was carried to the temple roof to meet the sun. The real date follows Sirius; the start of August is a stand-in.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Play music, sing or dance for her for one song.',
      'Look in a mirror kindly and greet her.',
      'Offer a little milk, beer or flowers with thanks for a joy.',
      'Share a good meal or a laugh with someone.',
    ],
    approach:
      'Hathor is approached with music, dance and joy as a goddess of love and the sky, distinct from Sekhmet despite the myth that links them.',
    sources: ['Sylvie Cauville, Dendara: Le temple d’Isis and the Dendera roof chapels (on the New Year procession); Richard H. Wilkinson, The Complete Gods and Goddesses of Ancient Egypt (2003)', WEP_RONPET],
  },
  {
    key: 'sekhmet',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 1 },
        name: 'Wep Ronpet, the turn of the year',
        why: 'The last days of the year were dangerous, when Sekhmet’s messengers brought plague, and she was appeased to bring a healthy new year. The start of August stands in for the real, star-set date.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Offer red juice or a little red-tinted water and ask for healing.',
      'Do one thing to protect someone’s health, or your own.',
      'Light a candle and name one anger you are ready to cool.',
      'Thank a healer, nurse or doctor in her name.',
    ],
    approach:
      'Sekhmet is approached with respect for her fierceness, as a goddess of healing as well as plague and war, and never interchangeably with Bastet.',
    sources: ['Book of the Last Day of the Year (Papyrus Leiden I 346), on appeasing Sekhmet at the year’s turn', WEP_RONPET],
  },
  {
    key: 'ra',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 1 },
        name: 'Wep Ronpet, the opening of the year',
        why: 'The new year renewed the sun’s order and the year’s rhythm. The start of August stands in for the real, star-set date.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'weekday', day: 0 },
        name: 'Sunday',
        why: 'Sunday is the sun’s day (dies Solis), a Roman name with no link to Egyptian worship. Honouring Ra on Sundays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Greet the sunrise, or the first daylight you see, with a few words of praise.',
      'Offer fresh water and bread in the morning.',
      'At sunset, thank him for the day and wish him safe passage through the night.',
      'Do one task carefully and well, to uphold order (ma’at) in your corner of the world.',
    ],
    approach:
      'Ra is approached at sunrise and sunset as the creator and sustainer of order, learning from Kemetic communities rather than modern sun-god imagery.',
    sources: [WEP_RONPET, WEEKDAYS],
  },

  {
    key: 'horus',
    sacred: [
      {
        rule: { kind: 'fixed', month: 7, day: 28 },
        name: 'Birthday of Horus',
        why: 'The second of the five days upon the year, the birthday of Horus the Elder. The date is approximate, counted back from an early-August new year.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Draw a wedjat eye and ask him to protect someone you love.',
      'Offer fresh water and bread and say his name, Heru.',
      'Stand up for someone treated unfairly.',
      'Look up at the open sky for a minute and greet the falcon of the sky.',
    ],
    approach:
      'Horus is approached as the falcon of the sky and the rightful heir, knowing which of his forms is meant.',
    sources: [EPAGOMENAL_BIRTHS, 'The Contendings of Horus and Seth (Papyrus Chester Beatty I)'],
  },
  {
    key: 'set',
    sacred: [
      {
        rule: { kind: 'fixed', month: 7, day: 29 },
        name: 'Birthday of Set',
        why: 'The third of the five days upon the year. Ancient calendars counted it unlucky and best spent quietly. The date is approximate, counted back from an early-August new year.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Do something physically hard and offer the effort to him.',
      'Face one thing you have been avoiding.',
      'Watch a storm, or the wind, with respect from somewhere safe.',
      'Offer a little red wine, juice or water and ask for strength to protect.',
    ],
    approach:
      'Set is approached with honesty and courage, as the strong god who defends Ra’s barque, keeping his complex history in view.',
    sources: [EPAGOMENAL_BIRTHS, 'Herman te Velde, Seth, God of Confusion (1967)'],
  },
  {
    key: 'nephthys',
    sacred: [
      {
        rule: { kind: 'fixed', month: 7, day: 31 },
        name: 'Birthday of Nephthys',
        why: 'The last of the five days upon the year, the birthday of Nephthys. The date is approximate, counted back from an early-August new year.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Light a lamp in the evening and name someone you have lost.',
      'Sit with someone who is grieving, or send them a few kind words.',
      'Offer fresh water and say her name, Nebet-Het.',
      'Tidy your home with care, for the Lady of the House.',
    ],
    approach:
      'Nephthys is approached gently, as mourner and protector of the dead, beside Isis and with respect for how little of her own cult survives.',
    sources: [EPAGOMENAL_BIRTHS, 'The Lamentations of Isis and Nephthys (Papyrus Berlin 3008)'],
  },
  {
    key: 'maat',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 1 },
        name: 'Wep Ronpet, the opening of the year',
        why: 'No festival of Maat is securely known. Many Kemetics renew their commitment to living in maat at the new year, a modern custom; the start of August stands in for the real, star-set date.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Tell the truth in one place where it would be easier not to.',
      'At the end of the day, note one fair thing you did and one you could do better.',
      'Put one small thing back in order: a room, a promise, an apology.',
      'Offer fresh water and say: “I have done maat”.',
    ],
    approach:
      'Maat is approached by living truthfully and fairly every day, as both a goddess and the order she stands for.',
    sources: ['Book of the Dead, spell 125 (the Negative Confession)', 'Emily Teeter, The Presentation of Maat (1997)', WEP_RONPET],
  },

  {
    key: 'amun',
    sacred: [
      {
        rule: { kind: 'fixed', month: 9, day: 14 },
        name: 'Opet festival',
        why: 'Under Thutmose III the Opet festival began on II Akhet 15, when Amun, Mut and Khonsu sailed from Karnak to Luxor. The date is approximate, counted from an early-August new year; the app’s Kemetic calendar works it out from the anchor you choose.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Sit quietly, breathe slowly and greet the hidden god.',
      'Offer a cup of fresh water and a little bread, then share it afterwards.',
      'Do one thing for someone with little.',
      'Ask him one question and listen for what comes.',
    ],
    approach:
      'Amun is approached with reverence and humility, as the hidden god beyond every image and the vizier of the poor.',
    sources: ['The Opet festival reliefs in the colonnade at Luxor; the Medinet Habu calendar', 'Jan Assmann, The Search for God in Ancient Egypt (2001)', WEP_RONPET],
  },
  {
    key: 'ptah',
    sacred: [
      {
        rule: { kind: 'fixed', month: 11, day: 24 },
        name: 'Festival of Sokar',
        why: 'The festival of Sokar, with whom Ptah was joined as Ptah-Sokar, on IV Akhet 26 in the month of Khoiak, recorded at Medinet Habu. The date is approximate, counted from an early-August new year.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Make or mend something carefully and dedicate it to him.',
      'Think before you speak once today, as the god who creates by word.',
      'Draw an ear and ask him to hear one prayer.',
      'Thank a builder, maker or craftsperson.',
    ],
    approach:
      'Ptah is approached through skilled work and careful speech, as the creator of Memphis who hears prayers.',
    sources: ['The Shabaka Stone (British Museum EA 498)', 'The festival calendar of Medinet Habu, on the Sokar festival', WEP_RONPET],
  },
  {
    key: 'bes',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 20 },
        name: 'The Festival of Drunkenness',
        why: 'Hathor’s Festival of Drunkenness (Tekh) on I Akhet 20 was a time of music, dance and merriment, and Bes appears in her company in art. Keeping it for him is a modern pairing; he had no temple festival of his own. The date is approximate.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Put on music and dance for a minute.',
      'Laugh with someone you love.',
      'Ask him to watch over your home before you sleep.',
      'Do one kind thing for a parent or a child.',
    ],
    approach:
      'Bes is approached with warmth and good humour, as the household’s merry guardian.',
    sources: ['Dimitri Meeks and Christine Favard-Meeks, Daily Life of the Egyptian Gods (1996)', 'Geraldine Pinch, Egyptian Mythology (2002), s.v. Bes', WEP_RONPET],
  },
  {
    key: 'nut',
    sacred: [
      {
        rule: { kind: 'fixed', month: 7, day: 27 },
        name: 'The five days upon the year',
        why: 'The first of the five days added to the year, when Nut’s children were born. The date is approximate, counted back from an early-August new year.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Look up at the night sky for a few minutes.',
      'Pour a little water at the foot of a tree.',
      'Thank her for the morning light when you wake.',
      'Name one person who sheltered you.',
    ],
    approach:
      'Nut is approached as the vast, sheltering sky and mother of the gods.',
    sources: [EPAGOMENAL_BIRTHS, 'The Book of Nut (Fundamentals of the Course of the Stars), in the cenotaph of Seti I at Abydos'],
  },
  {
    key: 'neith',
    sacred: [
      {
        rule: { kind: 'fixed', month: 6, day: 9 },
        name: 'The festival of Neith at Esna',
        why: 'The temple of Esna kept Neith’s festival of creation on 13 Epiphi (III Shemu 13), when her account of creation was recited. The date is approximate, counted from an early-August new year.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Weave, knit or plait a few rows for her.',
      'Light a lamp and let it burn safely while you sit with her.',
      'Make one fair decision with care.',
      'Do one thing for yourself, independently.',
    ],
    approach:
      'Neith is approached with respect for her great age and wisdom, as creator, huntress and judge.',
    sources: ['Serge Sauneron, Esna V: Les fêtes religieuses d’Esna (1962)', 'Herodotus 2.62, on the Feast of Lamps at Sais', WEP_RONPET],
  },
  {
    key: 'sobek',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 1 },
        name: 'Wep Ronpet and the rising Nile',
        why: 'The opening of the year, at the time the Nile’s flood began. Honouring Sobek then, as lord of the waters, is a modern Kemetic choice; no single festival of his can be dated.',
        basis: 'modern',
      },
      {
        rule: { kind: 'moon', phase: 'new' },
        name: 'The new moon',
        why: 'Egyptian temples kept the first day of the lunar month as a feast for their gods. Keeping it for Sobek is a modern choice.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer a cup of fresh water with thanks for the water you use.',
      'Spend a few minutes by a river, pond or canal.',
      'Stand firm in one thing today.',
      'Pick up litter near water.',
    ],
    approach:
      'Sobek is approached with respect for his power, as the crocodile of the Nile who protects and gives fertility.',
    sources: ['Strabo, Geography 17.1.38, on the sacred crocodile of Arsinoe', 'Herodotus 2.69', WEP_RONPET],
  },
  {
    key: 'khonsu',
    sacred: [
      {
        rule: { kind: 'fixed', month: 9, day: 14 },
        name: 'Opet festival',
        why: 'At Opet, Khonsu’s barque sailed with those of Amun and Mut from Karnak to Luxor. The date is approximate, counted from an early-August new year.',
        basis: 'ancient',
      },
      {
        rule: { kind: 'moon', phase: 'full' },
        name: 'The full moon',
        why: 'Egyptian temples kept the full moon, the middle of the lunar month, as a feast, and Khonsu is the moon himself.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Look for the moon and note its phase.',
      'Ask him for healing for someone who is unwell.',
      'Plan one thing for the month ahead.',
      'Offer a cup of milk or water by a window at night.',
    ],
    approach:
      'Khonsu is approached with patience, as the moon who travels and the healer of Thebes.',
    sources: ['The Bentresh Stela (Louvre C 284)', 'Richard A. Parker, The Calendars of Ancient Egypt (1950), on the lunar feasts', WEP_RONPET],
  },
  {
    key: 'taweret',
    sacred: [
      {
        rule: { kind: 'fixed', month: 7, day: 27 },
        name: 'The five days upon the year',
        why: 'The five days on which the gods were born, kept as days to guard against harm. Honouring Taweret, guardian of births, on them is a modern pairing. The date is approximate.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Light a candle for someone who is pregnant or has a new baby.',
      'Offer practical help to a new parent.',
      'Ask her to watch over the children in your life tonight.',
      'Offer a cup of milk with thanks for those who cared for you as a child.',
    ],
    approach:
      'Taweret is approached with warmth and trust, as the fierce protector of mothers and babies.',
    sources: [EPAGOMENAL_BIRTHS, 'Geraldine Pinch, Magic in Ancient Egypt (1994), on birth amulets and wands'],
  },

  // ─── Norse ────────────────────────────────────────────────────────────
  {
    key: 'odin',
    sacred: [
      {
        rule: { kind: 'weekday', day: 3 },
        name: 'Wednesday, Woden’s day',
        why: 'Wednesday is named for Woden (Odin). The name is old; honouring him on Wednesdays is a modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'sigrblot' },
        name: 'Sigrblót',
        why: 'Snorri says that at the start of summer people sacrificed “for victory”, and Odin is the giver of victory. Recorded in the 13th century.',
        basis: 'later',
      },
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'jol' },
        name: 'Yule',
        why: 'In Hákonar saga the first Yule toast was drunk to Odin “for victory and power to the king”. Recorded in the 13th century.',
        basis: 'later',
      },
    ],
    devotions: [
      'Pour a little mead or water and raise a toast to Odin.',
      'Read a few stanzas of the Hávamál and think on one.',
      'Learn one new thing today, or write a few lines of verse.',
      'Draw a single rune and sit with it for a few minutes.',
    ],
    approach:
      'Odin is approached with poetry, study and honest effort, with care for his demanding side, and in inclusive Heathen company.',
    sources: [YNGLINGA_8, HAKONAR, WEEKDAYS],
  },
  {
    key: 'thor',
    sacred: [
      {
        rule: { kind: 'weekday', day: 4 },
        name: 'Thursday, Thor’s day',
        why: 'Thursday is named for Thor (Old English Þunor). The name is etymological; honouring him on Thursdays is a modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'jol' },
        name: 'Yule',
        why: 'Many modern Heathens toast Thor at Yule for protection through winter. The sagas name Odin, Njörðr and Freyr in the Yule toasts, not Thor, so this is modern.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Raise a cup of beer, mead or water to Thor before a hard task.',
      'Do something physically demanding and offer the effort to him.',
      'Stand up for someone today, and ask his strength.',
      'Listen to the wind or rain for a minute and greet the thunderer.',
    ],
    approach:
      'Thor is approached plainly and warmly as protector of people and the everyday world, in inclusive Heathen company that rejects racist use of his hammer.',
    sources: [
      WEEKDAYS,
      HAKONAR,
      'Landnámabók (Sturlubók) S85 on Þórólfr Mostrarskegg and S218 on Helgi the Lean, trans. Hermann Pálsson and Paul Edwards (1972): https://www.snerpa.is/net/snorri/landnama.htm',
    ],
  },
  {
    key: 'freyja',
    sacred: [
      {
        rule: { kind: 'weekday', day: 5 },
        name: 'Friday',
        why: 'Friday is named for Frigg (Old English Frīge), not Freyja, though Old Norse frjádagr is sometimes linked with her. Many modern Heathens honour Freyja on Fridays; it is a modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'disablot' },
        name: 'Dísablót',
        why: 'Freyja is called Vanadís, “dís of the Vanir”, so many modern Heathens honour her at the Dísablót. The blót is recorded; her place in it is a modern reading.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer a little honey or mead with a word of love for someone.',
      'Wear something beautiful today and dedicate it to her.',
      'Set out a flower or a few berries on her shrine.',
      'Spend a few minutes in seiðr-like stillness: sit, breathe and listen.',
    ],
    approach:
      'Freyja is approached with gifts of beauty, honey and mead as a goddess of love, magic and war, with honesty that much modern practice is reconstruction.',
    sources: [WEEKDAYS, 'Snorri Sturluson, Gylfaginning 35 (Vanadís), and Ynglinga saga ch. 29 on the dísablót at Uppsala', ICELANDIC_CAL],
  },
  {
    key: 'frigg',
    sacred: [
      {
        rule: { kind: 'weekday', day: 5 },
        name: 'Friday, Frigg’s day',
        why: 'Friday is named for Frigg (Old English Frīge). The name is old; honouring her on Fridays is a modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'jol' },
        name: 'Yule (Mother’s Night)',
        why: 'Bede records an Anglo-Saxon “Mothers’ Night” at midwinter. Linking it to Frigg is a modern Heathen custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Bless your home quietly as you lock up for the night.',
      'Spin, knit, sew or mend something for a few minutes.',
      'Offer a little bread or milk and ask her protection for your family.',
      'Keep one confidence that was trusted to you, as she knows and does not tell.',
    ],
    approach:
      'Frigg is approached quietly through the household, family and care, honest that most devotion to her today is reconstruction.',
    sources: [WEEKDAYS, 'Bede, De temporum ratione 15, on Modranecht'],
  },
  {
    key: 'freyr',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'jol' },
        name: 'Yule',
        why: 'In Hákonar saga the Yule toasts were drunk to Njörðr and Freyr “for a good year and peace”. Recorded in the 13th century.',
        basis: 'later',
      },
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'vetrnaetur' },
        name: 'Winter Nights',
        why: 'Snorri says people sacrificed at winter’s start “for a good year”, Freyr’s gift. Linking this blót to Freyr is a modern reading.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer a little ale, bread or grain with thanks for food.',
      'Tend a garden, plant or window box for a few minutes.',
      'Make peace in one small quarrel.',
      'Share food with someone, as an offering of good seasons.',
    ],
    approach:
      'Freyr is approached with thanks for the land, food and peace, as the old sagas show him trusted as a lifelong friend.',
    sources: [
      HAKONAR,
      YNGLINGA_8,
      'Víga-Glúms saga ch. 9, Þorkell’s ox for Freyr, “who has long been my fulltrúi”',
      'Hrafnkels saga Freysgoða ch. 2: https://www.snerpa.is/net/isl/hrafn.htm',
    ],
  },
  {
    key: 'loki',
    sacred: [
      {
        rule: { kind: 'fixed', month: 4, day: 1 },
        name: 'April Fools’ Day',
        why: 'No ancient cult of Loki is known. Some modern Lokeans honour him playfully on 1 April; it is purely a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer a little coffee, something spicy or a sweet with a word of thanks.',
      'Laugh at yourself once today, kindly.',
      'Look at a problem from an unexpected angle and try one new approach.',
      'Light a candle and name one change you need to accept.',
    ],
    approach:
      'Loki is approached with humour and honesty, knowing his place in modern Heathenry is debated and some communities do not honour him at all.',
    sources: ['No ancient sources record worship of Loki; see Stefanie von Schnurbein, Norse Revival (2016), on Lokeans in modern Heathenry'],
  },
  {
    key: 'hel',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'vetrnaetur' },
        name: 'Winter Nights',
        why: 'Many modern Heathens honour the dead and Hel at Winter Nights. No ancient cult of Hel is recorded, so this is modern.',
        basis: 'modern',
      },
      {
        rule: { kind: 'moon', phase: 'dark' },
        name: 'The dark moon',
        why: 'A modern custom for honouring the goddess of the dead.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Set out a little bread and water and name one of your dead.',
      'Tend a grave or memorial, or clean a photograph of someone you lost.',
      'Sit in silence for a few minutes with something that has ended.',
      'Write down a family story before it is forgotten.',
    ],
    approach:
      'Hel is approached quietly as keeper of the dead, honest that devotion to her is largely reconstruction and that some Heathens do not honour her.',
    sources: ['Snorri Sturluson, Gylfaginning 34', ICELANDIC_CAL],
  },
  {
    key: 'tyr',
    sacred: [
      {
        rule: { kind: 'weekday', day: 2 },
        name: 'Tuesday, Týr’s day',
        why: 'Tuesday is named for Tīw (Týr). The name is old; honouring him on Tuesdays is a modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'sigrblot' },
        name: 'Sigrblót',
        why: 'Sigrdrífumál tells warriors to carve victory runes and name Týr twice, so many modern Heathens honour him at the summer blót for victory. A modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Keep your word today in one thing, and offer it to Týr.',
      'Speak honestly where it costs you something.',
      'Raise a cup of water or mead to justice and fair dealing.',
      'Do one brave thing you have been avoiding.',
    ],
    approach:
      'Týr is approached with kept oaths, honest testimony and courage, as the god who gave his hand to keep the world safe.',
    sources: [WEEKDAYS, 'Sigrdrífumál 6 (Poetic Edda)', YNGLINGA_8],
  },
  {
    key: 'skadi',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'vetrnaetur' },
        name: 'Winter Nights',
        why: 'Many modern Heathens greet Skaði as winter begins. No ancient date for her is known, so this is modern.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'thorrablot' },
        name: 'Þorrablót',
        why: 'Some modern Heathens honour Skaði in deep winter at Þorrablót. A modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Go outside in the cold for a few minutes and greet her.',
      'Offer clean cold water or melted snow.',
      'Stand up for yourself fairly in one matter.',
      'Walk, climb or move outdoors as an offering.',
    ],
    approach:
      'Skaði is approached outdoors and in winter, as an independent huntress who sought just redress, honest that devotion to her is largely modern.',
    sources: ['Snorri Sturluson, Skáldskaparmál 1–2 and Gylfaginning 23', ICELANDIC_CAL],
  },
  {
    key: 'baldur',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'midsummer' },
        name: 'Midsummer',
        why: 'Nineteenth-century scholars linked Scandinavian midsummer fires with Baldr’s death, and many modern Heathens honour him then. A modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'jol' },
        name: 'Yule',
        why: 'Some modern Heathens remember Völuspá’s promise that Baldr will return as the light returns at midwinter. A modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer white flowers or a little mead with a kind word.',
      'Do one unexpected kindness today.',
      'Sit in sunlight for a few minutes and think of what you hope will return.',
      'Name a grief gently, and let it be.',
    ],
    approach:
      'Baldr is approached with kindness and gentleness, honest that devotion to him relies heavily on reconstruction.',
    sources: ['Völuspá 62 (Poetic Edda)', 'J. G. Frazer, The Golden Bough, part VII, Balder the Beautiful (1913)', HUTTON_STATIONS],
  },
  {
    key: 'idunn',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'ostara' },
        name: 'The spring equinox',
        why: 'Many modern Heathens and Pagans honour Iðunn as spring renews the world. No ancient rites for her are known.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'sigrblot' },
        name: 'First day of summer',
        why: 'Some modern Heathens greet Iðunn on the first day of summer. A modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer a slice of apple, then share the rest.',
      'Do one thing for your health today, and dedicate it to her.',
      'Put fresh flowers or greenery on her shrine.',
      'Tend something growing.',
    ],
    approach:
      'Iðunn is approached with apples and healthy habits as keeper of renewal, known from her stories rather than any recorded rites.',
    sources: ['Snorri Sturluson, Skáldskaparmál 1–3; Haustlöng'],
  },

  {
    key: 'njord',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'jol' },
        name: 'Yule',
        why: 'Snorri says the Yule toasts were drunk to Odin, then to Njord and Freyr “for a good year and peace”.',
        basis: 'later',
      },
    ],
    devotions: [
      'Pour a little salt water or ale into a bowl and thank him for a safe journey.',
      'Pick up litter from a beach, riverbank or gutter.',
      'Share something you have with someone who has less.',
      'Make peace in one small quarrel.',
    ],
    approach:
      'Njord is approached calmly and generously, as the Vanir god of the sea, prosperity and peace.',
    sources: [HAKONAR, 'Snorri Sturluson, Gylfaginning 23', 'Tacitus, Germania 40, on Nerthus'],
  },
  {
    key: 'heimdall',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'vetrnaetur' },
        name: 'Winter Nights',
        why: 'No festival of Heimdall is recorded. Some modern Heathens greet the guardian of thresholds at the year’s turning points, such as Winter Nights; this is modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Stand at your front door for a moment, look and listen.',
      'Check that the people in your care are safe tonight.',
      'Keep one promise faithfully.',
      'Listen carefully to someone, as he hears the grass grow.',
    ],
    approach:
      'Heimdall is approached with steadiness, as the watchman of the gods and guardian of boundaries.',
    sources: ['Snorri Sturluson, Gylfaginning 27', 'Völuspá 1 and 46; Rígsþula', ICELANDIC_CAL],
  },
  {
    key: 'sif',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'haustblot' },
        name: 'Haustblót',
        why: 'Many modern Heathens honour Sif with Thor at the autumn harvest blót. This is modern custom; her link with grain is a modern reading.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Brush or braid your hair with care and thank her.',
      'Share bread with your family or household.',
      'Do one thing to look after your home.',
      'Offer peace where there is tension.',
    ],
    approach:
      'Sif is approached warmly and simply, as the golden-haired goddess of family and household.',
    sources: ['Snorri Sturluson, Skáldskaparmál 35, on Sif’s hair', 'Lokasenna 53', ICELANDIC_CAL],
  },
  {
    key: 'bragi',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'jol' },
        name: 'Yule',
        why: 'The sagas tell of vows made at Yule over the bragarfull, the chieftain’s cup.',
        basis: 'later',
      },
    ],
    devotions: [
      'Read a poem aloud.',
      'Write four lines of your own.',
      'Make one promise you will keep, and say it aloud.',
      'Tell a story about someone you have lost.',
    ],
    approach:
      'Bragi is approached with words and good company, as the god of poetry and vows.',
    sources: ['Helgakviða Hjörvarðssonar, prose after stanza 30, on vows at Yule over the bragarfull', 'Snorri Sturluson, Skáldskaparmál 10', 'Eiríksmál; Hákonarmál'],
  },
  {
    key: 'ullr',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'thorrablot' },
        name: 'Þorrablót',
        why: 'No festival of Ullr is recorded. Many modern Heathens honour the winter hunter and skier in the depth of winter; this is modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Go outside on a cold day and walk, run or ski for him.',
      'Practise a skill with focus for ten minutes.',
      'Thank the animal or farmer behind a meal.',
      'Keep a fair contest fair.',
    ],
    approach:
      'Ullr is approached with steadiness and sportsmanship, as the archer and skier of the winter.',
    sources: ['Snorri Sturluson, Gylfaginning 31', 'Grímnismál 5; Atlakviða 30', 'Saxo Grammaticus, Gesta Danorum 3, on Ollerus'],
  },
  {
    key: 'eir',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'disablot' },
        name: 'Dísablót',
        why: 'No festival of Eir is recorded. Some modern Heathens honour her among the goddesses at Dísablót; this is modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Make a cup of herbal tea and ask for healing for someone.',
      'Do one thing for your own health today.',
      'Thank a nurse, doctor or carer.',
      'Check in on someone who is unwell.',
    ],
    approach:
      'Eir is approached gently, as the best of healers, honest that almost all we know of her is a line or two in Snorri.',
    sources: ['Snorri Sturluson, Gylfaginning 35', 'Fjölsvinnsmál 38'],
  },
  {
    key: 'sunna',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'midsummer' },
        name: 'Midsummer',
        why: 'The height of the sun’s power. Honouring Sól at midsummer is modern Heathen custom; no ancient festival of hers is recorded.',
        basis: 'modern',
      },
      {
        rule: { kind: 'weekday', day: 0 },
        name: 'Sunday',
        why: 'Sunday is the sun’s day (Old Norse sunnudagr). Honouring Sól on Sundays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Greet the first daylight you see by name.',
      'Spend a few minutes in the sun, if there is any.',
      'Set a dish of honey in the light for her.',
      'Do one thing to pass something good on to someone younger.',
    ],
    approach:
      'Sól is approached with gratitude and warmth, as the Sun who drives her horses across the sky each day.',
    sources: ['Snorri Sturluson, Gylfaginning 11', 'Vafþrúðnismál 47', 'The Second Merseburg Charm', WEEKDAYS],
  },
  {
    key: 'mani',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'full' },
        name: 'The full moon',
        why: 'Many modern Heathens honour Máni at the full moon. This is modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'weekday', day: 1 },
        name: 'Monday',
        why: 'Monday is the moon’s day (Old Norse mánadagr). Honouring Máni on Mondays is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Look for the moon tonight and note its phase.',
      'Offer a cup of water or milk on a windowsill at night.',
      'Plan the month ahead.',
      'Ask him to watch over someone travelling tonight.',
    ],
    approach:
      'Máni is approached calmly, as the Moon who keeps time and carries the children Bil and Hjúki.',
    sources: ['Snorri Sturluson, Gylfaginning 11', 'Vafþrúðnismál 23', WEEKDAYS],
  },
  {
    key: 'norns',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'norse', id: 'vetrnaetur' },
        name: 'Winter Nights',
        why: 'The start of winter and of the old Icelandic year. Honouring the Norns at the year’s turning is modern Heathen custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Pour a cup of water at the roots of a tree.',
      'Think about one thing in your past that shaped you.',
      'Make one choice today with care, knowing it will shape what comes.',
      'Spin, twist or knot a thread while you sit with them.',
    ],
    approach:
      'The Norns are approached with respect and humility, as the powers of fate who water the world tree.',
    sources: ['Völuspá 19–20', 'Snorri Sturluson, Gylfaginning 15–16', 'Helgakviða Hundingsbana I 2–4', ICELANDIC_CAL],
  },

  // ─── Celtic ───────────────────────────────────────────────────────────
  {
    key: 'brigid',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'la_fheile_bride' },
        name: 'Imbolc, Lá Fhéile Bríde',
        why: 'Imbolc begins spring in early Irish texts, and 1 February has been St Brigid’s feast since the early Middle Ages. Whether it was the goddess’s day too is debated.',
        basis: 'later',
      },
    ],
    devotions: [
      'Light a candle and keep a small vigil for her flame for a few minutes.',
      'Offer a little milk or butter, or set out a glass of water for healing.',
      'Write or read a few lines of poetry.',
      'Make or mend something, honouring her as smith.',
    ],
    approach:
      'Brigid is approached with fire, water, poetry and craft, respecting that she is honoured by Christians as a saint and by Pagans as a goddess.',
    sources: [
      'Martyrology of Tallaght (9th c.), feast of Brigit on 1 February',
      'Gerald of Wales, Topographia Hibernica 2.34–36 (12th c.), on the perpetual fire at Kildare',
      HUTTON_STATIONS,
    ],
  },
  {
    key: 'cernunnos',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'beltane' },
        name: 'Beltane',
        why: 'Wiccans honour the Horned God, often called Cernunnos, at Beltane. Almost nothing is known of his ancient worship, so this is modern.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'samhain' },
        name: 'Samhain',
        why: 'Many modern Pagans honour the Horned God as lord of the hunt at Samhain. A modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer an acorn, an apple or a few nuts outdoors.',
      'Spend a few minutes among trees and greet the wild.',
      'Pour clean water onto earth and thank the land.',
      'Watch an animal for a while without disturbing it.',
    ],
    approach:
      'Cernunnos is approached in the wild with simple offerings, with honesty that almost all of his character today is modern Pagan devotion.',
    sources: ['The Pillar of the Boatmen, Paris (1st c. CE), the only inscription naming him', 'Miranda Green, Dictionary of Celtic Myth and Legend (1992)', HUTTON_TRIUMPH],
  },
  {
    key: 'cerridwen',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'full' },
        name: 'The full moon',
        why: 'Many modern witches honour Cerridwen at the full moon. Her tale gives no holy days, so this is modern.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'samhain' },
        name: 'Samhain',
        why: 'Modern Pagans often honour her cauldron of rebirth at Samhain. A modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Stir a pot of soup or tea slowly and ask for inspiration.',
      'Write a few lines, a poem or a page of your journal.',
      'Offer a little oats, milk or herbal tea on her shrine.',
      'Name one change you are going through, and ask her help.',
    ],
    approach:
      'Cerridwen is approached through inspiration and transformation, with honesty about what comes from the Welsh tale of Taliesin and what from modern witchcraft.',
    sources: ['Hanes Taliesin, in Patrick K. Ford, The Mabinogi and Other Medieval Welsh Tales (1977)', HUTTON_TRIUMPH],
  },
  {
    key: 'morrigan',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'samhain_gaelic' },
        name: 'Samhain',
        why: 'In Cath Maige Tuired the Dagda meets the Morrígan at Samain by the river Unshin before the battle. A medieval Irish text.',
        basis: 'later',
      },
    ],
    devotions: [
      'Pour a little red wine or juice and ask for courage.',
      'Name one truth you have been avoiding, and face it.',
      'Offer a few blackberries or a piece of bread outdoors.',
      'Do one brave thing for someone who cannot defend themselves.',
    ],
    approach:
      'The Morrígan is approached with courage and honesty as a goddess of sovereignty, fate and battle, not flattened into only empowerment or only war.',
    sources: [CMT],
  },
  {
    key: 'dagda',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'samhain_gaelic' },
        name: 'Samhain',
        why: 'In Cath Maige Tuired the Dagda keeps a tryst with the Morrígan at Samain. A medieval Irish text.',
        basis: 'later',
      },
    ],
    devotions: [
      'Share a simple meal, or a bowl of porridge, and offer the first spoon.',
      'Play or sing a tune, for the Dagda’s harp.',
      'Do one generous thing for your family or friends.',
      'Pour a little ale or water onto earth with thanks for plenty.',
    ],
    approach:
      'The Dagda is approached with hospitality, music and shared food as the good god of abundance, learning from Irish sources.',
    sources: [CMT],
  },
  {
    key: 'lugh',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'lughnasadh' },
        name: 'Lughnasadh',
        why: 'Medieval Irish tradition says Lugh founded the festival in memory of his foster-mother Tailtiu; Lughnasa customs survived into modern Irish folk life.',
        basis: 'later',
      },
    ],
    devotions: [
      'Practise a skill for ten minutes and offer your best work to him.',
      'Offer a piece of bread or a few berries with thanks for the harvest.',
      'Keep an oath, or play a game fairly.',
      'Learn one new thing in a craft you have not tried.',
    ],
    approach:
      'Lugh is approached through skill in every art, fair contest and kept oaths, learning from Irish sources and living Lughnasa custom.',
    sources: [MACNEILL, 'Lebor Gabála Érenn, ed. R. A. S. Macalister (1938–56)'],
  },
  {
    key: 'epona',
    sacred: [
      {
        rule: { kind: 'fixed', month: 12, day: 18 },
        name: 'The feast of Epona',
        why: 'A Roman rural calendar from Guidizzolo in northern Italy marks “Eponae” on 18 December. It may have been a local feast.',
        basis: 'ancient',
      },
    ],
    devotions: [
      'Offer a handful of oats or an apple.',
      'Do something kind for a horse, donkey or any working animal.',
      'Ask her protection before a journey.',
      'Pour fresh water and thank her for safe travel home.',
    ],
    approach:
      'Epona is approached with care for horses and travellers as a Gaulish goddess honoured across the Roman army, honest that almost no myths of her survive.',
    sources: [
      'The Guidizzolo calendar, “XV Kal. Ian. Eponae”; see Gregori and Melmeluzzi (2021), Sapienza University of Rome: https://iris.uniroma1.it/handle/11573/1608806',
      'EPONA.net inscriptions: https://epona.net/inscriptions.html',
    ],
  },
  {
    key: 'arianrhod',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'full' },
        name: 'The full moon',
        why: 'Many modern Pagans honour Arianrhod at the full moon, though her lunar and stellar character is largely modern; the Mabinogi gives no holy days.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Look at the night sky and greet her by Caer Arianrhod, the Corona Borealis.',
      'Speak your own name aloud, honestly, as a naming.',
      'Offer a little sea water or salt water, or a silver coin.',
      'Write one thing you are choosing for yourself.',
    ],
    approach:
      'Arianrhod is approached through the Fourth Branch of the Mabinogi and the stars, with honesty that most of her modern character is new.',
    sources: ['Math fab Mathonwy, the Fourth Branch of the Mabinogi, trans. Sioned Davies (2007)', HUTTON_TRIUMPH],
  },
  {
    key: 'rhiannon',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'bealtaine' },
        name: 'Calan Mai, May Eve',
        why: 'In the First Branch of the Mabinogi, Rhiannon’s lost son is found on May Eve. Honouring her then is a modern custom built on the medieval tale.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Listen to birdsong for a few minutes in her honour.',
      'Offer an apple, a little honey or oats.',
      'Speak up for someone who has been wrongly blamed.',
      'Be patient with one hard thing today.',
    ],
    approach:
      'Rhiannon is approached through her story in the Mabinogi, with patience and justice, learning from Welsh voices.',
    sources: ['Pwyll Pendefig Dyfed, the First Branch of the Mabinogi, trans. Sioned Davies (2007)'],
  },
  {
    key: 'manannan',
    sacred: [
      {
        rule: { kind: 'fixed', month: 6, day: 23 },
        name: 'Midsummer Eve, Manannan’s rent',
        why: 'Manx tradition, recorded in a chronicle from before 1523, says landholders carried rushes up South Barrule on Midsummer Eve as rent to Manannan. The custom is kept again today.',
        basis: 'later',
      },
    ],
    devotions: [
      'Offer a little sea water, or water with a pinch of salt.',
      'Bring a few rushes or grasses to his shrine as “rent”.',
      'Ask his protection before a journey over water.',
      'Do one thing to care for a coast, river or the sea.',
    ],
    approach:
      'Manannán is approached as lord of the sea and protector of Mann, respecting Manx custom as living local tradition.',
    sources: [
      'William Walter Gill, A Second Manx Scrapbook (1932), ch. 10: https://isle-of-man.com/manxnotebook/fulltext/scrap2/ch10_1.htm',
      'Culture Vannin, “Tynwald Day in Manx folklore”: https://culturevannin.im/news/tynwald-day-in-manx-folklore-583299',
      'A. W. Moore, Manx Ballads and Music (1896), the Manx Traditionary Ballad',
    ],
  },

  {
    key: 'danu',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'samhain_gaelic' },
        name: 'Samhain',
        why: 'The start of the Gaelic year. No day of Danu or Anu is recorded; honouring the mother of the Tuatha Dé at Samhain is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Pour a little milk or water onto the earth with thanks for the land.',
      'Learn the old name of a hill, river or townland near you.',
      'Plant or care for a native tree.',
      'Say the names of your grandmothers.',
    ],
    approach:
      'Danu is approached with humility about how little is known, as the ancestral mother of the gods of Ireland.',
    sources: ['Sanas Cormaic (Cormac’s Glossary), s.v. Ana', 'Lebor Gabála Érenn, on Danand', 'Dáithí Ó hÓgáin, Myth, Legend and Romance (1990), s.v. Anu and Danann'],
  },
  {
    key: 'aine',
    sacred: [
      {
        rule: { kind: 'fixed', month: 6, day: 23 },
        name: 'Midsummer Eve',
        why: 'Until the nineteenth century people carried burning straw cliars round Áine’s hill of Knockainy on St John’s Eve, a custom recorded in local folklore.',
        basis: 'later',
      },
    ],
    devotions: [
      'Light a candle in the window on a summer evening for her.',
      'Put fresh flowers in water and thank her for the season.',
      'Stand up for someone who has been wronged.',
      'Spend a few minutes in the evening light.',
    ],
    approach:
      'Áine is approached with warmth, as the summer goddess and fairy queen of Knockainy, known through tale and folklore.',
    sources: ['David Fitzgerald, “Popular Tales of Ireland”, Revue Celtique 4 (1879–80), on the cliars at Knockainy', 'Dáithí Ó hÓgáin, Myth, Legend and Romance (1990), s.v. Áine', HUTTON_STATIONS],
  },
  {
    key: 'aengus',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'samhain_gaelic' },
        name: 'Samhain',
        why: 'In The Dream of Aengus, Caer Ibormeith takes swan form every other Samhain, and it is then that Aengus finds her and flies away with her.',
        basis: 'later',
      },
    ],
    devotions: [
      'Write down a dream or a longing.',
      'Play or listen to a love song for him.',
      'Help two people who should meet to find each other.',
      'Tell someone what they mean to you.',
    ],
    approach:
      'Aengus is approached with openness and tenderness, as the young god of love and dreams.',
    sources: ['Aislinge Óenguso (The Dream of Aengus), ed. Francis Shaw (1934)', 'Tochmarc Étaíne, on Aengus’ birth and the Brú'],
  },
  {
    key: 'boann',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'yule' },
        name: 'The winter solstice',
        why: 'At the winter solstice the rising sun enters Newgrange, the Brú na Bóinne in Boann’s valley. The monument’s alignment is Neolithic; honouring Boann then is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Pour clean water into a bowl and thank her for the water you use.',
      'Spend a few minutes by a river or stream.',
      'Eat a few hazelnuts and learn one new thing.',
      'Listen to a piece of music for sorrow, one for joy or one for sleep.',
    ],
    approach:
      'Boann is approached with respect for her daring, as the goddess of the Boyne and seeker of wisdom.',
    sources: ['The Metrical Dindshenchas, “Boand I and II”, ed. Edward Gwynn (1906–35)', 'Táin Bó Fraích, on Uaithne’s three strains'],
  },
  {
    key: 'ogma',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'lughnasadh' },
        name: 'Lughnasadh',
        why: 'Lugh’s festival. No day of Ogma is recorded; honouring Lugh’s champion beside him is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Write your name or a word in ogham.',
      'Learn one word of Irish.',
      'Speak plainly and truthfully in one hard conversation.',
      'Read a few pages of something difficult.',
    ],
    approach:
      'Ogma is approached through study and honest speech, as the champion and man of learning of the Tuatha Dé.',
    sources: [CMT, 'Auraicept na nÉces (The Scholars’ Primer), on Ogma and ogham', 'Lucian, Heracles 1–7, on Ogmios', MACNEILL],
  },
  {
    key: 'nuada',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'bealtaine' },
        name: 'Bealtaine',
        why: 'The Book of Invasions says the Tuatha Dé came to Ireland at Bealtaine. No day of Nuada himself is recorded; honouring their king then is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Do one thing to serve the people you are responsible for.',
      'Raise a cup to someone who leads well.',
      'Step aside for someone better suited to a task.',
      'Take one step in your own recovery from a loss.',
    ],
    approach:
      'Nuada is approached with respect for duty, as the king who lost and regained his arm and stepped aside for Lugh.',
    sources: [CMT, 'Lebor Gabála Érenn, on the coming of the Tuatha Dé', 'R. E. M. and T. V. Wheeler, Report on the Excavation of the Prehistoric, Roman and Post-Roman Site in Lydney Park (1932)'],
  },
  {
    key: 'cailleach',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'samhain_gaelic' },
        name: 'Samhain',
        why: 'In Scottish folklore the Cailleach rules winter from Samhain, striking the ground with frost from her staff.',
        basis: 'later',
      },
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'bealtaine' },
        name: 'Bealtaine',
        why: 'In Scottish folklore her rule ends at Bealtaine, when she casts away her staff or turns to stone.',
        basis: 'later',
      },
    ],
    devotions: [
      'Watch the weather for a few minutes and honour its power.',
      'Rest properly, as winter rests.',
      'Add a stone to a cairn or a pile on a walk.',
      'Listen to an older person’s story.',
    ],
    approach:
      'The Cailleach is approached with respect rather than sentiment, as the old woman of winter who shaped the land.',
    sources: ['Donald A. Mackenzie, Scottish Folk-Lore and Folk Life (1935)', 'Gearóid Ó Crualaoich, The Book of the Cailleach (2003)', 'The Lament of the Old Woman of Beare, ed. Donncha Ó hAodha (1989)', HUTTON_STATIONS],
  },

  {
    key: 'gwydion',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'lughnasadh' },
        name: 'Lughnasadh (Gŵyl Awst)',
        why: 'No day of Gwydion is recorded. Some modern devotees honour him at Lughnasadh beside his foster-son Lleu; this is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Tell a story aloud as well as you can.',
      'Read a page of the Mabinogi.',
      'Teach a young person something you know.',
      'Own up to the consequences of one of your plans.',
    ],
    approach:
      'Gwydion is approached with respect and open eyes, as the enchanter and storyteller of the Mabinogi.',
    sources: ['Math fab Mathonwy, the Fourth Branch of the Mabinogi, trans. Sioned Davies, The Mabinogion (2007)', MACNEILL],
  },
  {
    key: 'blodeuwedd',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'beltane' },
        name: 'Beltane',
        why: 'Many modern Pagans honour the flower-made woman at Beltane, when oak, broom and meadowsweet come into flower. This is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Sit with a few wild flowers at dusk.',
      'Listen for owls after dark.',
      'Name one choice that is truly yours.',
      'Be honest about something you want.',
    ],
    approach:
      'Blodeuwedd is approached honestly, without excusing or condemning her, as the flower woman who chose for herself and became an owl.',
    sources: ['Math fab Mathonwy, the Fourth Branch of the Mabinogi, trans. Sioned Davies, The Mabinogion (2007)', HUTTON_TRIUMPH],
  },
  {
    key: 'lleu',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'celtic', id: 'lughnasadh' },
        name: 'Lughnasadh (Gŵyl Awst)',
        why: 'The festival of the Irish Lugh, whose name matches Lleu’s. Keeping it for Lleu is a modern custom; the Mabinogi gives him no festival.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Practise a skill you are learning for ten minutes.',
      'Share a piece of bread with thanks for the harvest.',
      'Take one step in recovering from a hurt.',
      'Help someone gain a skill they were denied.',
    ],
    approach:
      'Lleu is approached with steadiness and hope, as the bright one of the skilful hand who came back from betrayal.',
    sources: ['Math fab Mathonwy, the Fourth Branch of the Mabinogi, trans. Sioned Davies, The Mabinogion (2007)', MACNEILL],
  },
  {
    key: 'bran',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'samhain' },
        name: 'Samhain',
        why: 'No day of Bran is recorded. Modern devotees often remember the king whose head feasted with his companions at Samhain, when the dead are honoured; this is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Help someone across a difficulty, as he became a bridge.',
      'Share a meal generously.',
      'Put out food for crows or other birds.',
      'Tell a happy story about someone you have lost.',
    ],
    approach:
      'Bran is approached with respect, as the giant king who served as a bridge and guarded Britain after death.',
    sources: ['Branwen ferch Llŷr, the Second Branch of the Mabinogi, trans. Sioned Davies, The Mabinogion (2007)', 'Rachel Bromwich (ed.), Trioedd Ynys Prydein: The Triads of the Island of Britain (4th edn, 2014), Triad 37'],
  },

  {
    key: 'taranis',
    sacred: [
      {
        rule: { kind: 'weekday', day: 4 },
        name: 'Thursday',
        why: 'Thursday was Jupiter’s day in the Roman week, and Taranis was often likened to Jupiter. Honouring him on Thursdays is a modern custom; no Gaulish calendar day of his is known.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Listen to the next storm from a safe place and greet him.',
      'Make a small wheel from twigs or card.',
      'Pour a little rain water back onto the earth.',
      'Use your strength today to protect someone.',
    ],
    approach:
      'Taranis is approached with awe and caution, honest that he is known from a few inscriptions and a hostile Roman poet.',
    sources: ['Lucan, Pharsalia 1.444–446, with the Berne scholia', 'Miranda Green, The Gods of the Celts (1986), on the wheel god', WEEKDAYS],
  },
  {
    key: 'sucellos',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'mabon' },
        name: 'The autumn equinox',
        why: 'The grape and grain harvest. No Gaulish festival of Sucellos is known; honouring him at harvest is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Pour a little wine or juice at a shared meal and thank him for enough.',
      'Give food to someone who needs it.',
      'Do one thing to keep your household safe.',
      'Take your dog, or a neighbour’s, for a walk in his name.',
    ],
    approach:
      'Sucellos is approached as a solid, generous elder, known from images rather than myths.',
    sources: ['Miranda Green, Dictionary of Celtic Myth and Legend (1992), s.v. Sucellus and Nantosuelta', 'The Sarrebourg relief (Musée de la Cour d’Or, Metz)'],
  },
  {
    key: 'belenus',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'beltane' },
        name: 'Beltane',
        why: 'Many modern Pagans honour Belenus at Beltane. The link between his name and the festival is doubted by most linguists, and no Gaulish festival day of his is known; this is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Drink a glass of clean water slowly in sunlight.',
      'Ask him for health for someone you love.',
      'Do one thing for your own health today.',
      'Give to a clean-water charity.',
    ],
    approach:
      'Belenus is approached with gratitude, as a widely honoured Celtic god of healing and light.',
    sources: ['Herodian 8.3, on Belenus at the siege of Aquileia', 'Ausonius, Commemoratio Professorum Burdigalensium 4 and 10', HUTTON_TRIUMPH],
  },
  {
    key: 'sulis',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'litha' },
        name: 'Midsummer',
        why: 'No festival day of Sulis is known. Some modern devotees honour her at midsummer, her name being probably related to words for the sun; this is a modern custom.',
        basis: 'modern',
      },
      {
        rule: { kind: 'fixed', month: 3, day: 19 },
        name: 'Quinquatrus',
        why: 'The Roman festival of Minerva, with whom Sulis was joined at Bath. Keeping it for Sulis Minerva is a modern choice.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Soak your hands or feet in warm water and thank her.',
      'Write down a wrong you have suffered and leave it with her.',
      'Deal fairly in one thing today.',
      'Give a coin to charity in her name.',
    ],
    approach:
      'Sulis is approached with honesty, as the goddess of the hot springs who sees the truth and heals.',
    sources: ['R. S. O. Tomlin, “The Curse Tablets”, in B. Cunliffe (ed.), The Temple of Sulis Minerva at Bath II (1988)', 'Solinus, Collectanea 22.10', OVID_FASTI + ' (3.809–848)'],
  },

  // ─── Slavic ───────────────────────────────────────────────────────────
  {
    key: 'perun',
    sacred: [
      {
        rule: { kind: 'fixed', month: 8, day: 2 },
        name: 'Ilya’s Day',
        why: 'St Elijah’s day (20 July Old Style, 2 August today) took on Perun’s thunder in East Slavic folk belief. Many Rodnovers keep it as Perun’s day.',
        basis: 'later',
      },
      {
        rule: { kind: 'weekday', day: 4 },
        name: 'Thursday',
        why: 'Slavic weekday names do not name gods; some Rodnovers honour Perun on Thursday by analogy with Thor and Jupiter. A modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer a little bread or kvass and ask for justice.',
      'Keep your word in one matter, and offer it to Perun.',
      'Go outside in a storm or wind, safely, and greet him.',
      'Lay an oak leaf on his shrine.',
    ],
    approach:
      'Perun is approached with kept oaths and justice, in inclusive Rodnover company, since some groups carry nationalist politics.',
    sources: [
      IVANITS,
      'Encyclopedia of Ukraine, “Saint Elijah”: https://www.encyclopediaofukraine.com/pages%5CS%5CA%5CSaintElijah.htm',
      RYAN,
    ],
  },
  {
    key: 'mokosh',
    sacred: [
      {
        rule: { kind: 'weekday', day: 5 },
        name: 'Friday',
        why: 'East Slavic women kept Friday under St Paraskeva Pyatnitsa, with no spinning or washing. Some scholars see Mokosh behind her, but this is contested.',
        basis: 'later',
      },
      {
        rule: { kind: 'fixed', month: 11, day: 10 },
        name: 'Paraskeva Pyatnitsa',
        why: 'The feast of St Paraskeva (28 October Old Style, 10 November today), patron of spinners and women. Rodnovers often honour Mokosh on this day; the link is debated.',
        basis: 'later',
      },
    ],
    devotions: [
      'Spin, knit, sew or weave a few rows for her.',
      'Pour a little water onto earth and thank her for what grows.',
      'Offer a piece of bread or a strand of wool.',
      'Rest from one chore on Friday, as the old custom kept.',
    ],
    approach:
      'Mokosh is approached through spinning, earth and water, honest that much of her picture is reconstructed and learning from Slavic communities.',
    sources: [IVANITS, 'Wikipedia, “Paraskeva Friday”, for an overview of the debate: https://en.wikipedia.org/wiki/Paraskeva_Friday'],
  },
  {
    key: 'veles',
    sacred: [
      {
        rule: { kind: 'fixed', month: 2, day: 24 },
        name: 'Vlasii’s Day',
        why: 'St Vlasii (Blaise), protector of cattle, has his feast on 11 February Old Style, 24 February today. Folk belief gave him some of Veles’s care for herds, and Rodnovers keep it as Veles’s day.',
        basis: 'later',
      },
      {
        rule: { kind: 'holiday', tradition: 'slavic', id: 'dziady' },
        name: 'Dziady',
        why: 'Many Rodnovers honour Veles, lord of the underworld, alongside the ancestors at Dziady. A modern association.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer a little milk, honey or bread.',
      'Do something kind for an animal.',
      'Tell or read a story aloud.',
      'Remember your ancestors by name.',
    ],
    approach:
      'Veles is approached with milk, stories and care for animals and the dead, honest about how much of his mythology is reconstruction.',
    sources: [IVANITS, 'Wikipedia, “Festival of Veles”: https://en.wikipedia.org/wiki/Festival_of_Veles'],
  },
  {
    key: 'lada',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'slavic', id: 'kupala' },
        name: 'Kupala Night',
        why: 'The word “lado” appears in refrains of Kupala and spring songs, and many Rodnovers honour Lada then. Her ancient origins are debated, so this is modern.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'slavic', id: 'marzanna' },
        name: 'Welcoming spring',
        why: 'Rodnovers often greet Lada as spring returns, when Marzanna is sent away. A modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Offer flowers or weave a small wreath.',
      'Sing a song, or listen to one, with love.',
      'Do one thing to bring peace to your home.',
      'Offer a little honey or bread with thanks for someone you love.',
    ],
    approach:
      'Lada is approached with flowers and song as a goddess of love and spring, honest that her ancient existence is debated.',
    sources: [RYAN, 'Wikipedia, “Slavic Native Faith’s calendars and holidays”: https://en.wikipedia.org/wiki/Slavic_Native_Faith%27s_calendars_and_holidays'],
  },
  {
    key: 'dazhbog',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'slavic', id: 'kupala' },
        name: 'Kupala Night',
        why: 'Many Rodnovers honour the sun god at midsummer. Little is known of his ancient worship, so this is modern.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'slavic', id: 'koliada' },
        name: 'Koliada',
        why: 'Some Rodnovers greet the reborn sun at the winter solstice. A modern reconstruction.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Greet the sun in the morning with thanks.',
      'Offer a little bread or honey.',
      'Give something away freely, as he is the giving god.',
      'Remember your ancestors, his grandchildren in the Igor Tale.',
    ],
    approach:
      'Dažbog is approached with gratitude and generosity as the giving sun, honest about how little is known of him from ancient times.',
    sources: ['The Primary Chronicle, s.a. 980, on Vladimir’s idols; The Tale of Igor’s Campaign', RYAN],
  },
  {
    key: 'morana',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'slavic', id: 'marzanna' },
        name: 'Drowning of Marzanna',
        why: 'An effigy of winter is drowned or burned in spring, a folk custom first recorded in the 15th century and still kept.',
        basis: 'later',
      },
    ],
    devotions: [
      'Write down one thing you are ready to let go of, and tear it up.',
      'Light a candle for the turning seasons.',
      'Pour a little water outside and thank winter for its rest.',
      'Visit a grave, or remember someone you have lost.',
    ],
    approach:
      'Morana is approached at endings and the turn of the seasons through living folk custom, never as a substitute for support in grief.',
    sources: [DLUGOSZ_MARZANNA, RYAN],
  },

  {
    key: 'svarog',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'slavic', id: 'koliada' },
        name: 'Koliada',
        why: 'The winter solstice feast, when many Rodnovers honour the heavenly smith and his son the sun. This is modern Rodnover custom; no medieval source gives Svarog a day.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Light a candle safely and make or mend something by hand.',
      'Offer a piece of bread and honey at the hearth or stove.',
      'Deal fairly in one thing today.',
      'Check that your home’s fires and stoves are safe.',
    ],
    approach:
      'Svarog is approached with respect for fire and good work, honest that he is named in a single medieval gloss.',
    sources: ['The Hypatian Chronicle, s.a. 1114, gloss on John Malalas', 'Thietmar of Merseburg, Chronicon 6.23, on Svarozhich at Rethra', RYAN],
  },
  {
    key: 'stribog',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'slavic', id: 'marzanna' },
        name: 'The Drowning of Marzanna',
        why: 'The spring rite that sends winter away, when the winds turn. Honouring Stribog then is a modern Rodnover custom; his sources give him no day.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Stand in the wind for a minute and breathe deeply.',
      'Scatter a few crumbs or seeds for the birds.',
      'Open a window and let fresh air through your home.',
      'Share something good with someone far away.',
    ],
    approach:
      'Stribog is approached with openness to change, honest that he is known from only two medieval lines.',
    sources: ['The Primary Chronicle, s.a. 980', 'The Tale of Igor’s Campaign', IVANITS],
  },
  {
    key: 'jarilo',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'slavic', id: 'kupala' },
        name: 'Kupala Night',
        why: 'Folk Yarilo festivals were held in late spring and early summer, near Kupala and St Peter’s Day, ending with the burial of a straw Yarilo, as recorded in the eighteenth and nineteenth centuries.',
        basis: 'later',
      },
    ],
    devotions: [
      'Put flowers in a jar or your hair and enjoy the season.',
      'Dance or move for a few minutes in the sun.',
      'Plant a seed or water something growing.',
      'Let go of something whose season has ended.',
    ],
    approach:
      'Jarilo is approached with joy and energy, as the spirit of spring heat known from folk festivals.',
    sources: [IVANITS, 'Vladimir Propp, Russian Agrarian Festivals (1963; trans. 1993)', RYAN],
  },
  {
    key: 'zorya',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'ostara' },
        name: 'The spring equinox',
        why: 'The year’s dawn. Honouring Zorya then is a modern custom; in folklore she is greeted at every daybreak and dusk.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Look towards the horizon at dawn or dusk and greet her.',
      'Leave a cup of water out overnight and pour it out at sunrise.',
      'Begin one thing well today.',
      'End the day by letting go of one worry.',
    ],
    approach:
      'Zorya is approached gently, as the dawn of East Slavic folk charms.',
    sources: ['Alexander Afanasyev, Poeticheskie vozzreniya slavyan na prirodu (1865–69)', RYAN],
  },
  {
    key: 'rod',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'slavic', id: 'dziady' },
        name: 'Dziady',
        why: 'The autumn feast of the ancestors. Honouring Rod then is a modern Rodnover custom; the medieval sermons that mention the meal for Rod and the Rozhanitsy do not give it a pagan date.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Say the names of your ancestors as far back as you know them.',
      'Set out a little bread and honey at a family meal.',
      'Write down one story from your family’s past.',
      'Welcome a new child, or their parents, with a small gift.',
    ],
    approach:
      'Rod is approached with gratitude for kin, honest that the medieval evidence is slight and that kinship can be chosen as well as born.',
    sources: ['The Sermon of a Certain Christ-Lover (Slovo nekoego khristolyubtsa), on offerings to Rod and the Rozhanitsy', IVANITS, RYAN],
  },

  // ─── Hindu ────────────────────────────────────────────────────────────
  {
    key: 'ganesha',
    sacred: [
      {
        rule: { kind: 'weekday', day: 2 },
        name: 'Tuesday',
        why: 'Many Hindus visit Ganesha’s temples on Tuesdays, and a Sankashti Chaturthi falling on a Tuesday (Angaraki) is especially sacred. His great festival, Ganesh Chaturthi, follows the Hindu lunar calendar in August or September.',
        basis: 'later',
      },
    ],
    devotions: [
      'Say his name before starting anything new, as Hindus traditionally do.',
      'Offer a flower, a piece of fruit or a sweet with respect.',
      'Name one obstacle and ask for the wisdom to meet it.',
      'Learn one thing about how Hindu communities near you honour him.',
    ],
    approach:
      'Ganesha belongs to a living religion, so he is approached as a guest would, learning from Hindu temples, teachers and customs.',
    sources: [
      'Wikipedia, “Sankashti Chaturthi”: https://en.wikipedia.org/wiki/Sankashti_Chaturthi',
      'Hindu Blog, “Important days in week and month”: https://www.hindu-blog.com/2008/08/important-days-in-week-and-month.html',
      HINDU_LIVING,
    ],
  },
  {
    key: 'durga',
    sacred: [
      {
        rule: { kind: 'weekday', day: 2 },
        name: 'Tuesday',
        why: 'Tuesday is widely kept for Durga (and Hanuman) in Hindu practice. Her great festivals, Navaratri and Durga Puja, follow the Hindu lunar calendar in September or October.',
        basis: 'later',
      },
      {
        rule: { kind: 'weekday', day: 5 },
        name: 'Friday',
        why: 'Friday is kept for the Goddess, including Durga, by many Hindus, often with a fast.',
        basis: 'later',
      },
    ],
    devotions: [
      'Offer a flower or a piece of fruit with respect, and ask for courage.',
      'Light a lamp and sit quietly for a few minutes.',
      'Stand up against one wrong, however small.',
      'Learn how Hindu communities near you keep Navaratri.',
    ],
    approach:
      'Durga belongs to a living religion, so she is approached with humility and care, ideally learning from a Hindu teacher or temple.',
    sources: [
      'Hindu Blog, “Each day of the week dedicated to”: https://www.hindu-blog.com/2008/04/each-day-of-week-dedicated-to.html',
      'David Kinsley, Hindu Goddesses (1986)',
      HINDU_LIVING,
    ],
  },

  {
    key: 'lakshmi',
    sacred: [
      {
        rule: { kind: 'weekday', day: 5 },
        name: 'Friday',
        why: 'Friday is widely kept for Lakshmi and the Goddess in Hindu practice. Her great night, Lakshmi Puja at Diwali, follows the Hindu lunar calendar in October or November.',
        basis: 'later',
      },
    ],
    devotions: [
      'Clean one part of your home with care, as Hindus do to welcome her.',
      'Light a small lamp at dusk with respect.',
      'Give something to someone in need.',
      'Learn how Hindu communities near you keep Diwali.',
    ],
    approach:
      'Lakshmi belongs to a living religion, so she is approached with cleanliness, gratitude and generosity, learning from Hindu temples, teachers and families.',
    sources: [
      'Hindu Blog, “Each day of the week dedicated to”: https://www.hindu-blog.com/2008/04/each-day-of-week-dedicated-to.html',
      'David Kinsley, Hindu Goddesses (1986)',
      HINDU_LIVING,
    ],
  },
  {
    key: 'shiva',
    sacred: [
      {
        rule: { kind: 'weekday', day: 1 },
        name: 'Monday',
        why: 'Monday (Somvar) is kept for Shiva by many Hindus, often with a fast, especially in the month of Shravan. Maha Shivaratri and the monthly Shivaratri and Pradosh follow the Hindu lunar calendar.',
        basis: 'later',
      },
    ],
    devotions: [
      'Pour a little clean water with respect and sit quietly for a few minutes.',
      'Sit in stillness for five minutes, as a small meditation.',
      'Let go of one grudge or attachment.',
      'Learn how Hindu communities near you keep Maha Shivaratri.',
    ],
    approach:
      'Shiva belongs to a living religion, so he is approached with simplicity and sincerity, learning from Hindu temples, teachers and customs.',
    sources: [
      'Hindu Blog, “Each day of the week dedicated to”: https://www.hindu-blog.com/2008/04/each-day-of-week-dedicated-to.html',
      'Gavin Flood, An Introduction to Hinduism (1996), ch. 7',
      HINDU_LIVING,
    ],
  },
  {
    key: 'saraswati',
    sacred: [
      {
        rule: { kind: 'weekday', day: 4 },
        name: 'Thursday',
        why: 'Some devotees, especially students, honour Saraswati on Thursday (Guruvar), the day of the teacher. Her great day, Vasant Panchami, follows the Hindu lunar calendar in January or February.',
        basis: 'later',
      },
    ],
    devotions: [
      'Study or practise your art with full attention for a while, as an offering.',
      'Put your books, pens or instrument in order with care.',
      'Thank a teacher, past or present.',
      'Learn how Hindu communities near you keep Vasant Panchami.',
    ],
    approach:
      'Saraswati belongs to a living religion, so she is approached with humility and real effort, learning from Hindu temples, teachers and families.',
    sources: ['David Kinsley, Hindu Goddesses (1986)', HINDU_LIVING],
  },
  {
    key: 'kali',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'dark' },
        name: 'The new moon (Amavasya)',
        why: 'Kali is worshipped on new-moon nights, and Kali Puja falls on the new moon of Diwali in Bengal and eastern India.',
        basis: 'later',
      },
      {
        rule: { kind: 'weekday', day: 2 },
        name: 'Tuesday',
        why: 'Tuesday is kept for the fierce forms of the Goddess, including Kali, by many Hindus.',
        basis: 'later',
      },
    ],
    devotions: [
      'Offer a red flower with respect and ask for courage.',
      'Light a lamp and sit with one fear you would like to be free of.',
      'Let go of one bit of pride.',
      'Listen to a Shyama Sangeet song, or learn how Hindu communities near you keep Kali Puja.',
    ],
    approach:
      'Kali belongs to a living religion, so she is approached as devotees know her, as the loving Divine Mother, learning from Hindu and Shakta teachers and temples.',
    sources: [
      'David Kinsley, Hindu Goddesses (1986), ch. 8',
      'Rachel Fell McDermott, Mother of My Heart, Daughter of My Dreams (2001)',
      HINDU_LIVING,
    ],
  },
  {
    key: 'krishna',
    sacred: [
      {
        rule: { kind: 'weekday', day: 3 },
        name: 'Wednesday',
        why: 'In parts of India Wednesday is kept for Krishna, as Vitthal in Maharashtra. His birth festival, Janmashtami, and the Ekadashi fasts follow the Hindu lunar calendar.',
        basis: 'later',
      },
    ],
    devotions: [
      'Read a few verses of the Bhagavad Gita in a respected translation.',
      'Listen to or sing a bhajan.',
      'Do one task well without worrying about the reward.',
      'Learn how Hindu communities near you keep Janmashtami.',
    ],
    approach:
      'Krishna belongs to a living religion, so he is approached with love and respect, learning from Vaishnava temples, teachers and families.',
    sources: [
      'Hindu Blog, “Each day of the week dedicated to”: https://www.hindu-blog.com/2008/04/each-day-of-week-dedicated-to.html',
      'Edwin F. Bryant (ed.), Krishna: A Sourcebook (2007)',
      HINDU_LIVING,
    ],
  },

  {
    key: 'vishnu',
    sacred: [
      {
        rule: { kind: 'weekday', day: 4 },
        name: 'Thursday',
        why: 'Thursday is widely kept for Vishnu in North Indian homes, with a fast or puja. His great days, the Ekadashis of each fortnight, follow the Hindu lunar calendar and appear in the app’s Hindu calendar.',
        basis: 'later',
      },
    ],
    devotions: [
      'Offer a tulsi leaf or a flower with a short prayer.',
      'Light a small lamp with respect.',
      'Read about one of his avatars from a Hindu source.',
      'Do one thing to protect someone or keep the peace.',
    ],
    approach:
      'Vishnu belongs to a living religion, so he is approached with devotion and cleanliness, learning from Hindu temples, teachers and families.',
    sources: ['Edwin F. Bryant (trans.), Krishna: The Beautiful Legend of God (Bhagavata Purana Book X) (2003)', HINDU_LIVING],
  },
  {
    key: 'parvati',
    sacred: [
      {
        rule: { kind: 'weekday', day: 1 },
        name: 'Monday',
        why: 'Monday is kept for Shiva and Parvati together, and many women keep Monday fasts for them. Her own festivals, Teej and the Gauri festivals, follow the Hindu lunar calendar.',
        basis: 'later',
      },
    ],
    devotions: [
      'Offer a red flower with a prayer for your family.',
      'Light a small lamp with respect.',
      'Keep at one hard, good thing a little longer today.',
      'Learn how Hindu communities near you keep Teej or Navaratri.',
    ],
    approach:
      'Parvati belongs to a living religion, so she is approached with devotion and sincerity, learning from Hindu temples, teachers and families.',
    sources: ['David Kinsley, Hindu Goddesses (1986), ch. on Parvati', HINDU_LIVING],
  },
  {
    key: 'hanuman',
    sacred: [
      {
        rule: { kind: 'weekday', day: 2 },
        name: 'Tuesday',
        why: 'Tuesday is Hanuman’s day across much of India, when devotees visit his temples and recite the Hanuman Chalisa.',
        basis: 'later',
      },
      {
        rule: { kind: 'weekday', day: 6 },
        name: 'Saturday',
        why: 'Saturday is also kept for Hanuman, who is said to protect devotees from the troubles of Shani (Saturn).',
        basis: 'later',
      },
    ],
    devotions: [
      'Listen to the Hanuman Chalisa with a translation.',
      'Do one act of service without wanting thanks.',
      'Face one fear with courage.',
      'Offer a banana or a flower with respect.',
    ],
    approach:
      'Hanuman belongs to a living religion, so he is approached with humility and sincerity, learning from Hindu temples, teachers and families.',
    sources: ['Philip Lutgendorf, Hanuman’s Tale: The Messages of a Divine Monkey (2007)', HINDU_LIVING],
  },
  {
    key: 'rama',
    sacred: [
      {
        rule: { kind: 'weekday', day: 2 },
        name: 'Tuesday, with Hanuman',
        why: 'Rama has no weekday of his own in most traditions; many devotees remember him on Tuesdays and Saturdays in the worship of Hanuman, his greatest devotee. His birthday, Rama Navami, falls on the ninth of the bright half of Chaitra (March or April) by the Hindu lunar calendar.',
        basis: 'later',
      },
    ],
    devotions: [
      'Say or write the name “Ram” a few times with attention.',
      'Read a passage of the Ramayana.',
      'Keep your word in one thing today, however small.',
      'Light a small lamp with respect.',
    ],
    approach:
      'Rama belongs to a living religion, so he is approached with devotion and sincerity, learning from Hindu temples, teachers and families.',
    sources: ['Robert P. Goldman et al. (trans.), The Rāmāyaṇa of Vālmīki (Princeton, 1984–2017)', 'Philip Lutgendorf, The Life of a Text: Performing the Rāmcaritmānas of Tulsidas (1991)', HINDU_LIVING],
  },
  {
    key: 'brahma',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'full' },
        name: 'Purnima, the full moon',
        why: 'Brahma’s great day is Kartik Purnima, the full moon of Kartika (October or November), when pilgrims bathe in the lake at Pushkar. The full moon is marked here each month as a reminder; it is a day of vows in many Hindu homes.',
        basis: 'later',
      },
    ],
    devotions: [
      'Read or study something worthwhile for a few minutes.',
      'Begin one new thing with care.',
      'Offer a flower with a short prayer.',
      'Learn about the Pushkar fair from Hindu sources.',
    ],
    approach:
      'Brahma belongs to a living religion, so he is approached with reverence and love of learning, following Hindu temples, teachers and families.',
    sources: ['Wendy Doniger O’Flaherty (trans.), Hindu Myths (1975)', HINDU_LIVING],
  },
  {
    key: 'surya',
    sacred: [
      {
        rule: { kind: 'weekday', day: 0 },
        name: 'Sunday (Ravivar)',
        why: 'Sunday, Ravivar, is the Sun’s day in the Hindu week, kept by many with a fast or arghya for Surya.',
        basis: 'later',
      },
      {
        rule: { kind: 'fixed', month: 1, day: 14 },
        name: 'Makar Sankranti',
        why: 'The day the sun enters sidereal Capricorn, usually 14 or 15 January, kept across India with holy dips, kites, sesame sweets and, in Tamil Nadu, Pongal. Confirm the day with a local panchang.',
        basis: 'later',
      },
    ],
    devotions: [
      'Pour a little water toward the rising sun with folded hands.',
      'Get up a little earlier and greet the day.',
      'Spend a few minutes in morning light.',
      'Learn how Hindu communities near you keep Chhath or Sankranti.',
    ],
    approach:
      'Surya belongs to a living religion, so he is approached with gratitude and discipline, learning from Hindu temples, teachers and families.',
    sources: ['Rig Veda 1.50 and 1.115, hymns to Surya', HINDU_LIVING],
  },

  // ─── Wiccan ──────────────────────────────────────────────────────────────
  {
    key: 'wiccan_goddess',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'full' },
        name: 'The full-moon esbat',
        why: 'Wiccans honour the Goddess at the esbats, above all at the full moon, a practice set down in Gardnerian Wicca in the 1950s and drawing on Leland’s Aradia.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Read a few lines of the Charge of the Goddess.',
      'Look for the moon tonight and greet her.',
      'Do one kind thing for a woman of another generation.',
      'Take a few minutes to enjoy something beautiful, as an act of worship.',
    ],
    approach:
      'The Goddess is approached with love and with honesty about her modern origins in Gardner’s Wicca and Graves’s triple goddess.',
    sources: [HUTTON_TRIUMPH, 'Doreen Valiente, The Charge of the Goddess (1950s; in The Charge of the Goddess, 2000)', 'Robert Graves, The White Goddess (1948)'],
  },
  {
    key: 'horned_god',
    sacred: [
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'yule' },
        name: 'Yule',
        why: 'In the Wiccan Wheel of the Year the God is reborn with the sun at the winter solstice. This is modern Wiccan theology.',
        basis: 'modern',
      },
      {
        rule: { kind: 'holiday', tradition: 'wheel', id: 'samhain' },
        name: 'Samhain',
        why: 'At Samhain Wiccans honour the God as lord of death and the underworld, before his rebirth at Yule. This is modern Wiccan theology.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Walk somewhere wild or green and give thanks.',
      'Leave a piece of bread in a wild place where it will not harm animals.',
      'Do one thing for wildlife or woodland.',
      'Light a gold candle and name what you are ready to let die back.',
    ],
    approach:
      'The Horned God is approached with respect for the wild, honest that his modern form was shaped in the twentieth century.',
    sources: [HUTTON_TRIUMPH, 'Janet and Stewart Farrar, Eight Sabbats for Witches (1981)', HUTTON_STATIONS],
  },
  {
    key: 'aradia',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'full' },
        name: 'The full moon',
        why: 'In Leland’s Aradia she tells her followers to gather once a month, “and better it be when the moon is full”.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Read a page of Leland’s Aradia at the full moon.',
      'Do one thing for someone treated unjustly.',
      'Bake or share a small cake with salt and honey.',
      'Share something you know with someone who has been kept from learning it.',
    ],
    approach:
      'Aradia is approached with honesty about her uncertain origins, as Leland’s liberator of the oppressed.',
    sources: ['Charles Godfrey Leland, Aradia, or the Gospel of the Witches (1899), ch. 1', HUTTON_TRIUMPH, 'Sabina Magliocco, “Who Was Aradia? The History and Development of a Legend”, The Pomegranate 18 (2002)'],
  },

  // ─── Jewish folklore and Western occultism ───────────────────────────
  {
    key: 'lilith',
    sacred: [
      {
        rule: { kind: 'moon', phase: 'dark' },
        name: 'The dark moon',
        why: 'In Jewish tradition Lilith was a demon to be guarded against, not worshipped. Honouring her at the dark moon, linked to “Black Moon Lilith” in astrology, is a modern custom.',
        basis: 'modern',
      },
    ],
    devotions: [
      'Name one boundary you are keeping for yourself.',
      'Light a dark candle and sit with one feeling you usually push away.',
      'Write a few lines on what independence means to you.',
      'Read about her origins in Jewish texts before working with her.',
    ],
    approach:
      'Lilith comes from Jewish texts and folklore, where she is feared, so modern devotion to her is new and best begun by learning that context.',
    sources: [
      'The Alphabet of Ben Sira (c. 700–1000 CE); Isaiah 34:14',
      'Raphael Patai, The Hebrew Goddess (3rd edn, 1990), ch. 10',
    ],
  },
];
