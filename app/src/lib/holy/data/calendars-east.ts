// Holy-day pages for the eastern and reconstructed calendars (Kemetic,
// Hindu, Slavic Old Style feasts, Coligny) and the nine moon phases. One page
// per distinct event id that each calendar's eventsBetween can give, plus
// moon-<phase>. Living religions (Hindu festivals, Orthodox feasts) carry a
// `respect` note and devotional rather than magical suggestions; the
// Kemetic and Coligny pages say plainly what is reconstructed. Pure data.

import type { HolyPage } from '../types.ts';

export const CALENDAR_EAST_PAGES: HolyPage[] = [
  // ───────────────────────── KEMETIC ─────────────────────────
  {
    ref: 'kemetic-wep-ronpet',
    title: 'Wep Ronpet',
    aka: ['Wepet Renpet', 'Opening of the Year', 'Egyptian New Year', 'Kemetic New Year'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'The “opening of the year”, the first day of the Egyptian civil calendar, once hoped to fall with the rising of Sirius and the coming of the Nile flood. A day of cleansing, new beginnings and wishing one another a good year.',
    honours:
      'The year itself, renewed. Sopdet (Sirius), whose return to the dawn sky after seventy days of absence heralded the flood; Hapi, the flood’s abundance; Ra, newly born in the year’s first sunrise; and Osiris, whose death and return the rising water was felt to repeat. In temples the gods’ images were brought up to the roof to be touched by the first light of the new year.',
    history: `The Egyptian civil year had twelve months of thirty days and five extra days “upon the year”, 365 in all, with no leap day. Wep Ronpet was its first day, I Akhet 1. In an ideal year it coincided with the heliacal rising of Sirius, its first appearance before dawn in high summer, which in turn came just as the Nile began to rise. Because the civil calendar had no leap day, the two drifted apart by a day every four years and met again only after some fourteen centuries, so for most of Egyptian history the “opening of the year” and the star’s return were separate events, and both were marked.

At the great temples the New Year was a feast of renewal. At Dendera, in the Ptolemaic period, the image of Hathor was carried up to a roof chapel so that the sun’s first rays of the year could fall on it and recharge it: the “union with the sun disc”. Households exchanged good wishes, and from the later periods come small faience “New Year flasks”, inscribed with wishes for a good year and probably filled with Nile water or oil as gifts.

The days before New Year were dangerous ones, the time when Sekhmet’s messengers were feared to roam, and the year was only safe once it had opened. Today Kemetic groups keep Wep Ronpet by different anchors (the rising of Sirius where they live, the Coptic Nayrouz, or 1 August), and mark it with purification, offerings, a clean house and good wishes. The Coptic Church still keeps Nayrouz, the new year of the old calendar’s direct descendant, as a feast of its martyrs.`,
    knowAndDont: {
      known:
        'The calendar, the name wpt rnpt, its place on I Akhet 1, the link with Sirius in Egyptian thought, the Dendera roof rites and the inscribed New Year flasks are all well attested. So is the fear of the last days of the old year.',
      unknown:
        'Ordinary people’s New Year customs are poorly recorded, and practice changed over three thousand years. No ancient Egyptian kept a year fixed to Sirius as modern groups do, so any modern date for Wep Ronpet is a chosen anchor, not a recovered one.',
    },
    celebrate: [
      'Clean the house properly the day before, and wash yourself in fresh water on the morning itself.',
      'Watch the eastern sky before dawn in the days around the date: Sirius rising low in the twilight is the star the year once waited for.',
      'Greet the first sunrise with a lamp, a cup of fresh water and a little incense.',
      'Send short good wishes to friends: “a good opening of the year”.',
      'Write down what you mean to begin, and what you leave behind in the old year.',
    ],
    ritual: {
      title: 'Opening the year',
      outline: [
        'The evening before, sweep the house from back to front and put out what you mean to leave in the old year.',
        'Before dawn, wash your face and hands in fresh water, and dress in clean clothes, white if you have them.',
        'If the eastern horizon is clear, look for Sirius, the brightest star, low in the dawn twilight.',
        'At sunrise, light a lamp or candle (on a safe dish), set out fresh water and bread, and greet the new year aloud in your own words.',
        'Name one thing you will begin this year, and one person you will wish well today.',
        'Share the bread and water afterwards; give the remainder to the earth.',
      ],
    },
    correspondences: {
      deities: ['Ra', 'Isis', 'Osiris', 'Hathor', 'Thoth'],
      herbs: ['Frankincense', 'Myrrh'],
      crystals: ['Lapis Lazuli', 'Turquoise', 'Clear Quartz'],
      colors: ['White', 'Gold', 'Blue'],
      foods: ['Fresh bread', 'Figs', 'Honey', 'Fresh water'],
      symbols: ['Sirius (Sopdet)', 'The rising Nile', 'The sun on the horizon (akhet)'],
    },
    sources: [
      'R. A. Parker, The Calendars of Ancient Egypt (Chicago, 1950)',
      'S. Cauville, Dendara: Le temple d’Isis and the Dendera New Year roof chapel publications',
      'https://en.wikipedia.org/wiki/Egyptian_calendar',
      'https://www.worldhistory.org/article/1032/festivals-in-ancient-egypt/',
      'https://anefest.spbu.ru/en/articles/ancient-minor-asia/140-epagomenal-days-egypt.html',
      'https://en.wikipedia.org/wiki/Coptic_calendar',
    ],
  },
  {
    ref: 'kemetic-wag',
    title: 'Wag Festival',
    aka: ['Wagy', 'Wag feast', 'Festival of the dead'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'One of the oldest Egyptian festivals, a feast of the dead early in the new year, when families brought offerings to the tombs and lit lamps for their own.',
    honours:
      'The blessed dead (the akhu), and Osiris, lord of the dead, whose cult the festival came to belong to. It is a family festival above all: your own people, fed and remembered.',
    history: `The Wag appears in the Pyramid Texts of the Old Kingdom and in the lists of feasts carved in private tombs, where the owner asks for offerings “at the Wag festival” among the others. By the Middle Kingdom it was fixed on I Akhet 18, the eighteenth day of the first month, with an eve on the 17th; in some periods there was also a Wag kept by the moon. In the festival calendar of Ramesses III at Medinet Habu it sits beside the great feast of Thoth on the 19th.

Families visited the tombs with food and drink, lit lamps to drive the darkness away from the dead, and joined them in a meal. Tomb scenes and model boats show the dead making a journey by water to Abydos, Osiris’s holy city, to share in his festivals; on the Wag, some sources suggest, model boats were set facing the way to Abydos and turned back again the next day for the return.

Modern Kemetic groups keep the Wag as a day for the ancestors, often with offerings at a home shrine. Some make small boats of reed or paper and set them on water or face them west: a modern custom built on those ancient models, not an ancient one in itself.`,
    knowAndDont: {
      known: 'The festival’s great age, its date in the civil calendar (I Akhet 18), its link with the dead and with Osiris, and the offerings and lamps at the tombs.',
      unknown:
        'The details of the rites are thinly recorded; how the boat models were used is an interpretation, and the paper boats of modern practice are a modern invention. The relation between the civil and lunar Wag is still argued.',
    },
    celebrate: [
      'Set a small table for your own dead: a photograph or a name, a lamp, bread and water.',
      'Speak their names aloud: in Egyptian thought, the name spoken keeps a person alive.',
      'Visit and tidy a grave, or leave flowers at a place they loved.',
      'Make a little boat of folded paper, write a name on it and set it facing west on your shrine.',
      'Eat a meal in their company and tell one story about each.',
    ],
    ritual: {
      premade: 'hedge-ancestor-candle-evening',
      title: 'An evening with your dead',
    },
    correspondences: {
      deities: ['Osiris', 'Anubis', 'Isis'],
      herbs: ['Myrrh', 'Frankincense', 'Cedar'],
      crystals: ['Lapis Lazuli', 'Obsidian'],
      colors: ['White', 'Green', 'Black'],
      foods: ['Bread', 'Beer or barley water', 'Dates', 'Onions'],
      symbols: ['Lamps', 'Boats facing west', 'Offering tables'],
    },
    sources: [
      'https://anefest.spbu.ru/en/articles/ancient-minor-asia/164-wag-festival-egypt.html',
      'R. Krauss, “Wenn und aber: das Wag-Fest und die Chronologie des Alten Reiches”, Göttinger Miszellen 162 (1998)',
      'S. Schott, Altägyptische Festdaten (Mainz, 1950)',
      'https://www.worldhistory.org/article/1032/festivals-in-ancient-egypt/',
    ],
  },
  {
    ref: 'kemetic-thoth',
    title: 'Feast of Thoth',
    aka: ['Djehutyt', 'Festival of Thoth', 'Feast of Hermes (Plutarch)'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'The great festival of Thoth on the nineteenth day of his own month, the first of the year: a feast of the god of writing, reckoning and the moon, which Plutarch says was kept with honey, figs and the words “sweet is truth”.',
    honours:
      'Thoth (Djehuty), the ibis- and baboon-headed god of writing, knowledge, measure and the moon, scribe of the gods, who records the verdict at the weighing of the heart and who, in the myth Plutarch tells, won the five extra days of the year from the Moon.',
    history: `The first month of the Egyptian year bore Thoth’s name, and his principal feast fell on its 19th day, right after the Wag. The festival calendar of Ramesses III at Medinet Habu lists them together. At Hermopolis (Khemenu), Thoth’s city, and wherever there were scribes, he was honoured with offerings and processions.

Writing in the early second century CE, Plutarch records that on the nineteenth of the first month, at the feast of Hermes (the Greek name for Thoth), Egyptians ate honey and a fig and said “Sweet is truth” (On Isis and Osiris 68). Thoth was the lord of maat in speech, the right word rightly said, and the saying ties the feast to him neatly.

For modern Kemetics, it is the scribe’s feast: a day for gratitude for learning, for blessing pens, books and work, and for honest speech.`,
    knowAndDont: {
      known: 'The month name, the festival on I Akhet 19 in the New Kingdom calendars, Thoth’s roles, and Plutarch’s note on honey and figs.',
      unknown: 'Plutarch was a Greek writing late in Egyptian history; we cannot say how widely or how early the honey-and-figs custom was kept. The temple liturgy of the day is largely lost.',
    },
    celebrate: [
      'Eat honey and a fig, and say “sweet is truth” before you do.',
      'Clean your desk, sharpen your pencils, and bless the tools of your work or study.',
      'Write something by hand: a letter, a page of notes, a poem.',
      'Keep the day honest: speak plainly and kindly, and correct one thing you said wrongly.',
      'Learn something about the Egyptian scripts, or copy a hieroglyph or two.',
    ],
    ritual: { premade: 'folk-thoth-offering' },
    correspondences: {
      deities: ['Thoth', 'Isis'],
      herbs: ['Frankincense', 'Myrrh'],
      crystals: ['Lapis Lazuli', 'Sodalite', 'Clear Quartz'],
      colors: ['White', 'Blue', 'Silver'],
      foods: ['Honey', 'Figs'],
      symbols: ['The ibis', 'The baboon', 'The scribe’s palette', 'The crescent moon'],
    },
    sources: [
      'Plutarch, On Isis and Osiris 68 (Loeb, 1936, public domain): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/E.html',
      'S. Schott, Altägyptische Festdaten (Mainz, 1950); the Medinet Habu festival calendar',
      'P. Boylan, Thoth, the Hermes of Egypt (Oxford, 1922)',
      'https://en.wikipedia.org/wiki/Thoth',
    ],
  },
  {
    ref: 'kemetic-opet',
    title: 'Opet Festival',
    aka: ['Beautiful Feast of Opet', 'Heb nefer en Ipet'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'Thebes’s great festival of the flood season: Amun, Mut and Khonsu travelled in their sacred barques from Karnak to Luxor temple, and the king’s divine power was renewed.',
    honours:
      'Amun-Ra, king of the gods, with his consort Mut and their son Khonsu (the moon); and the royal ka, the divine life-force of kingship, renewed by Amun in the sanctuary at Luxor.',
    history: `In the second month of Akhet, while the Nile was high, the images of the Theban triad left Karnak in their portable barques, carried on the shoulders of priests, and travelled south to Luxor temple (Ipet-resyt, “the southern sanctuary”), by land along the avenue of sphinxes or by river on great boats. Crowds lined the way; oracles were given as the barque paused; bread, beer and cakes were handed out in vast quantities.

Inside Luxor temple, Amun met his own form there and the king entered the sanctuary to be renewed in his ka, emerging as the god’s chosen. The festival lasted eleven days under Thutmose III and over three weeks by Ramesses III. The reliefs of the colonnade at Luxor, carved under Tutankhamun and Horemheb, show the whole procession, with musicians, acrobats and offerings.

It was a royal and temple festival first, but also a public holiday: the one time many people came close to the hidden god. Modern Kemetic groups keep Opet with procession and feasting, often as a festival of renewal and community.`,
    knowAndDont: {
      known: 'The route, the barques, the duration in different reigns, and much of the festival’s outward form, from the Luxor colonnade reliefs and temple calendars.',
      unknown: 'What happened inside the sanctuary is not shown; the meaning of the king’s renewal is reconstructed from inscriptions. Ordinary people’s part beyond watching and feasting is little recorded.',
    },
    celebrate: [
      'Walk a route with purpose: a short procession around your home or garden, carrying a small image or candle.',
      'Share bread, beer or sweet cakes with friends: the festival was famous for its feasting.',
      'Ask one question you need guidance on, and sit with it (the barques gave oracles on the way).',
      'Look at photographs of the Luxor colonnade reliefs and trace the procession.',
      'Renew a commitment you made last year.',
    ],
    ritual: {
      title: 'A small procession',
      outline: [
        'Choose a small image, symbol or candle (an electric one is safest to carry) to stand for the god you honour.',
        'Set an offering table at the “southern” end of your route: bread, a cup of something to drink and flowers.',
        'Carry the image slowly from one room to the other, singing or playing music.',
        'Pause halfway and ask your question; notice what comes.',
        'At the table, set the image down, speak a renewal of your own commitments, and share the food.',
      ],
    },
    correspondences: {
      deities: ['Ra', 'Hathor'],
      herbs: ['Frankincense', 'Myrrh'],
      crystals: ['Lapis Lazuli', 'Carnelian'],
      colors: ['Gold', 'Blue'],
      foods: ['Bread', 'Beer', 'Cakes'],
      symbols: ['The barque', 'The avenue of sphinxes', 'The ka'],
    },
    sources: [
      'https://en.wikipedia.org/wiki/Opet_Festival',
      'L. Bell, “Luxor Temple and the Cult of the Royal Ka”, Journal of Near Eastern Studies 44 (1985)',
      'The Epigraphic Survey, Reliefs and Inscriptions at Luxor Temple I: The Festival Procession of Opet in the Colonnade Hall (Chicago, 1994)',
    ],
  },
  {
    ref: 'kemetic-khoiak',
    title: 'Mysteries of Osiris (Khoiak)',
    aka: ['Khoiak festival', 'Osiris Mysteries', 'Raising of the Djed'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'The great Osiris festival of the fourth month of the flood season: figures of the god were moulded of earth and grain and made to sprout, he was mourned and buried, and on the last day the djed pillar was raised.',
    honours:
      'Osiris, murdered by Set, gathered and mourned by Isis and Nephthys, and risen as lord of the dead and of the green life that returns each year. Also Sokar, the falcon god of the necropolis, whose feast fell within it, and the grain itself.',
    history: `As the floodwaters fell in Khoiak, the land reappeared ready for sowing, and the Egyptians kept the death and renewal of Osiris. The fullest account is a Ptolemaic text carved in the Osiris chapels on the roof of Dendera temple, which sets out the rites day by day: figures of Osiris moulded from earth, barley and water and kept moist until the grain sprouted; a figure of Sokar made of earth, dates and spices; the mourning of Isis and Nephthys; the processions and burials of the previous year’s figures.

Grain-sprouting “Osiris beds” and corn-mummies have been found in tombs, as far back as the New Kingdom, and the god was painted with a green face for the life he held. The festival of Sokar fell on IV Akhet 26, when his barque was drawn around the walls of Memphis, and on the 30th the djed pillar, Osiris’s backbone and the sign of stability, was raised with ropes by the king and priests. At Abydos, the Osiris mysteries were played out in public procession, recorded by the official Ikhernofret under Senusret III.

The god dies with the old year’s water and rises with the new grain: few festivals hold the agricultural year and the hope of the dead so closely together. Modern Kemetic practice keeps it as a season of mourning and renewal, often sprouting grain.`,
    knowAndDont: {
      known: 'The Dendera texts, the Abydos stela of Ikhernofret, grain beds and corn-mummies from tombs, the Sokar festival and the raising of the djed are well documented.',
      unknown:
        'The Dendera programme is late (Ptolemaic) and temple-based; earlier and local practice varied. What the mysteries enacted in secret was never fully written down. The dates here follow the late calendar.',
    },
    celebrate: [
      'Sprout barley or wheat on damp soil in a tray, in the shape of a figure if you can.',
      'Read or retell the myth of Osiris, Isis and Nephthys (Plutarch tells it in On Isis and Osiris).',
      'Keep a quiet day of mourning for someone lost this year.',
      'On the last day, stand something upright that has fallen: literally, or in your life.',
      'Plant a seed outdoors as the season allows.',
    ],
    ritual: {
      title: 'An Osiris bed of sprouting grain',
      outline: [
        'At the start of the festival, fill a shallow tray with damp soil or compost and shape a simple figure in it.',
        'Press barley, wheat or cress seed into the figure, saying who the god is and what you mourn this year.',
        'Keep it moist and in the light; each day, light a lamp beside it for a few minutes and speak a few words.',
        'When the grain is green, give thanks for life returning.',
        'On the last day, raise a small pillar or stick upright beside it, a djed of your own, and say what stands firm for you.',
        'Afterwards return the sprouted grain to the garden or compost.',
      ],
    },
    correspondences: {
      deities: ['Osiris', 'Isis', 'Anubis'],
      herbs: ['Myrrh', 'Cedar', 'Frankincense'],
      crystals: ['Malachite', 'Green Aventurine', 'Lapis Lazuli'],
      colors: ['Green', 'Black', 'White'],
      foods: ['Barley', 'Bread', 'Dates'],
      symbols: ['The djed pillar', 'Sprouting grain', 'The green face of Osiris'],
    },
    sources: [
      'S. Cauville, Le temple de Dendara: Les chapelles osiriennes (Cairo, 1997)',
      'É. Chassinat, Le mystère d’Osiris au mois de Khoiak (Cairo, 1966–68)',
      'Stela of Ikhernofret (Berlin 1204)',
      'Plutarch, On Isis and Osiris (Loeb, 1936, public domain): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/home.html',
      'https://en.wikipedia.org/wiki/Corn_mummy',
    ],
  },
  {
    ref: 'kemetic-valley',
    title: 'Beautiful Feast of the Valley',
    aka: ['Heb nefer en inet', 'Valley Festival'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'At the new moon of the second harvest month, Amun crossed the Nile from Karnak to visit the temples of the west bank at Thebes, and families feasted through the night with their dead at the tombs.',
    honours:
      'Amun of Karnak, Hathor of the western mountain, the royal dead in their mortuary temples, and every family’s own ancestors, visited and fed in their tombs.',
    history: `Each year at the new moon of II Shemu, Amun’s barque crossed the river to the west bank of Thebes, the land of the dead, and visited the mortuary temples of the kings and Hathor’s shrine at Deir el-Bahari. The festival is attested from the Middle Kingdom and flourished in the New Kingdom.

For the people of Thebes it was the night the living and the dead met. Families went up to the family tombs with food, drink, flowers and music, and spent the night there in a feast that tomb paintings show as joyful and sometimes drunken: drink was part of the communion with the goddess and with the dead. They brought back bouquets that had been offered to the god, carrying his blessing home. Many Theban tomb paintings of banquets are thought to show this feast.

Because it followed the moon, its date in the civil calendar moved; the date shown here is the new moon in II Shemu by modern reckoning, and so approximate.`,
    knowAndDont: {
      known: 'Its timing by the new moon, Amun’s crossing to the west bank, the family visits to the tombs, the bouquets, from inscriptions and tomb paintings.',
      unknown: 'How much of the banquet imagery shows this festival in particular is debated. The exact lunar day (the Egyptians began a month when the old crescent vanished) differs from a computed new moon.',
    },
    celebrate: [
      'Have a meal with your family and set a place for those who have died.',
      'Bring flowers to a grave, or make a bouquet and bring it home blessed from your shrine.',
      'Play the music your grandparents loved.',
      'Look through old photographs together and tell the stories.',
      'Stay up a little later than usual, in good company.',
    ],
    ritual: { premade: 'hedge-ancestor-candle-evening', title: 'A night feast with your dead' },
    correspondences: {
      deities: ['Hathor', 'Osiris', 'Anubis'],
      herbs: ['Rose', 'Myrrh', 'Jasmine'],
      crystals: ['Turquoise', 'Lapis Lazuli'],
      colors: ['Blue', 'Gold', 'Green'],
      foods: ['Bread', 'Beer or wine', 'Fruit', 'Honey cakes'],
      symbols: ['Bouquets', 'The western mountain', 'The banquet'],
    },
    sources: [
      'https://en.wikipedia.org/wiki/Beautiful_Festival_of_the_Valley',
      'S. Schott, Das schöne Fest vom Wüstentale (Wiesbaden, 1953)',
      'L. Bell, “The New Kingdom ‘Divine’ Temple: The Example of Luxor”, in B. Shafer (ed.), Temples of Ancient Egypt (1997)',
    ],
  },
  {
    ref: 'kemetic-falcon',
    title: 'Coronation of the Sacred Falcon',
    aka: ['Installation of the Living Falcon'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'On the first day of the season of Peret, the temple of Horus at Edfu chose a living falcon and crowned it as the god’s image for the coming year.',
    honours:
      'Horus of Behdet, the falcon god of Edfu, and through him the kingship: the king was Horus on earth, and the crowned falcon stood for both.',
    history: `The walls of the Ptolemaic temple of Horus at Edfu, built between 237 and 57 BCE, describe a festival at the start of the second season, Peret. A falcon was chosen from the birds raised at the temple, brought before the image of Horus, and crowned. It was then shown to the people from a window above the temple gateway, given offerings and installed as the god’s living image for a year, much as a king was crowned.

The rite joined three ideas: the falcon as Horus, Horus as king, and the new season as a renewal of order. Like the other animal cults of late Egypt, it had a harder side too: many falcons were mummified and buried as offerings by pilgrims.

The date shown here is I Peret 1 by the calendar you have chosen, and so a modern alignment.`,
    knowAndDont: {
      known: 'The festival, its date at the start of Peret, the choosing and crowning of the falcon and its appearance at the temple window, from the Edfu inscriptions.',
      unknown: 'How long the festival lasted and how it was staged in detail; whether similar rites were kept at other falcon temples; how far back before the Ptolemaic period it goes.',
    },
    celebrate: [
      'Greet Horus at sunrise with fresh water and bread.',
      'Draw a falcon or a wedjat eye and set it on your shrine for the coming year.',
      'Take up one responsibility you have been putting off, as a new season’s pledge.',
      'Watch for birds of prey, or give to a raptor rescue or conservation group.',
    ],
    ritual: {
      title: 'Crowning the year’s falcon',
      outline: [
        'Wash your hands and face, and set a shrine with water, bread, incense and an image of a falcon.',
        'Light the incense and greet Horus as the falcon far above.',
        'Lift the falcon image toward the light of a window and say what you will protect this year.',
        'Offer the water and bread, and sit a few minutes with the sky in view.',
        'Close, and eat or share the bread later.',
      ],
    },
    correspondences: {
      deities: ['Horus', 'Hathor', 'Ra'],
      herbs: ['Frankincense', 'Myrrh', 'Cedar'],
      crystals: ['Lapis Lazuli', 'Carnelian', 'Tiger Eye'],
      colors: ['Gold', 'White', 'Blue'],
      foods: ['Bread', 'Beer', 'Dates'],
      symbols: ['The falcon', 'The double crown', 'The window of appearances'],
    },
    sources: [
      'Barbara Watterson, The House of Horus at Edfu: Ritual in an Ancient Egyptian Temple (1998)',
      'H. W. Fairman, “Worship and Festivals in an Egyptian Temple”, Bulletin of the John Rylands Library 37 (1954)',
      'https://en.wikipedia.org/wiki/Temple_of_Edfu',
    ],
  },
  {
    ref: 'kemetic-beautiful-meeting',
    title: 'Beautiful Meeting of Horus and Hathor',
    aka: ['Feast of the Beautiful Meeting', 'Festival of the Beautiful Reunion'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'Each summer Hathor sailed upriver from Dendera to visit Horus at Edfu, arriving at the new moon of the third harvest month, for a fourteen-day festival of their marriage.',
    honours:
      'Hathor of Dendera and Horus of Edfu as wife and husband, their child, and the ancestral gods buried at Edfu’s sacred necropolis.',
    history: `The festival calendars on the walls of Edfu and Dendera describe the Beautiful Meeting. Hathor’s image left her temple at Dendera in her barque and travelled more than 150 kilometres up the Nile, stopping at towns along the way. Horus came out to meet her near Edfu at the new moon of III Shemu, and the two gods spent about fourteen days together.

The festival mixed a divine marriage with victory and renewal: processions between the temple and the sacred necropolis, offerings to the ancestral gods buried there, rites against the enemies of Horus, and great public feasting, with food and drink handed out to the people. At its end Hathor sailed home to Dendera.

Because it followed the moon, its date moved in the civil calendar; the days shown here begin at the computed new moon in III Shemu, and so are approximate.`,
    knowAndDont: {
      known: 'The journey from Dendera to Edfu, the timing by the new moon of III Shemu, the length of the stay, the visits to the necropolis and the public feasting, from the Edfu and Dendera inscriptions.',
      unknown: 'How old the festival is before the Ptolemaic temples that record it; how ordinary people along the river took part; the exact lunar day, which the Egyptians counted from the vanishing of the old crescent.',
    },
    celebrate: [
      'Share a festive meal with music, flowers and good company.',
      'Make an offering to Horus and Hathor together, side by side.',
      'Visit someone you love who lives at a distance, or plan to.',
      'Remember the old ones of your family, as the gods at Edfu remembered theirs.',
    ],
    ritual: {
      title: 'The meeting at the shrine',
      outline: [
        'Set images of Horus and Hathor apart on your shrine, with water, bread, flowers and incense.',
        'Light the incense and greet Hathor, then bring her image to stand beside Horus.',
        'Offer bread, drink and flowers to both, and play or sing something joyful.',
        'Share food with someone afterwards, as Edfu fed its people.',
        'Close, and keep the two images together for the days of the festival.',
      ],
    },
    correspondences: {
      deities: ['Horus', 'Hathor'],
      herbs: ['Rose', 'Myrrh', 'Frankincense'],
      crystals: ['Turquoise', 'Lapis Lazuli', 'Carnelian'],
      colors: ['Gold', 'Turquoise', 'Red'],
      foods: ['Bread', 'Beer or wine', 'Fruit', 'Honey cakes'],
      symbols: ['The sacred barque', 'The sistrum', 'The winged disc'],
    },
    sources: [
      'Barbara Watterson, The House of Horus at Edfu: Ritual in an Ancient Egyptian Temple (1998)',
      'Maurice Alliot, Le culte d’Horus à Edfou au temps des Ptolémées (Cairo, 1949–54)',
      'https://en.wikipedia.org/wiki/Temple_of_Edfu',
    ],
  },
  {
    ref: 'kemetic-birth-osiris',
    title: 'Birthday of Osiris',
    aka: ['First epagomenal day', 'Heriu renpet 1'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'The first of the five days “upon the year” at the close of the Egyptian calendar, the birthday of Osiris, lord of the dead and of the returning flood.',
    honours:
      'Osiris, first-born of Nut and Geb, the good king slain by Set and raised by Isis, ruler of the dead and the power in the flood and the green grain.',
    history: `The five days after the twelfth month belonged to no month: the Egyptians called them heriu renpet, “those upon the year”. Plutarch gives the myth: Ra had forbidden Nut, the sky, to give birth on any day of the year, so Thoth won five new days from the Moon at a board game and on them she bore her children, Osiris first. A voice was heard at his birth proclaiming the lord of all coming into the light.

The epagomenal days were a dangerous threshold between years, the time when Sekhmet’s messengers were feared to roam, and Middle Kingdom and later spells (Papyrus Leiden I 346) protected people through them: protective words were written on linen worn at the throat, and offerings were made to each of the gods born. In Ptolemaic reliefs at the Opet temple at Karnak Osiris’s birth is shown alongside his rising on his bed.

Modern Kemetics keep the five days as a series of birthdays and as a time of protection and preparation for the new year.`,
    knowAndDont: {
      known: 'The five days, their names, the births of the five gods (already in the Pyramid Texts), protective spells for these days and Plutarch’s myth.',
      unknown: 'The ancient observance of each birthday is thinly described; Plutarch’s tale is late and Hellenised. Modern dates depend on where you fix the new year.',
    },
    celebrate: [
      'Light a lamp and wish Osiris a good birthday with bread, water and incense.',
      'Begin the five days with a clean, quiet house, as the old year draws to a close.',
      'Tie a strip of clean linen or cotton with a protective word written on it around your wrist for the five days.',
      'Tend something green: water the garden, repot a plant.',
      'Remember your dead, whom Osiris rules.',
    ],
    ritual: {
      title: 'The first birthday upon the year',
      outline: [
        'Wash your hands and face, and set a small shrine with a lamp, water and bread.',
        'Write a short protective word or the five gods’ names on a strip of cloth and tie it on.',
        'Light the lamp and greet Osiris on his birthday in your own words.',
        'Offer the bread and water; sit for a few minutes with the year that is ending.',
        'Snuff the lamp, and share or return the offerings the next morning.',
      ],
    },
    correspondences: {
      deities: ['Osiris', 'Isis', 'Thoth'],
      herbs: ['Myrrh', 'Cedar'],
      crystals: ['Malachite', 'Lapis Lazuli'],
      colors: ['Green', 'White'],
      foods: ['Bread', 'Barley', 'Water'],
      symbols: ['The crook and flail', 'The djed pillar', 'Green grain'],
    },
    sources: [
      'Plutarch, On Isis and Osiris 12 (Loeb, 1936, public domain): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html',
      'https://anefest.spbu.ru/en/articles/ancient-minor-asia/140-epagomenal-days-egypt.html',
      'M. Bommas, Die Mythisierung der Zeit: Die beiden Bücher über die altägyptischen Schalttage des magischen pLeiden I 346 (Wiesbaden, 1999)',
    ],
  },
  {
    ref: 'kemetic-birth-horus',
    title: 'Birthday of Horus',
    aka: ['Second epagomenal day', 'Birthday of Heru-wer', 'Birthday of Horus the Elder'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'The second of the days “upon the year”, the birthday of Horus the Elder (Heru-wer, Haroeris), the great falcon of the sky.',
    honours:
      'Horus the Elder, the far-seeing falcon whose eyes are the sun and moon, a sky god and protector of kingship. He is distinct in the myth from Horus the Child, son of Isis, though the two were often merged.',
    history: `Plutarch lists the second day as the birth of Arueris (Haroeris, Horus the Elder), “whom they call Apollo, and some call him also the elder Horus”. Horus the Elder was worshipped at Kom Ombo, Qus and elsewhere, a great sky falcon older than the family drama of Osiris and Isis.

Like the other epagomenal days, it fell in the dangerous threshold time before the new year, and calendar lists give Horus there as “great of strength, lord of terror”. Modern Kemetics honour Horus as protector and as the power of the sky on this day.

See the Birthday of Osiris page for the five days as a whole.`,
    knowAndDont: {
      known: 'Horus the Elder’s birth on the second epagomenal day is in Plutarch and the Egyptian lists.',
      unknown: 'Little is recorded about how the day itself was kept.',
    },
    celebrate: [
      'Go outside and look up: watch birds, or the sky at dawn.',
      'Light a lamp for Horus as protector and ask for clear sight in the year to come.',
      'Draw or carry the Eye of Horus (wedjat) as a sign of protection and wholeness.',
      'Do one thing that needs courage.',
    ],
    ritual: {
      title: 'Clear sight',
      outline: [
        'At sunrise or noon, stand outside facing the sun (never look into it directly).',
        'Light a lamp or hold a gold or yellow cloth, and greet Horus on his birthday.',
        'Name what you need to see clearly in the coming year.',
        'Draw the wedjat eye on paper and keep it at your door or in your wallet.',
      ],
    },
    correspondences: {
      deities: ['Horus', 'Ra', 'Isis', 'Osiris'],
      herbs: ['Frankincense', 'Cinnamon'],
      crystals: ['Tiger Eye', 'Carnelian', 'Lapis Lazuli'],
      colors: ['Gold', 'Blue', 'Red'],
      foods: ['Bread', 'Dates'],
      symbols: ['The falcon', 'The wedjat eye', 'The winged sun disc'],
    },
    sources: [
      'Plutarch, On Isis and Osiris 12 (Loeb, 1936, public domain): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html',
      'https://anefest.spbu.ru/en/articles/ancient-minor-asia/140-epagomenal-days-egypt.html',
      'https://en.wikipedia.org/wiki/Horus',
    ],
  },
  {
    ref: 'kemetic-birth-set',
    title: 'Birthday of Set',
    aka: ['Third epagomenal day', 'Birthday of Seth', 'Birthday of Sutekh'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'The third of the days “upon the year”, the birthday of Set, god of storms, the desert and foreign lands. Ancient calendars counted it an unlucky day, best spent quietly.',
    honours:
      'Set, the red god of storm and desert, Osiris’s murderer in the myth and yet also the strong one who stands at the prow of Ra’s boat and spears the serpent Apep each night. A god of necessary chaos and raw strength.',
    history: `Plutarch says that on the third day Typhon (Set) was born “not in due season or manner”, and that the kings “considered the third of the intercalated days as inauspicious, and transacted no business on that day”. Egyptian lists of lucky and unlucky days likewise treat the days before the new year as perilous.

Set was not simply a devil in Egyptian religion. For long periods he was honoured as a great god, patron of the Ramesside kings (Seti I bears his name), lord of Upper Egypt, and the defender of Ra against Apep. His reputation darkened in the first millennium BCE, and late rites aimed to destroy him and his followers.

Modern Kemetic practice varies: some treat the day as a time to stay in and keep things calm; others honour Set’s strength in a measured way.`,
    knowAndDont: {
      known: 'His birth on the third epagomenal day, its unlucky character in calendars of lucky and unlucky days, and Set’s double reputation over time.',
      unknown: 'How ordinary people kept, or avoided keeping, this day is not well recorded.',
    },
    celebrate: [
      'Keep the day low-key: no new ventures, no big decisions, no picking fights.',
      'Tidy up a storm: deal with one chaotic corner of life calmly.',
      'If you honour Set, offer something strong and simple (beer, red-coloured food) with respect, at a distance from offerings to Osiris and Isis.',
      'Watch weather and wind with attention; walk in a wild place if it’s safe.',
    ],
    ritual: {
      title: 'A quiet day',
      outline: [
        'In the morning, decide on one thing you will not do today (a big purchase, an argument, a new start).',
        'Light a lamp briefly and acknowledge Set as part of the order of things, with no requests.',
        'Spend the day steadily: chores, rest, a walk.',
        'In the evening, write down what unsettled you and fold the paper away until after the new year.',
      ],
    },
    correspondences: {
      deities: ['Set', 'Ra', 'Osiris'],
      herbs: ['Black Pepper', 'Juniper'],
      crystals: ['Red Jasper', 'Hematite', 'Obsidian'],
      colors: ['Red', 'Black'],
      foods: ['Beer', 'Red lentils'],
      symbols: ['The Set animal', 'Storm and desert wind', 'The spear against Apep'],
    },
    sources: [
      'Plutarch, On Isis and Osiris 12 (Loeb, 1936, public domain): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html',
      'H. te Velde, Seth, God of Confusion (Leiden, 1967)',
      'https://en.wikipedia.org/wiki/Set_(deity)',
    ],
  },
  {
    ref: 'kemetic-birth-isis',
    title: 'Birthday of Isis',
    aka: ['Fourth epagomenal day', 'Birthday of Aset'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'The fourth of the days “upon the year”, the birthday of Isis, great of magic, sister-wife of Osiris and mother of Horus.',
    honours:
      'Isis (Aset), who gathered and restored Osiris, hid and raised the child Horus in the marshes, and by her cunning learned Ra’s secret name: the great goddess of magic, motherhood and loyal love, whose worship later spread across the Roman world.',
    history: `Plutarch says Isis was born “in the regions that are ever moist” on the fourth day. In Egypt the fourth and fifth epagomenal days carried a festival called “the chick in its nest”, tied to the young Horus and his mother. Isis was mourner, protector and magician, and spells against scorpion stings and illness invoked her care for her child.

Her cult outlived the Egyptian state itself: her temple at Philae was one of the last in Egypt to close, in the sixth century CE, and her mysteries were kept across the Roman empire.

Modern Kemetics, and many modern pagans who honour Isis, keep her birthday with devotion and celebration.`,
    knowAndDont: {
      known: 'Her birth on the fourth day in Plutarch and the Egyptian lists, and the wide evidence for her cult.',
      unknown: 'Specific customs for her birthday are not well recorded.',
    },
    celebrate: [
      'Set flowers and a lamp before an image of Isis, or a simple throne-shaped sign for her name.',
      'Care for someone who needs looking after, or for yourself.',
      'Read a hymn to Isis (the Philae hymns, or Apuleius’s prayer in The Golden Ass, Book 11).',
      'Make an offering of milk and honey.',
    ],
    ritual: {
      title: 'A birthday offering for Isis',
      outline: [
        'Wash your hands and set out a lamp, a cup of milk or water and flowers.',
        'Light the lamp and greet Isis on her birthday by her names: great of magic, lady of the throne.',
        'Offer the milk and flowers, and ask her protection for those you love through the turning of the year.',
        'Sit with the lamp a while, then snuff it and pour the offering out on earth.',
      ],
    },
    correspondences: {
      deities: ['Isis', 'Osiris', 'Hathor'],
      herbs: ['Myrrh', 'Rose', 'Jasmine'],
      crystals: ['Lapis Lazuli', 'Moonstone', 'Carnelian'],
      colors: ['Blue', 'White', 'Red'],
      foods: ['Milk', 'Honey', 'Bread'],
      symbols: ['The throne', 'The tyet knot', 'Wings'],
    },
    sources: [
      'Plutarch, On Isis and Osiris 12 (Loeb, 1936, public domain): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html',
      'https://anefest.spbu.ru/en/articles/ancient-minor-asia/140-epagomenal-days-egypt.html',
      'Apuleius, The Golden Ass, Book 11 (Adlington’s translation, 1566, public domain)',
      'https://en.wikipedia.org/wiki/Isis',
    ],
  },
  {
    ref: 'kemetic-birth-nephthys',
    title: 'Birthday of Nephthys',
    aka: ['Fifth epagomenal day', 'Birthday of Nebet-Het'],
    tradition: 'Kemetic (ancient Egyptian)',
    summary:
      'The fifth and last of the days “upon the year”, the birthday of Nephthys, lady of the house, mourner and protector of the dead, on the eve of the new year.',
    honours:
      'Nephthys (Nebet-Het, “lady of the house”), sister of Isis, who mourned and guarded Osiris beside her and protects the dead; often called the companion of the threshold and the edge of things.',
    history: `Plutarch names the fifth day as the birth of Nephthys, “to whom they give the name of Finality”, and also Aphrodite and Victory. With Isis she is one of the two kites who wail over Osiris’s body; the two sisters stand at the head and foot of coffins, protecting the dead.

As the last day before Wep Ronpet, it was the very edge of the old year, the end of the dangerous days. Modern Kemetics honour Nephthys and prepare the house for the opening of the year.`,
    knowAndDont: {
      known: 'Her birth on the fifth day (Plutarch and Egyptian lists) and her role as mourner and protector.',
      unknown: 'Nephthys has fewer temples and texts of her own than most great gods; her birthday customs are not recorded.',
    },
    celebrate: [
      'Prepare the house for the new year: a final tidy, fresh water, clean cloths.',
      'Honour grief: sit with a loss, or keep company with someone grieving.',
      'Light a lamp at dusk for Nephthys and for all who are at an ending.',
      'Write down what you will close with this year, and burn it safely or tear it up.',
    ],
    ritual: {
      title: 'At the edge of the year',
      outline: [
        'At dusk, set a lamp in a safe dish by your door.',
        'Greet Nephthys on her birthday, lady of the house, and ask her to guard your home through the night.',
        'Name what is ending, and thank it.',
        'Leave the lamp to burn while you are present, then snuff it; open the door at dawn to let in the new year.',
      ],
    },
    correspondences: {
      deities: ['Nephthys', 'Isis', 'Osiris', 'Anubis'],
      herbs: ['Myrrh', 'Cypress'],
      crystals: ['Obsidian', 'Jet', 'Smoky Quartz'],
      colors: ['Black', 'Silver', 'Purple'],
      foods: ['Bread', 'Water'],
      symbols: ['The kite', 'The house', 'Twilight'],
    },
    sources: [
      'Plutarch, On Isis and Osiris 12 (Loeb, 1936, public domain): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html',
      'https://en.wikipedia.org/wiki/Nephthys',
    ],
  },
  {
    ref: 'kemetic-epagomenal-6',
    title: 'Sixth Epagomenal Day',
    aka: ['Leap day upon the year'],
    tradition: 'Kemetic (modern practice)',
    summary:
      'An extra day before the new year, which the ancient civil calendar never had: it appears when the modern anchor for the new year moves a day later.',
    honours:
      'No god was born on this day in the myth. Many modern practitioners use it for the household, the ancestors, or simply rest before the new year opens.',
    history: `The ancient Egyptian civil year was always exactly 365 days. In 238 BCE the Canopus decree tried to add a sixth epagomenal day every four years, for the festival of the “Benefactor Gods” (Ptolemy III and Berenice), but it was not kept up. Augustus’s reform of the Alexandrian calendar later added a leap day in the same place, and the Coptic calendar still has it: a sixth day of the “little month” every fourth year.

Here a sixth day appears whenever the date chosen for Wep Ronpet moves a day later (a Coptic or Gregorian leap year, or Sirius rising a day later where you are). It has no ancient festival of its own.`,
    knowAndDont: {
      known: 'The Canopus decree and the Alexandrian (Coptic) leap day both put an extra day here.',
      unknown: 'There is no ancient custom for a day that ordinary years lacked; anything you do with it is your own.',
    },
    celebrate: [
      'Rest: take a day without obligations before the new year.',
      'Finish small tasks you want done before the year opens.',
      'Give thanks to all five gods born on the days before.',
    ],
    ritual: {
      title: 'A between-day',
      outline: [
        'Leave the day unscheduled as far as you can.',
        'Light a lamp for the household and the ancestors.',
        'Write a short list of what you carry into the new year.',
        'Go to bed early so you can rise for the new year’s dawn.',
      ],
    },
    correspondences: {
      deities: ['Thoth'],
      herbs: ['Frankincense'],
      crystals: ['Clear Quartz'],
      colors: ['White'],
      symbols: ['The threshold', 'The game of senet'],
    },
    sources: [
      'https://en.wikipedia.org/wiki/Canopus_Decree',
      'https://en.wikipedia.org/wiki/Coptic_calendar',
      'R. A. Parker, The Calendars of Ancient Egypt (Chicago, 1950)',
    ],
  },
  // ───────────────────────── HINDU ─────────────────────────
  {
    ref: 'hindu-ekadashi-shukla',
    title: 'Shukla Ekadashi',
    aka: ['Ekadashi', 'Bright-fortnight Ekadashi', 'Gyaras', 'Agyaras'],
    tradition: 'Hindu',
    summary:
      'The eleventh lunar day of the waxing fortnight, sacred to Vishnu: kept by many Hindus, especially Vaishnavas, with a fast from grains and beans, prayer, and an effort at a quiet, steady mind.',
    honours:
      'Vishnu, the preserver, and in many homes his forms as Krishna and Rama. The Puranas personify Ekadashi herself as a goddess who sprang from Vishnu to defeat the demon Mura, and was given the boon that whoever fasted on her day would be freed from sin.',
    history: `There are two Ekadashis a month, one in each fortnight, and each in the year has its own name and story: Nirjala Ekadashi in Jyeshtha, kept by some without even water; Devshayani (Ashadhi) Ekadashi, when Vishnu is said to lie down to sleep for the four months of the rains (chaturmas), and the great Pandharpur pilgrimage of the Varkaris in Maharashtra reaches Vithoba; Prabodhini (Devutthana) Ekadashi in Kartika, when he wakes; Vaikuntha Ekadashi in Margashirsha or Pausha, when the “gate of Vaikuntha” is opened in south Indian Vishnu temples such as Srirangam and Tirupati.

The fast is ancient and much praised in the Puranas, above all the Padma Purana. Practice ranges widely: a full fast, a single meal, or simply giving up grains, beans and certain vegetables while eating fruit, milk and nuts. The fast is broken on the next day (Dwadashi) within a time window the panchang gives, called parana. Vaishnava communities sometimes keep Ekadashi a day later than other calendars, when the tenth tithi touches the hours before dawn.

The day is also for prayer, the reading of the Bhagavad Gita or the Vishnu Sahasranama, visiting a temple and staying awake in kirtan, and for keeping the mind from quarrels and indulgence.`,
    knowAndDont: {
      known: 'Ekadashi is a living, well-documented observance, with its rules set out in the Puranas and in the panchangs and sect manuals used today.',
      unknown:
        'Rules differ by family, region and sampradaya (e.g. which foods, which day when the tithi is split). The dates here are computed; confirm with your temple or a panchang for your place.',
    },
    celebrate: [
      'If you are Hindu, follow your family or sampradaya’s rule for the fast, and break it at the parana time on Dwadashi.',
      'If you are learning, a simple respectful step is to eat plainly, skip grains and beans for the day, and read a chapter of the Bhagavad Gita.',
      'Visit a Vishnu or Krishna temple, or attend an evening kirtan; many welcome visitors.',
      'Keep the day gentle: fewer screens, no arguments, kindness in speech.',
      'Fasting is not for everyone: anyone pregnant, diabetic, unwell or with a history of disordered eating should not fast; prayer and gentleness are enough.',
    ],
    ritual: {
      title: 'A quiet Ekadashi',
      outline: [
        'In the morning, bathe and decide how you will keep the day: a fast within your health, or simply a plain meal without grains.',
        'Light a small lamp before an image of Vishnu or Krishna if you keep one, or simply at a clean, quiet place.',
        'Read a chapter of the Bhagavad Gita, or listen to a recording of a kirtan or of the Vishnu Sahasranama.',
        'Spend the day steadily, avoiding quarrels and indulgence.',
        'Next morning, break the fast simply, ideally within the parana window in a panchang.',
      ],
    },
    correspondences: {
      deities: ['Vishnu', 'Krishna'],
      herbs: ['Tulsi (holy basil)', 'Sandalwood'],
      colors: ['Yellow', 'White'],
      foods: ['Fruit', 'Milk', 'Nuts', 'Sabudana (tapioca pearls)'],
      symbols: ['The conch and discus', 'Tulsi', 'The waxing moon'],
    },
    respect:
      'Ekadashi is a living Hindu observance, kept by hundreds of millions, especially in Vaishnava traditions (including ISKCON, the Swaminarayan sampradaya, the Varkaris and Sri Vaishnavas). It is a vow of devotion to Vishnu, not a spell or a moon-magic day. If you are not Hindu, you are welcome to learn: visit a temple (dress modestly, remove shoes, ask before photographing), read the Gita, or join a kirtan. Don’t borrow its vows or mantras for workings of your own, and don’t present a fast as a diet or a cleanse.',
    sources: [
      'https://en.wikipedia.org/wiki/Ekadashi',
      'https://www.drikpanchang.com/vrats/ekadashidates.html',
      'Padma Purana, Uttara Khanda (the Ekadashi mahatmyas)',
      'G. Flood, An Introduction to Hinduism (Cambridge, 1996), on vrata',
    ],
  },
  {
    ref: 'hindu-ekadashi-krishna',
    title: 'Krishna Ekadashi',
    aka: ['Ekadashi', 'Dark-fortnight Ekadashi', 'Gyaras'],
    tradition: 'Hindu',
    summary:
      'The eleventh lunar day of the waning fortnight, sacred to Vishnu like its bright-fortnight twin, and kept the same way: fasting from grains and beans, prayer and a quiet mind.',
    honours:
      'Vishnu, the preserver, and his forms as Krishna and Rama. (“Krishna” here names the dark fortnight, krishna paksha, not the god, though he is often worshipped on it.)',
    history: `Ekadashi falls twice each lunar month, and the dark-fortnight days have their own names and stories just as the bright ones do: Utpanna Ekadashi, which tells the birth of the goddess Ekadashi herself from Vishnu to slay the demon Mura, is on the dark eleventh of Margashirsha (or Kartika, by the full-moon-ending months); Shattila Ekadashi in Magha, with gifts of sesame; Papamochani Ekadashi in Chaitra, “releasing from sin”; Indira Ekadashi in the fortnight of the ancestors, kept for their sake.

The rules are the same as for the bright fortnight: see the Shukla Ekadashi page for the fast, its breaking (parana) on Dwadashi, and the differences between sampradayas.`,
    knowAndDont: {
      known: 'A living observance, documented in the Puranas and kept today.',
      unknown: 'Family, regional and sect rules differ. Confirm the day with a local panchang or temple.',
    },
    celebrate: [
      'Follow your family or sampradaya’s rule for the fast, or simply eat plainly and skip grains and beans.',
      'Read or listen to the story of this month’s Ekadashi (most panchangs give its name).',
      'Give food or a donation to a temple kitchen or food bank.',
      'Anyone pregnant, unwell, diabetic or with a history of disordered eating should not fast.',
    ],
    ritual: {
      title: 'A quiet Ekadashi',
      outline: [
        'Bathe in the morning and decide how to keep the day within your health.',
        'Light a small lamp before an image of Vishnu or Krishna, or at a clean, quiet place.',
        'Read or listen to the story of the day’s Ekadashi, or a chapter of the Gita.',
        'Give something to someone in need.',
        'Break the fast simply the next morning.',
      ],
    },
    correspondences: {
      deities: ['Vishnu', 'Krishna'],
      herbs: ['Tulsi (holy basil)', 'Sandalwood'],
      colors: ['Yellow', 'White'],
      foods: ['Fruit', 'Milk', 'Nuts', 'Sesame (on Shattila Ekadashi)'],
      symbols: ['Tulsi', 'The waning moon'],
    },
    respect:
      'Ekadashi is a living Hindu vow of devotion to Vishnu, not a witchcraft working. Outsiders are welcome to learn, to visit temples respectfully (modest dress, shoes off, ask before photographing) and to share in kirtan and temple meals when invited. Please don’t adapt its vows or mantras into spells, or market the fast as a detox.',
    sources: [
      'https://en.wikipedia.org/wiki/Ekadashi',
      'https://www.drikpanchang.com/vrats/ekadashidates.html',
      'Padma Purana, Uttara Khanda (Utpanna Ekadashi)',
    ],
  },
  {
    ref: 'hindu-purnima',
    title: 'Purnima',
    aka: ['Poornima', 'Pournami', 'Full moon day'],
    tradition: 'Hindu',
    summary:
      'The full-moon day of the Hindu month: a day for vows (vrat), worship, the Satyanarayana puja in many homes, holy bathing, and many of the year’s great festivals.',
    honours:
      'Different deities on different Purnimas: Vishnu as Satyanarayana in the monthly home puja; Shiva; the Goddess; one’s guru on Guru Purnima; and Chandra, the Moon, himself.',
    history: `In the pūrṇimānta reckoning of north India, Purnima ends the month; in the amānta reckoning of the south and west, it is the middle. Either way, a great many festivals fall on it: Holi on Phalguna Purnima; Buddha Purnima (Vesak) in Vaishakha; Guru Purnima in Ashadha, when teachers are honoured; Raksha Bandhan on Shravana Purnima, when sisters tie a protective thread on their brothers’ wrists; Sharad Purnima in Ashvin, when rice pudding (kheer) is left out in the moonlight and eaten in the morning; Kartika Purnima, with lamps floated on rivers and Dev Deepawali at Varanasi.

Many families keep a monthly Purnima vrat with the Satyanarayana puja and katha: an offering to Vishnu as the lord of truth, the reading of its story, and the sharing of prasad (often a sweet semolina dish). Others bathe in a sacred river at dawn, give gifts (dana), or visit temples.`,
    knowAndDont: {
      known: 'A living practice, with festivals documented in the Puranas, panchangs and the life of temples and homes today.',
      unknown: 'Which Purnima customs a family keeps depends on region and tradition. The day a Purnima is observed can differ from the astronomical full moon; confirm with a panchang.',
    },
    celebrate: [
      'Find out which festival, if any, this month’s Purnima carries (a panchang will say), and learn its story.',
      'If invited, attend a Satyanarayana puja at a friend’s home or temple; bring fruit or flowers.',
      'Look at the full moon in quiet, and give something to someone in need.',
      'On Sharad Purnima, make kheer and share it.',
    ],
    ritual: { premade: 'folk-diya-gayatri', title: 'A lamp at moonrise' },
    correspondences: {
      deities: ['Vishnu', 'Shiva', 'Chandra'],
      herbs: ['Tulsi (holy basil)', 'Sandalwood', 'Jasmine'],
      crystals: ['Moonstone', 'Selenite'],
      colors: ['White', 'Silver', 'Yellow'],
      foods: ['Kheer', 'Sheera (semolina prasad)', 'Fruit', 'Milk'],
      symbols: ['The full moon', 'The lamp (diya)', 'The rakhi thread'],
    },
    respect:
      'Purnima belongs to living Hindu practice, and each full moon may carry a festival with its own deities and family customs. If you’re not Hindu, learn the festival’s story, take part when you are invited, and bring something (fruit, sweets, flowers) to share. Prasad offered to you should be received with the right hand and eaten, not thrown away. Please don’t fold Hindu full-moon rites into Wiccan esbat workings as if they were the same thing.',
    sources: [
      'https://en.wikipedia.org/wiki/Purnima',
      'https://en.wikipedia.org/wiki/Satyanarayan_Puja',
      'https://www.drikpanchang.com/ (Purnima dates)',
    ],
  },
  {
    ref: 'hindu-amavasya',
    title: 'Amavasya',
    aka: ['Amavas', 'Amavasai', 'New moon day'],
    tradition: 'Hindu',
    summary:
      'The new-moon day of the Hindu month, the end of the dark fortnight: a day for offerings to the ancestors (tarpan and shraddha), quiet worship and, for many, care about beginning new undertakings.',
    honours:
      'The pitrs, the ancestors, who are offered water, sesame and rice-balls (pinda); and in places Shiva, Kali or other forms of the Goddess.',
    history: `Amavasya, “dwelling together”, is when the Moon dwells with the Sun and cannot be seen. In the amānta reckoning of south and west India it ends the month. It is above all the ancestors’ day: water mixed with black sesame is offered for the pitrs (tarpan), often at a river or by a priest’s guidance. Mahalaya Amavasya, at the end of the fortnight of the ancestors (Pitru Paksha) in Bhadrapada/Ashvin, is the greatest of these, and in Bengal it also opens Durga Puja.

Other Amavasyas carry their own customs: Mauni Amavasya in Magha, kept in silence with bathing at the Sangam in Prayagraj; Somvati Amavasya, when the new moon falls on a Monday; and, above all, the Amavasya of Kartika (Ashvin by the amānta months), which is Diwali, the brightest night of the year. So the new moon is not only an inauspicious day: it depends on the occasion. Many people still avoid starting new ventures or buying major things on an ordinary Amavasya.`,
    knowAndDont: {
      known: 'A living observance with shraddha and tarpan rules set out in the dharmashastra and Puranas and in family practice.',
      unknown: 'Customs vary greatly by community; shraddha rites are performed with a priest or by family members according to their tradition. Confirm the day with a local panchang.',
    },
    celebrate: [
      'If you are Hindu, offer tarpan for your ancestors as your family does, or ask a priest.',
      'Anyone can remember their dead: light a lamp, speak their names, give food to someone hungry in their memory.',
      'Feed animals and birds: crows in particular are fed for the ancestors in many places.',
      'Keep the day simple and reflective.',
    ],
    ritual: {
      title: 'Remembering your ancestors',
      outline: [
        'At a quiet time, set a lamp and a cup of clean water on a clean surface.',
        'Light the lamp and name your ancestors, as far back as you know them.',
        'Offer the water to the earth (a garden or a plant), saying a word of thanks for each.',
        'Give food or a donation to someone in need in their memory.',
        'If you are not Hindu, keep your own family’s way of remembering, rather than imitating tarpan or pinda rites.',
      ],
    },
    correspondences: {
      deities: ['Shiva', 'Kali'],
      herbs: ['Sandalwood'],
      crystals: ['Obsidian', 'Smoky Quartz'],
      colors: ['Black', 'White'],
      foods: ['Black sesame', 'Rice', 'Kheer'],
      symbols: ['Crows', 'Kusha grass', 'Flowing water'],
    },
    respect:
      'Amavasya rites for the ancestors are sacred family duties in Hindu life, carried out according to family, caste and regional custom, often with a priest. Outsiders should not perform shraddha or pinda rites as spells or borrow them for necromancy-style workings. Honour your own dead in your own way, and learn about Hindu practice from those who keep it.',
    sources: [
      'https://en.wikipedia.org/wiki/Amavasya',
      'https://en.wikipedia.org/wiki/Shraddha',
      'https://en.wikipedia.org/wiki/Pitru_Paksha',
      'https://www.drikpanchang.com/ (Amavasya dates)',
    ],
  },
  {
    ref: 'hindu-vinayaka-chaturthi',
    title: 'Vinayaka Chaturthi',
    aka: ['Vinayaki Chaturthi', 'Monthly Ganesh Chaturthi', 'Varad Chaturthi'],
    tradition: 'Hindu',
    summary:
      'The fourth lunar day of the waxing fortnight, kept every month for Ganesha with worship at midday; the great Ganesh Chaturthi of Bhadrapada is the year’s grandest of these.',
    honours:
      'Ganesha (Vinayaka, Ganapati), the elephant-headed son of Shiva and Parvati, remover of obstacles, lord of beginnings, of learning and of thresholds, honoured first in nearly every Hindu rite.',
    history: `Each lunar month has two Ganesha days: the bright fourth (Vinayaka Chaturthi) and the dark fourth (Sankashti Chaturthi). On Vinayaka Chaturthi devotees worship Ganesha at midday, when he is said to have been born, with durva grass, red flowers and modak (sweet dumplings), and many keep a fast until the evening.

Because Ganesha is invoked at the start of anything, his days are favoured for beginnings. The tradition also warns against looking at the moon on the evening of Bhadrapada’s Chaturthi, after the story of the Moon mocking Ganesha and being cursed for it.`,
    knowAndDont: {
      known: 'A living monthly observance described in panchangs and temple calendars.',
      unknown: 'The emphasis given to the monthly day varies by region; confirm the date with a local panchang.',
    },
    celebrate: [
      'Visit a Ganesha temple or shrine at midday; offer a flower, a sweet or a few blades of grass.',
      'Begin something new today, quietly, with a thought for the remover of obstacles.',
      'Make or buy modak or laddoo and share them.',
      'Clear an obstacle: one stuck task, one blocked doorway.',
    ],
    ritual: {
      title: 'A simple offering to Ganesha',
      outline: [
        'If you keep an image of Ganesha, clean the place and set fresh flowers before it.',
        'Light a lamp (on a safe plate) and a stick of incense at midday.',
        'Offer a sweet and a few blades of fresh grass, with a simple prayer in your own words to remove what blocks you.',
        'Afterwards eat the sweet as prasad and share it.',
      ],
    },
    correspondences: {
      deities: ['Ganesha', 'Shiva', 'Parvati'],
      herbs: ['Durva grass', 'Sandalwood'],
      crystals: ['Carnelian', 'Red Jasper'],
      colors: ['Red', 'Yellow'],
      foods: ['Modak', 'Laddoo', 'Coconut', 'Jaggery'],
      symbols: ['The elephant head', 'The mouse (mushika)', 'The broken tusk'],
    },
    respect:
      'Ganesha is a living god of Hindu worship, not a good-luck mascot. If you are drawn to him, learn from Hindu sources and temples, treat his images with care (not on the floor, not in bathrooms), and offer vegetarian food. Outsiders are usually welcome at temples: dress modestly, remove shoes, follow the lead of devotees, and ask before taking photographs.',
    sources: [
      'https://en.wikipedia.org/wiki/Ganesha',
      'https://www.drikpanchang.com/vrats/vinayaka-chaturthi-dates.html',
      'P. B. Courtright, Gaṇeśa: Lord of Obstacles, Lord of Beginnings (Oxford, 1985)',
    ],
  },
  {
    ref: 'hindu-sankashti-chaturthi',
    title: 'Sankashti Chaturthi',
    aka: ['Sankatahara Chaturthi', 'Sakat Chauth', 'Angaraki (on a Tuesday)'],
    tradition: 'Hindu',
    summary:
      'The fourth lunar day of the waning fortnight: a monthly fast for Ganesha, “remover of obstacles”, broken after sighting the moon as it rises.',
    honours:
      'Ganesha in his form as Vighnaharta, the remover of troubles (sankata, “difficulty”; sankashti, “deliverance from difficulty”), and the Moon, to whom an offering of water is made before the fast is broken.',
    history: `Sankashti is a popular vrat especially in Maharashtra and south India. Devotees fast during the day, worship Ganesha in the evening, read the vrat katha for the month (each month has its own form of Ganesha and its own story), and after moonrise offer water (arghya) to the Moon and break the fast.

When it falls on a Tuesday it is Angaraki Sankashti, held especially auspicious. In north India the Sankashti of Magha is Sakat Chauth, kept by mothers for their children.`,
    knowAndDont: {
      known: 'A living vrat, with rules and stories in panchangs and vrat collections.',
      unknown: 'Which day is kept depends on the tithi at moonrise where you are; confirm with a local panchang.',
    },
    celebrate: [
      'Watch for the moonrise tonight, and offer it a little water poured on the earth.',
      'If you fast, do so within your health, and break it after moonrise.',
      'Visit a Ganesha temple in the evening.',
      'Name a difficulty you face, and one small step to ease it.',
    ],
    ritual: {
      title: 'Waiting for the moon',
      outline: [
        'During the day, keep a light fast if your health allows, or simply eat plainly.',
        'At dusk, light a lamp before an image of Ganesha or at a quiet place, and offer a flower or sweet.',
        'Watch for the moon to rise (a moonrise table helps).',
        'Pour a little water to the earth for the moon, then eat.',
      ],
    },
    correspondences: {
      deities: ['Ganesha', 'Chandra'],
      herbs: ['Durva grass'],
      crystals: ['Moonstone', 'Carnelian'],
      colors: ['Red', 'White'],
      foods: ['Modak', 'Sesame and jaggery sweets', 'Fruit'],
      symbols: ['The rising moon', 'The mouse', 'Water poured as arghya'],
    },
    respect:
      'Sankashti is a Hindu vow of devotion to Ganesha. If you are not Hindu, you are welcome to learn and to attend temple worship respectfully; please don’t repackage the vrat or its mantras as moon magic. Anyone pregnant, unwell or with a history of disordered eating should not fast.',
    sources: [
      'https://en.wikipedia.org/wiki/Sankashti_Chaturthi',
      'https://www.drikpanchang.com/vrats/sankashti-chaturthi-dates.html',
    ],
  },
  {
    ref: 'hindu-pradosh-shukla',
    title: 'Pradosh (bright fortnight)',
    aka: ['Pradosham', 'Pradosha Vrat', 'Shukla Pradosh'],
    tradition: 'Hindu',
    summary:
      'The thirteenth lunar day of the waxing fortnight, when Shiva is worshipped at dusk, the hour called pradosh kaal.',
    honours:
      'Shiva and Parvati, and Nandi the bull, Shiva’s mount and doorkeeper. The story most often told is of the churning of the ocean: when it threw up the poison halahala, Shiva drank it to save the worlds, and the gods praised him at dusk on the thirteenth day.',
    history: `Pradosh vrat is kept twice a month, on the waxing and waning thirteenth tithis, at the twilight period after sunset (about an hour and a half). In Shiva temples, especially in Tamil Nadu, abhishekam is performed for Nandi and the linga, and devotees circle the shrine in a special pattern (soma sutra pradakshina).

Its name changes with the weekday: Soma Pradosh on a Monday and Shani Pradosh on a Saturday are counted especially fruitful. The same customs apply to both fortnights; see also the page for the dark-fortnight Pradosh.`,
    knowAndDont: {
      known: 'A living observance, with its stories in the Skanda Purana and other texts and its rites in temple practice.',
      unknown: 'Exact timings differ by panchang; the day is chosen by the tithi at dusk where you are.',
    },
    celebrate: [
      'Visit a Shiva temple at dusk, when the Pradosh worship is done.',
      'Light a lamp at sunset and sit in quiet for a few minutes.',
      'Offer water or milk to a Shiva linga if you keep one, as your tradition does.',
      'Let the twilight mark a pause between work and evening.',
    ],
    ritual: { premade: 'folk-diya-gayatri', title: 'A lamp at twilight' },
    correspondences: {
      deities: ['Shiva', 'Parvati'],
      herbs: ['Bilva (bael) leaves', 'Sandalwood'],
      crystals: ['Clear Quartz'],
      colors: ['White', 'Blue'],
      foods: ['Milk', 'Fruit'],
      symbols: ['Nandi the bull', 'The linga', 'Twilight', 'Rudraksha beads'],
    },
    respect:
      'Pradosh is Hindu worship of Shiva. If you are not Hindu, attending temple worship respectfully (modest dress, shoes off, following devotees’ lead) is welcome in most places; please don’t treat Shiva’s rites as a spell timing.',
    sources: [
      'https://en.wikipedia.org/wiki/Pradosha',
      'https://www.drikpanchang.com/ (Pradosh dates)',
    ],
  },
  {
    ref: 'hindu-pradosh-krishna',
    title: 'Pradosh (dark fortnight)',
    aka: ['Pradosham', 'Pradosha Vrat', 'Krishna Pradosh'],
    tradition: 'Hindu',
    summary:
      'The thirteenth lunar day of the waning fortnight, when Shiva is worshipped at dusk; the dark Pradosh of Magha is followed the next night by Maha Shivaratri.',
    honours: 'Shiva, Parvati and Nandi, as on the bright-fortnight Pradosh.',
    history: `The waning Pradosh is kept exactly like the waxing one: worship at the dusk hour, abhishekam for Nandi and the linga, and a fast for those who keep it. It falls on the eve of the monthly Shivaratri (the dark fourteenth), so for many it opens two days of Shiva worship, and once a year, in Magha (Phalguna in the north), that Shivaratri is the great one.

See the bright-fortnight Pradosh page for the story and customs.`,
    knowAndDont: {
      known: 'A living observance in panchangs and temple life.',
      unknown: 'Timings vary by place and panchang; confirm locally.',
    },
    celebrate: [
      'Visit a Shiva temple at dusk.',
      'Light a lamp at sunset and keep a few minutes of quiet.',
      'If it falls on a Monday or Saturday, note it: Soma or Shani Pradosh.',
    ],
    ritual: { premade: 'folk-diya-gayatri', title: 'A lamp at twilight' },
    correspondences: {
      deities: ['Shiva', 'Parvati'],
      herbs: ['Bilva (bael) leaves', 'Sandalwood'],
      colors: ['White', 'Blue'],
      foods: ['Milk', 'Fruit'],
      symbols: ['Nandi the bull', 'The linga', 'Twilight'],
    },
    respect:
      'Pradosh is Hindu worship of Shiva. Outsiders are welcome to learn and attend respectfully; please don’t adapt its rites into spellwork.',
    sources: [
      'https://en.wikipedia.org/wiki/Pradosha',
      'https://www.drikpanchang.com/ (Pradosh dates)',
    ],
  },
  {
    ref: 'hindu-maha-shivaratri',
    title: 'Maha Shivaratri',
    aka: ['Mahashivratri', 'The Great Night of Shiva', 'Shivratri'],
    tradition: 'Hindu',
    summary:
      'The great night of Shiva, in late winter: a night of fasting, vigil, chanting and offerings of water, milk and bilva leaves to the linga.',
    honours:
      'Shiva, the auspicious one, ascetic and householder, destroyer and renewer. Different stories are told of this night: that it is the night of his marriage to Parvati; the night he appeared as an endless pillar of fire (the lingodbhava) before Brahma and Vishnu; the night he danced the cosmic dance; or the night he held the poison of the churned ocean in his throat.',
    history: `Shivaratri, “Shiva’s night”, comes every month on the dark fourteenth, but the Maha (great) Shivaratri of Magha (Phalguna in the north) is one of the most important nights of the Hindu year. The Puranas, notably the Shiva and Skanda Puranas, praise it, and tell the story of a hunter who, stuck in a bilva tree all night, unknowingly dropped leaves and water on a linga below and was blessed.

Devotees fast through the day, and the night is divided into four watches (prahar), with a puja and abhishekam of the linga in each: water, milk, curd, honey and ghee poured over it, and bilva leaves offered. Many stay awake all night chanting “Om Namah Shivaya”. Huge crowds gather at Shiva temples, from Varanasi’s Kashi Vishwanath to Pashupatinath in Nepal, and in recent decades large public all-night events have also grown.`,
    knowAndDont: {
      known: 'A living major festival documented in the Puranas, panchangs and temple life.',
      unknown: 'The date depends on which night the Chaturdashi holds at midnight, so it can differ by a day between panchangs and places.',
    },
    celebrate: [
      'Visit a Shiva temple, where many keep the night open; go respectfully and follow the devotees.',
      'Keep a vigil, or at least stay up a little longer, with quiet music or chanting.',
      'Fast within your health, or eat simply.',
      'Offer cool water to a plant or the earth, as water is poured over the linga.',
    ],
    ritual: {
      title: 'A night of attention',
      outline: [
        'Eat simply during the day, or keep a fast if your health and tradition allow.',
        'In the evening, light a lamp (never left unattended) at a clean, quiet place.',
        'Divide the night as you can into watches; at each, sit for a while in silence or listen to Shiva bhajans.',
        'If you are Hindu, perform the abhishekam as your family does; if not, simply offer cool water to a plant at each watch.',
        'At dawn, eat a simple meal and rest.',
      ],
    },
    correspondences: {
      deities: ['Shiva', 'Parvati', 'Ganesha'],
      herbs: ['Bilva (bael) leaves', 'Sandalwood'],
      crystals: ['Clear Quartz'],
      colors: ['White', 'Blue', 'Grey'],
      foods: ['Milk', 'Fruit', 'Thandai'],
      symbols: ['The linga', 'The trident (trishula)', 'The crescent in Shiva’s hair', 'Ash', 'Rudraksha beads'],
    },
    respect:
      'Maha Shivaratri is a sacred night of Hindu devotion to Shiva. Outsiders are welcome at many temples and public celebrations: dress modestly, remove shoes, follow queues and devotees’ lead, and ask before photographing. Please don’t treat Shiva or the linga as an exotic prop, or bhang culture as the point of the festival.',
    sources: [
      'https://en.wikipedia.org/wiki/Maha_Shivaratri',
      'https://www.drikpanchang.com/festivals/maha-shivaratri/maha-shivaratri-date-time.html',
      'Shiva Purana, Vidyeshvara Samhita; Skanda Purana (the story of the hunter)',
    ],
  },
  {
    ref: 'hindu-ganesh-chaturthi',
    title: 'Ganesh Chaturthi',
    aka: ['Vinayaka Chavithi', 'Ganeshotsav', 'Ganpati festival'],
    tradition: 'Hindu',
    summary:
      'The birthday of Ganesha in late summer: his image is welcomed into homes and public pandals for one to ten days of worship, then carried in procession and immersed in water.',
    honours:
      'Ganesha, remover of obstacles and lord of beginnings, son of Parvati, who in the best-known story made him from turmeric paste and set him to guard her door; Shiva, not knowing him, cut off his head and gave him an elephant’s in its place.',
    history: `Ganesh Chaturthi falls on Bhadrapada Shukla Chaturthi. In homes, a clay image of Ganesha is installed with prana pratishtha, worshipped with flowers, durva grass, red sandalwood and modak, and after one and a half, three, five, seven or ten days carried out for immersion (visarjan) in a river, lake or the sea, with the cry “Ganpati Bappa Morya, come back soon next year”.

Household worship is old; the great public festival is newer. In 1893 the nationalist leader Bal Gangadhar Tilak promoted public Ganeshotsav in Pune as a way of bringing people together under colonial rule, and the vast pandals of Mumbai and Pune grew from that. It is the major festival of Maharashtra, Goa, Karnataka, Telangana and Andhra Pradesh, and is celebrated by diaspora communities worldwide.

In recent years many have turned to unpainted clay images and artificial immersion tanks, as plaster of Paris and paint harm rivers and the sea.`,
    knowAndDont: {
      known: 'A living festival with well-documented household and public customs, and a well-known modern history.',
      unknown: 'The date and number of days are set by family and community custom; confirm the date with a local panchang.',
    },
    celebrate: [
      'Visit a public Ganesh pandal or a temple; many welcome everyone, and the atmosphere is joyful.',
      'If you are invited into a home during the festival, bring sweets or fruit, and accept prasad gratefully.',
      'Make or buy modak and share them.',
      'Choose eco-friendly clay if you keep an image, and immerse it in a bucket at home rather than a river.',
      'Don’t look at the moon tonight, if you want to keep the old custom.',
    ],
    ritual: {
      title: 'Welcoming the remover of obstacles',
      outline: [
        'Clean and decorate a small place in your home with flowers.',
        'If you keep an image of Ganesha, set it there; light a lamp beside it.',
        'Offer modak or another sweet, a red flower and a few blades of grass.',
        'Name the obstacles before you and ask for wisdom in meeting them.',
        'Share the sweets with others as prasad.',
      ],
    },
    correspondences: {
      deities: ['Ganesha', 'Parvati', 'Shiva'],
      herbs: ['Durva grass', 'Sandalwood'],
      crystals: ['Carnelian', 'Red Jasper'],
      colors: ['Red', 'Yellow', 'Orange'],
      foods: ['Modak', 'Laddoo', 'Coconut', 'Jaggery'],
      symbols: ['The elephant head', 'The mouse', 'Water for visarjan'],
    },
    respect:
      'Ganesh Chaturthi is a Hindu festival and, in many cities, a huge public celebration that welcomes everyone. Join with joy and respect: follow devotees’ lead at pandals, dress modestly, don’t treat images as decor, and ask before photographing people at worship. Please don’t take Ganesha into non-Hindu spellwork; learn about him from Hindu sources and communities.',
    sources: [
      'https://en.wikipedia.org/wiki/Ganesh_Chaturthi',
      'https://www.drikpanchang.com/festivals/ganesh-chaturthi/ganesh-chaturthi-date-time.html',
      'R. L. Cashman, “The Political Recruitment of God Ganapati”, Indian Economic and Social History Review 7 (1970)',
      'P. B. Courtright, Gaṇeśa: Lord of Obstacles, Lord of Beginnings (Oxford, 1985)',
    ],
  },
  {
    ref: 'hindu-navaratri',
    title: 'Sharad Navaratri',
    aka: ['Navratri', 'Durga Puja (Bengal)', 'Dussehra / Vijayadashami', 'Golu', 'Nine Nights of the Goddess'],
    tradition: 'Hindu',
    summary:
      'Nine nights of the Goddess in the autumn month of Ashvin, ending in Vijayadashami (Dussehra): fasting, worship of Durga in her nine forms, Garba dancing, Durga Puja and the victory of good over evil.',
    honours:
      'Durga and the Goddess (Devi) in many forms, above all her victory over the buffalo-demon Mahishasura, told in the Devi Mahatmya; also, in north India, Rama’s victory over Ravana, celebrated on the tenth day as Dussehra. In south India the three triads of nights honour Durga, Lakshmi and Saraswati.',
    history: `Navaratri opens with Ghatasthapana: a pot of water is installed and barley sown around it, to sprout through the nine days. Each day honours one of the nine forms of Durga (Navadurga), from Shailaputri to Siddhidatri, and many fast or eat only certain foods.

The festival looks very different by region. In Gujarat, people dance Garba and Dandiya Raas in circles each night. In Bengal and among Bengalis everywhere, Durga Puja fills the last five days with great pandals of Durga slaying Mahishasura, and ends with the images immersed in the river. In Tamil Nadu and Karnataka families set up golu, stepped displays of dolls, and visit one another; Saraswati Puja honours books and tools on the ninth day. On the eighth or ninth day young girls are worshipped as the Goddess (kanya puja). In the north, the Ramlila plays the story of Rama, and on Dussehra great effigies of Ravana are burned. Mysore’s Dasara procession is famous.

Vijayadashami is held a good day to begin learning, and children are introduced to letters (Vidyarambham) in Kerala.`,
    knowAndDont: {
      known: 'A living major festival with its texts (the Devi Mahatmya in the Markandeya Purana) and abundant regional customs.',
      unknown: 'The number of days can shift when a tithi is skipped or doubled, and regional customs vary greatly; confirm with a local panchang or community.',
    },
    celebrate: [
      'Go to a public Garba night or a Durga Puja pandal: many are open to all and very welcoming.',
      'Sprout barley in a pot of soil through the nine days, as in Ghatasthapana.',
      'Read the Devi Mahatmya in translation, a little each night.',
      'On Vijayadashami, begin something you want to learn.',
      'If you fast, do so within your health.',
    ],
    ritual: {
      title: 'Nine evenings',
      outline: [
        'On the first day, sow a few grains of barley in a pot of soil and set it in a clean place.',
        'Each evening, light a lamp beside it (never unattended) and spend a few minutes in quiet, or read a passage of the Devi Mahatmya.',
        'Water the grain and watch it grow over the nine days.',
        'On the tenth day, give thanks, return the grass to the garden, and begin something new.',
      ],
    },
    correspondences: {
      deities: ['Durga', 'Lakshmi', 'Saraswati', 'Rama'],
      herbs: ['Jasmine', 'Marigold'],
      crystals: ['Carnelian', 'Garnet', 'Ruby'],
      colors: ['Red', 'Gold', 'A different colour each day (as many communities assign)'],
      foods: ['Kuttu (buckwheat)', 'Sabudana', 'Fruit', 'Halwa, puri and chana (kanya puja)'],
      symbols: ['The lion', 'The trident', 'The sprouting pot', 'The dandiya sticks'],
    },
    respect:
      'Navaratri, Durga Puja and Dussehra are Hindu festivals and great community celebrations. Many Garba nights and pandals warmly welcome visitors; dress modestly (or in traditional clothes if invited), follow the dance etiquette, and respect worship spaces. Please don’t treat Durga as a generic “warrior goddess” for spellwork, or the festival as a costume party.',
    sources: [
      'https://en.wikipedia.org/wiki/Navaratri',
      'https://en.wikipedia.org/wiki/Durga_Puja',
      'https://www.drikpanchang.com/navratri/shardiya-navratri-ghatasthapana.html',
      'T. B. Coburn, Encountering the Goddess: A Translation of the Devī-Māhātmya (Albany, 1991)',
    ],
  },
  {
    ref: 'hindu-diwali',
    title: 'Diwali',
    aka: ['Deepavali', 'Lakshmi Puja', 'Festival of Lights', 'Divali'],
    tradition: 'Hindu',
    summary:
      'The festival of lamps, on the new moon of Kartika (Ashvin by the amānta months): houses are cleaned and lit with rows of lamps, Lakshmi is welcomed, sweets are shared and families gather.',
    honours:
      'Lakshmi, goddess of prosperity and good fortune, welcomed into clean and lit homes, with Ganesha honoured first; in north India, Rama’s return to Ayodhya after defeating Ravana; in the south, Krishna’s victory over Narakasura (on the day before); in Bengal, Kali. Jains keep it for Mahavira’s liberation and Sikhs celebrate Bandi Chhor Divas.',
    history: `Diwali is usually kept as five days: Dhanteras (buying metal or utensils, and honouring Dhanvantari), Naraka Chaturdashi or Choti Diwali (an oil bath before dawn in the south), the main night of Lakshmi Puja on the Amavasya, Govardhan Puja and Annakut (a “mountain of food” for Krishna) the day after, and Bhai Dooj, when sisters honour their brothers. In Gujarat the new year begins after it.

Before the night, homes are cleaned and repaired, rangoli patterns are drawn at the doorway, and new clothes bought. At dusk, rows of clay lamps (diyas) are lit along windows and doorways, Lakshmi and Ganesha are worshipped, and then come sweets, visits, gifts and fireworks. Businesses open new account books.

Diwali is celebrated across India and by diaspora communities worldwide. Air pollution from fireworks is a real concern in Indian cities, and many now celebrate with lamps alone.`,
    knowAndDont: {
      known: 'A living, major festival kept by Hindus, Jains, Sikhs and some Buddhists, with well-documented customs.',
      unknown: 'The day can differ between India and the Americas, and between regional panchangs in years when the Amavasya only just touches dusk. Confirm with a local temple or panchang.',
    },
    celebrate: [
      'Clean your home thoroughly in the days before, and fix one broken thing.',
      'Light lamps or candles at dusk in windows and at the door, safely and never left unattended.',
      'Draw a simple rangoli at your doorway with coloured rice, chalk or flowers.',
      'Share sweets with neighbours and friends, and go to a community Diwali event if there is one near you.',
      'If invited to a Lakshmi Puja, go gladly: bring sweets or fruit.',
    ],
    ritual: { premade: 'folk-lakshmi-diwali' },
    correspondences: {
      deities: ['Lakshmi', 'Ganesha', 'Rama', 'Kali'],
      herbs: ['Marigold', 'Sandalwood', 'Rose'],
      crystals: ['Citrine', 'Pyrite'],
      colors: ['Gold', 'Red', 'Yellow'],
      foods: ['Laddoo', 'Barfi', 'Kheer', 'Puffed rice and sugar sweets (batashe)'],
      symbols: ['The diya', 'Rangoli', 'Lakshmi’s footprints', 'The lotus'],
    },
    respect:
      'Diwali is a sacred festival for Hindus, Jains and Sikhs, and also a joyful community celebration that often welcomes friends and neighbours of every background. Take part when invited, learn the stories, and bring something to share. Please don’t reframe it as a money spell, or treat Lakshmi as interchangeable with a Wiccan prosperity goddess; the home devotion offered here is a simple welcome, not a substitute for Hindu puja.',
    sources: [
      'https://en.wikipedia.org/wiki/Diwali',
      'https://www.drikpanchang.com/diwali/diwali-puja-calendar.html',
      'https://en.wikipedia.org/wiki/Bandi_Chhor_Divas',
    ],
  },
  {
    ref: 'hindu-holika-dahan',
    title: 'Holika Dahan',
    aka: ['Choti Holi', 'Holika bonfire', 'Kamadahanam (south India)'],
    tradition: 'Hindu',
    summary:
      'The bonfire on the evening of Phalguna Purnima, the eve of Holi, burning the demoness Holika and celebrating the devotee Prahlad saved from the fire.',
    honours:
      'Vishnu, who as Narasimha protected his boy-devotee Prahlad from his demon father Hiranyakashipu; Prahlad himself, the model of steadfast devotion. In parts of south India, the fire recalls instead Kama, the god of love, burned by Shiva’s third eye.',
    history: `The story told is that the demon king Hiranyakashipu, angry that his son Prahlad worshipped Vishnu, tried again and again to kill him. His sister Holika, who could not be burned, took the boy into a fire on her lap; but the fire consumed Holika and Prahlad came out unharmed. The bonfire burns her, and with her the year’s evils.

In the days before, wood and cow-dung cakes are collected and heaped at crossroads and open spaces. On the evening of the full moon, after the inauspicious period of Bhadra has passed, the fire is lit with prayers, and people circle it, offering coconuts, new grain (wheat and chickpea ears roasted in the fire) and other offerings. In many villages embers are taken home to light the hearth.

The next morning comes Holi, the festival of colours.`,
    knowAndDont: {
      known: 'A living festival with the Prahlad story in the Bhagavata and Vishnu Puranas, and well-known customs today.',
      unknown: 'Panchangs apply the Bhadra rule differently, so the evening can differ by a day; confirm locally.',
    },
    celebrate: [
      'Go to a community Holika Dahan; many temples and community groups hold one.',
      'If you light any fire yourself, keep it small and safe: in a fire pit, away from buildings and with water to hand, and only where it is permitted.',
      'Roast new grain or chickpeas and share them.',
      'Write down what you want to let burn away, and give it to the fire, or tear it up if you have no fire.',
    ],
    ritual: {
      title: 'Letting the fire take it',
      outline: [
        'If you can join a community bonfire, go, and circle it with the others.',
        'At home, use a single candle in a deep, heatproof dish, never left alone.',
        'Hear or read the story of Prahlad and Holika.',
        'Name, silently, something harmful you want to leave behind.',
        'Share something sweet, and prepare (old clothes, natural colours) for Holi in the morning.',
      ],
    },
    correspondences: {
      deities: ['Vishnu', 'Narasimha', 'Prahlad'],
      herbs: ['Neem', 'Sandalwood'],
      crystals: ['Carnelian'],
      colors: ['Orange', 'Red'],
      foods: ['Roasted wheat and chickpeas', 'Coconut', 'Gujiya'],
      symbols: ['The bonfire', 'The full moon', 'Coconut'],
    },
    respect:
      'Holika Dahan is a Hindu sacred fire with a devotional story at its heart. Outsiders are often welcome at community bonfires: follow the lead of those who organise it and treat the fire as a place of prayer, not a party bonfire. Please don’t restyle it as a generic banishing spell.',
    sources: [
      'https://en.wikipedia.org/wiki/Holika_Dahan',
      'https://www.drikpanchang.com/festivals/holi/festivals-holika-dahan-timings.html',
      'Bhagavata Purana, Book 7 (Prahlad and Narasimha)',
    ],
  },
  {
    ref: 'hindu-holi',
    title: 'Holi',
    aka: ['Rangwali Holi', 'Dhulandi', 'Festival of Colours', 'Dol Jatra', 'Phagwah'],
    tradition: 'Hindu',
    summary:
      'The festival of colours on the morning after Holika Dahan: people throw coloured powder and water, share sweets, visit friends and make up quarrels, celebrating spring and the love of Radha and Krishna.',
    honours:
      'Krishna and Radha above all: the story goes that dark-skinned Krishna, worried that fair Radha would not love him, was told by his mother to colour her face as he liked. Also the spring, and the triumph of devotion (Prahlad) over the night before.',
    history: `Holi is among the oldest Hindu festivals, mentioned in early medieval literature and celebrated in the Braj country around Mathura and Vrindavan with special joy: Lathmar Holi in Barsana, where women playfully beat the men of Nandgaon with sticks, and a week or more of festivities in the temples. In Bengal and Odisha the same full moon is Dol Purnima, with Krishna and Radha swung on decorated swings; in Maharashtra colour is played on Rang Panchami, five days later. The Caribbean and Fiji Indian diaspora call it Phagwah.

The rules of ordinary life loosen for a morning: everyone is fair game, rank and caste are blurred in the colour, and “bura na mano, Holi hai” (“don’t be offended, it’s Holi”) is the cry. In the afternoon people wash, dress in clean clothes, and visit friends and family with sweets such as gujiya, and thandai to drink.

Two cautions: synthetic colours can harm skin and eyes, so natural colours (gulal from flowers and herbs) are better; and the festival’s licence must never become an excuse for harassment. Colour is for those who are willing to play.`,
    knowAndDont: {
      known: 'A living, major festival with old roots and well-documented regional customs.',
      unknown: 'The day can differ by region and panchang; confirm locally.',
    },
    celebrate: [
      'Join a community or temple Holi celebration; many are open to everyone.',
      'Use natural, skin-safe colours, protect your eyes, and play only with people who want to.',
      'Make or buy gujiya and share them with neighbours.',
      'Mend a quarrel: Holi is a day for forgiving.',
      'Wear old white clothes you don’t mind losing to the colour.',
    ],
    ritual: {
      title: 'Colour and reconciliation',
      outline: [
        'In the morning, put a pinch of colour on your own forehead or cheek, or on a picture of Krishna and Radha if you keep one.',
        'Greet those you live with by putting a little colour on their cheek, with their consent.',
        'Contact one person you have quarrelled with, and offer peace.',
        'In the afternoon, wash, change into clean clothes, and share sweets.',
      ],
    },
    correspondences: {
      deities: ['Krishna', 'Radha'],
      herbs: ['Marigold', 'Rose', 'Saffron'],
      crystals: ['Rose Quartz', 'Carnelian'],
      colors: ['Pink', 'Green', 'Yellow', 'Red', 'Blue'],
      foods: ['Gujiya', 'Thandai', 'Malpua', 'Puran poli'],
      symbols: ['Coloured powder (gulal)', 'The flute', 'The water-squirter (pichkari)'],
    },
    respect:
      'Holi is a Hindu festival, now joined in by people of many backgrounds. Commercial “colour runs” and Holi-themed parties often strip out its meaning; if you take part, learn the stories, go to a community or temple celebration if you can, and support the people whose festival it is. Never throw colour at anyone who doesn’t want it.',
    sources: [
      'https://en.wikipedia.org/wiki/Holi',
      'https://www.drikpanchang.com/ (Holi dates)',
      'M. Marriott, “The Feast of Love”, in M. Singer (ed.), Krishna: Myths, Rites, and Attitudes (Honolulu, 1966)',
    ],
  },
  // ───────────────────────── SLAVIC (OLD STYLE FEASTS) ─────────────────────────
  {
    ref: 'slavic-sviatvechir',
    title: 'Sviatvechir (Holy Evening)',
    aka: ['Svyat Vechir', 'Orthodox Christmas Eve', 'Sochelnik', 'Kuccia (Belarus)', 'Wigilia (Polish, New Style)'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'Christmas Eve by the Old Style (6 January in the ordinary calendar): the family gathers at the first star for a meatless supper of twelve dishes, beginning with kutia, with a sheaf for the ancestors in the corner.',
    honours:
      'The coming birth of Christ, above all; and around it, the household, its living and its dead. The didukh (“grandfather”), a sheaf of the last-harvested grain, stands in the corner of the main room as the spirit of the ancestors and of the harvest, and some families leave a place, or a spoonful of kutia, for those who have died.',
    history: `Sviatvechir closes the Nativity fast, so the supper is meatless (and in many homes dairy-free), with twelve dishes, often said to be for the twelve apostles: kutia (boiled wheat with poppy seed, honey and nuts) first, then borshch with little mushroom dumplings (vushka), varenyky, fish, cabbage rolls, beans, mushrooms and uzvar, a drink of dried fruit. Hay is spread under the tablecloth for the manger, and the meal begins when the children see the first star in the sky, for the star of Bethlehem.

The head of the house carries in the didukh; spoons of kutia were once thrown to the ceiling (the more that stuck, the better the year, or the swarms of bees), and kutia was offered to the frost so it would spare the crops. After supper the carollers come out, and many go to the night service. Similar suppers are kept in Belarus (Kuccia), Russia (Sochelnik), and among Catholic Poles and Slovaks as Wigilia on 24 December New Style.

How much of the didukh and kutia is older than Christianity is a fair question: ethnographers have long seen in them a winter feast for the dead and the harvest, folded into the Christian Christmas. That is a likely reading, but no pre-Christian source describes such a feast, so it remains an inference.`,
    knowAndDont: {
      known:
        'The supper, its dishes, the didukh, the hay and the first star are richly recorded by 19th- and 20th-century ethnographers and kept today across Ukraine, Belarus and their diasporas.',
      unknown:
        'How old the ancestral elements are. Customs vary by region and family; since 2023 many Ukrainians keep the feast on 24 December New Style instead.',
    },
    celebrate: [
      'Cook kutia, or a few meatless dishes, and wait for the first star before eating.',
      'Put a little hay under the tablecloth, or a sheaf of grain or dried grasses in the corner.',
      'Leave a candle and a spoonful of food for those of your family who have died.',
      'Learn and sing a koliadka, or listen to recordings of Ukrainian carols.',
      'If you are near an Orthodox or Greek Catholic parish, go to the evening service: visitors are welcome.',
    ],
    ritual: {
      title: 'Supper at the first star',
      outline: [
        'Cook kutia (wheat berries, poppy seed, honey, nuts) and a few other meatless dishes.',
        'Lay hay or straw under a white tablecloth, and stand a sheaf or bundle of grasses in the corner.',
        'Light a candle on the table, safely, and set a place or a spoonful for your dead.',
        'Watch for the first star; when it appears, greet the evening and begin with the kutia.',
        'After supper, sing or listen to carols, and remember those absent.',
      ],
    },
    correspondences: {
      herbs: ['Birch', 'Oak'],
      colors: ['White', 'Red', 'Gold'],
      foods: ['Kutia (wheat, poppy seed, honey)', 'Varenyky', 'Borshch with vushka', 'Uzvar', 'Pampushky'],
      symbols: ['The first star', 'The didukh sheaf', 'Hay under the tablecloth', 'An empty place for the dead'],
    },
    respect:
      'Sviatvechir is the Christmas Eve of Orthodox and Greek Catholic Christians, above all Ukrainians, Belarusians and Rusyns, and it is a deeply family occasion, kept with special feeling now in Ukraine and its diaspora. If you are not part of these communities, learn the customs, cook the dishes, go to a parish service or a community supper if invited, and support Ukrainian artists and charities. Please don’t present the didukh or kutia as a “pagan Slavic” spell, or reinvent the feast as a solstice rite: the people who keep it keep it for Christ’s birth.',
    sources: [
      'https://en.wikipedia.org/wiki/Christmas_in_Ukraine',
      'https://en.wikipedia.org/wiki/Didukh',
      'https://en.wikipedia.org/wiki/Kutia',
      'O. Voropai, Zvychai nashoho narodu (Munich, 1958)',
    ],
  },
  {
    ref: 'slavic-rizdvo',
    title: 'Rizdvo / Koliada (Old Style Christmas)',
    aka: ['Rizdvo Khrystove', 'Orthodox Christmas', 'Koliada', 'Rozhdestvo'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'The Nativity of Christ by the Old Style (7 January): church services, family feasting after the fast, and carollers going from house to house with the star, singing koliadky.',
    honours:
      'The birth of Christ; and, in the carols, the household, its master and mistress, its children, its fields and beasts, all wished a good year.',
    history: `On Christmas morning the greeting is “Khrystos rodyvsia!” (Christ is born!), answered “Slavimo Yoho!” (Let us glorify him!). The fast is over, and the table fills with meat and rich dishes.

From Christmas to Theophany, groups of carollers (koliadnyky) go from house to house carrying a many-pointed star on a pole, singing koliadky and performing the vertep, a Nativity play once given with puppets in a two-storey box and later with live actors, with Herod, angels, shepherds, a Jew, a Cossack, a devil and Death. Householders reward them with food or money, which today usually goes to a church or a charity.

Many koliadky are clearly Christian; others sing of a golden-horned stag, of the world created from the sea, or of the householder’s plentiful barns, and scholars have long seen in them older songs of the winter season. The name koliada itself comes from the Latin calendae, the Roman first of the month, by way of the New Year Kalends; there is no evidence for a god called Koliada.`,
    knowAndDont: {
      known: 'The feast, the koliadky, the star and the vertep are well recorded and still kept.',
      unknown: 'How old individual carols are, and what the non-Christian motifs once meant. Modern Rodnover festivals of “Koliada” at the solstice are reconstructions.',
    },
    celebrate: [
      'Greet friends with “Khrystos rodyvsia!” and learn the answer.',
      'Learn a koliadka, or listen to recordings of Ukrainian or Belarusian carols.',
      'Make a simple carolling star from card and a stick, with a candle-shaped light in the middle.',
      'Give to a charity, as carollers’ gifts now do.',
      'If you are near a parish, go to the Christmas Liturgy.',
    ],
    ritual: {
      title: 'Carolling the house',
      outline: [
        'Make or find a star and a carol or two you like.',
        'Go through your home, or visit a friend, and sing at the door.',
        'Wish the household health, plenty and peace for the year in your own words.',
        'Share food afterwards, and give a gift to a charity in thanks.',
      ],
    },
    correspondences: {
      herbs: ['Birch', 'Holly'],
      colors: ['Gold', 'Red', 'White'],
      foods: ['Kutia', 'Holubtsi', 'Kovbasa', 'Pampushky'],
      symbols: ['The carolling star', 'The vertep', 'The didukh'],
    },
    respect:
      'This is the Christmas of Orthodox and Greek Catholic Christians. Visitors are welcome at most parishes for the Divine Liturgy: stand with the congregation, follow their lead, dress modestly (some parishes expect women to cover their heads) and don’t receive communion unless you are Orthodox or have asked the priest. Learn the carols from the communities that sing them, and don’t recast the feast as a sun-god festival.',
    sources: [
      'https://en.wikipedia.org/wiki/Koliada',
      'https://en.wikipedia.org/wiki/Vertep',
      'https://en.wikipedia.org/wiki/Christmas_in_Ukraine',
      'V. Hnatiuk, Koliadky i shchedrivky (Lviv, 1914)',
    ],
  },
  {
    ref: 'slavic-shchedryi-vechir',
    title: 'Shchedryi Vechir / Malanka',
    aka: ['Generous Evening', 'Malanka', 'Vasyl’s Eve', 'Orthodox New Year’s Eve'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'New Year’s Eve by the Old Style (13 January), the feast of St Melania (Malanka): a second rich supper, well-wishing songs (shchedrivky), and masked mummers with Malanka, Vasyl and the goat.',
    honours:
      'St Melania the Younger, whose day it is, and St Basil, whose day follows; but above all the coming year and the household’s luck, wished upon it in song.',
    history: `This is the second of the three holy suppers of the winter feasts, called shchedra (generous) kutia because, unlike Christmas Eve, meat and rich food may be served. After dark the young people go out with shchedrivky, songs of well-wishing for the new year. The most famous is “Shchedryk”, in which a swallow flies in to tell the householder of the plenty the year will bring; Mykola Leontovych’s choral arrangement (1916) became, with new English words, “Carol of the Bells”.

The Malanka troupe is a masked folk play: a young man dressed as the bride Malanka, with Vasyl, the goat (koza) who “dies” and is revived, a bear, a Gypsy, a Jew, a soldier and others, who play pranks and are given treats. In Bukovina, Malanka is still a huge carnival. Diaspora communities hold “Malanka” dances as their New Year celebration.`,
    knowAndDont: {
      known: 'The supper, shchedrivky, Malanka plays and their characters are well recorded and still kept, especially in western Ukraine and the diaspora.',
      unknown: 'The goat’s death and revival and the cross-dressing are often called pre-Christian fertility rites; that is plausible but unproven.',
    },
    celebrate: [
      'Listen to “Shchedryk” sung in Ukrainian, and learn its story.',
      'Cook a generous supper and invite friends.',
      'Go to a Malanka dance if your town has a Ukrainian community.',
      'Wish each person you meet a good year in plain words.',
    ],
    ritual: {
      title: 'A generous evening',
      outline: [
        'Cook a rich supper and set a candle on the table.',
        'Before eating, wish each person at the table something specific for the new year.',
        'Sing or play “Shchedryk” and tell the story of the swallow.',
        'Put aside some food or money for someone who has less, and give it the next day.',
      ],
    },
    correspondences: {
      herbs: ['Birch'],
      colors: ['Red', 'Gold'],
      foods: ['Shchedra kutia', 'Varenyky', 'Pyrohy', 'Kovbasa'],
      symbols: ['The swallow', 'The goat mask', 'Masks and costumes'],
    },
    respect:
      'Shchedryi Vechir and Malanka belong to Ukrainian and Rusyn Christian folk culture, kept with special feeling in wartime and in the diaspora. Join community celebrations when they’re open to the public, and give credit to the culture behind “Carol of the Bells”. Please don’t present Malanka as a pagan rite to be reconstructed for spellwork.',
    sources: [
      'https://en.wikipedia.org/wiki/Malanka',
      'https://en.wikipedia.org/wiki/Shchedryk_(song)',
    ],
  },
  {
    ref: 'slavic-old-new-year',
    title: 'Old New Year (St Basil’s Day)',
    aka: ['Staryi Novyi Rik', 'Vasyl', 'Feast of St Basil', 'Staryi Novy God'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'New Year by the Old Style (14 January), the feast of St Basil the Great: boys go from house to house “sowing” grain for a fruitful year.',
    honours:
      'St Basil the Great (Vasyl), bishop of Caesarea in the 4th century, whose feast is 1 January in the church calendar; and the circumcision of Christ, kept the same day. In folk custom, the year’s first day and its luck.',
    history: `Early on New Year’s morning, boys go round houses with pockets full of wheat, rye or oats, throwing a handful into each home with a sowing song, such as “Siiu, viiu, posivaiu, z Novym rokom vitaiu” (“I sow, I scatter, I seed, I greet you with the New Year”). The first visitor to the house should be a boy or man, for luck, and the grain is swept up and kept for the spring sowing.

“Old New Year” is also widely kept, more lightly, across the former Soviet world, Serbia and North Macedonia as a second New Year celebration, a relic of the Julian calendar in daily life.`,
    knowAndDont: {
      known: 'The custom of sowing and the songs are well recorded and still practised.',
      unknown: 'Whether the sowing goes back before Christianity is not known.',
    },
    celebrate: [
      'Throw a few grains of wheat or oats across your threshold for a fruitful year, and keep them for the garden.',
      'Make your first visit of the day a cheerful one.',
      'Read about St Basil, who founded hospitals and fed the poor, and give to a food bank in his name.',
      'Make vasylopita or a simple bread to share.',
    ],
    ritual: {
      title: 'Sowing the year',
      outline: [
        'In the morning, take a handful of grain.',
        'Walk through the house, scattering a little in each room with a wish for the year.',
        'Sweep it up and keep it in a jar until spring, then sow it or give it to the birds.',
        'Give something to someone in need, as St Basil did.',
      ],
    },
    correspondences: {
      herbs: ['Oak'],
      colors: ['Gold', 'Green'],
      foods: ['Wheat', 'Bread', 'Vasylopita'],
      symbols: ['Grain scattered on the floor', 'The first visitor'],
    },
    respect:
      'St Basil’s Day is a Christian feast and the posivannia custom belongs to Ukrainian, Belarusian and Rusyn families. Learn it, enjoy it, and keep it with its meaning, rather than turning it into a prosperity spell divorced from the people who keep it.',
    sources: [
      'https://en.wikipedia.org/wiki/Old_New_Year',
      'https://en.wikipedia.org/wiki/Basil_of_Caesarea',
      'https://en.wikipedia.org/wiki/Christmas_in_Ukraine',
    ],
  },
  {
    ref: 'slavic-vodokhreshche',
    title: 'Vodokhreshche / Jordan (Theophany)',
    aka: ['Yordan', 'Theophany', 'Epiphany (Old Style)', 'Kreshchenie', 'Blessing of the Waters'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'The Baptism of Christ by the Old Style (19 January): the Great Blessing of Waters at rivers and springs, crosses cut in the ice, and blessed water carried home for the whole year. The end of the winter feasts.',
    honours:
      'The Baptism of Christ in the Jordan and the revelation of the Trinity (theophany, “God shown”), and through it the blessing of all water.',
    history: `On the eve, the third holy supper is kept: “hungry kutia”, meatless again, and the house is marked with chalk crosses or sprinkled. On the day, the clergy and people process to a river, lake or spring, where a cross (often carved from ice, called the Yordan) has been set, and the priest plunges a cross into the water three times. Doves are released in some places; the brave plunge into the icy water.

People carry the blessed water home and keep it all year: for sprinkling the house and stable, for the sick, for blessing seed. In some villages young men fired guns at the moment of blessing, and girls watched the weather and the water for omens.`,
    knowAndDont: {
      known: 'The service of the Great Blessing of Waters is ancient in the Eastern churches; the folk customs are well recorded.',
      unknown: 'Older water customs may lie beneath some of the folk practice, but that is speculation.',
    },
    celebrate: [
      'Go to a parish water blessing if there is one near you; you may be welcome to take some water home.',
      'Bless the water of your home simply: clean the taps, fill a jug and give thanks for clean water.',
      'Give to a charity that brings clean water to people.',
      'Do not plunge into icy water without experience and someone with you: cold shock can kill.',
    ],
    ritual: {
      title: 'Thanks for water',
      outline: [
        'Fill a clean bowl or jug with fresh water.',
        'Hold it and give thanks in your own words for the water that keeps your household alive.',
        'Use it to water your plants or wipe your door and windows.',
        'Make a donation to a clean-water charity.',
      ],
    },
    correspondences: {
      herbs: ['Hyssop', 'Willow'],
      crystals: ['Aquamarine', 'Clear Quartz'],
      colors: ['White', 'Blue', 'Silver'],
      foods: ['Hungry kutia (on the eve)', 'Uzvar'],
      symbols: ['The ice cross', 'The dove', 'Flowing water'],
    },
    respect:
      'The Great Blessing of Waters is a sacred rite of the Orthodox and Greek Catholic churches. Visitors are often welcome to watch and even to take water, but ask first, follow the clergy and community, and treat blessed water with reverence. Please don’t take it for spells.',
    sources: [
      'https://en.wikipedia.org/wiki/Great_Blessing_of_Waters',
      'https://en.wikipedia.org/wiki/Epiphany_(holiday)',
      'https://en.wikipedia.org/wiki/Christmas_in_Ukraine',
    ],
  },
  {
    ref: 'slavic-stritennia',
    title: 'Stritennia (the Meeting)',
    aka: ['Sretenie', 'Candlemas (Old Style)', 'The Presentation of the Lord', 'Hromnychna'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'The Meeting of the Lord by the Old Style (15 February): candles are blessed in church and kept against storms and illness, and folk say winter meets summer today.',
    honours:
      'The meeting of the infant Christ with the elder Simeon and the prophetess Anna in the Temple, forty days after his birth; Simeon’s hymn hails him as “a light to lighten the Gentiles”.',
    history: `Stritennia means “meeting”, and in folk speech it is also the meeting of winter and summer: “Na Stritennia zyma z litom zustrilasia”. If it was cold, winter would linger; if there was a thaw, spring would come early. The weather was watched as in the West on Candlemas.

Candles blessed in church today, the hromnychni svichky (“thunder candles”), were taken home and lit when storms came, when someone was ill, and placed in the hand of the dying. In Poland the Catholic feast of the Mother of God of the Thunder Candle (Matka Boska Gromniczna) on 2 February has the same custom.`,
    knowAndDont: {
      known: 'The feast, the candle blessing and the weather lore are well recorded.',
      unknown: 'The folk saying about winter and summer is a seasonal custom; any older pre-Christian layer is speculation.',
    },
    celebrate: [
      'Bless (or simply set aside) a candle for the year, to light in storms or sorrow.',
      'Watch the weather and see what it says about spring.',
      'Visit someone elderly, as the infant Christ was met by Simeon and Anna.',
      'Go to the service of the feast if a parish is near.',
    ],
    ritual: { premade: 'folk-candlemas-candles', title: 'Blessing the year’s candles' },
    correspondences: {
      herbs: ['Frankincense'],
      crystals: ['Clear Quartz'],
      colors: ['White', 'Gold'],
      foods: ['Pancakes', 'Bread'],
      symbols: ['The blessed candle', 'Two doves', 'The meeting of winter and spring'],
    },
    respect:
      'This is a Christian feast. If you are not Orthodox or Greek Catholic, learn its meaning and be respectful in church; a parish may let you bring a candle to be blessed if you ask. The candle-blessing working offered here is the Western Candlemas one, kept by Christian witches and others; it isn’t the Orthodox rite itself.',
    sources: [
      'https://en.wikipedia.org/wiki/Presentation_of_Jesus',
      'https://en.wikipedia.org/wiki/Candlemas',
      'O. Voropai, Zvychai nashoho narodu (Munich, 1958)',
    ],
  },
  {
    ref: 'slavic-yuri',
    title: 'Yuriy’s Day (St George, spring)',
    aka: ['Yuriia', 'Yurii Veshnii', 'Đurđevdan', 'Gergyovden', 'St George’s Day'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'St George’s Day by the Old Style (6 May): cattle were driven to pasture for the first time through the dew, the fields were walked and blessed, and people rolled in the dew for health.',
    honours:
      'St George the Great Martyr, the soldier saint who slays the dragon, protector of herds and herdsmen. In folk sayings “Yuriy unlocks the earth” and sends the grass up.',
    history: `On Yuriy’s Day herders drove the cattle out to the spring pasture for the first time, often touching them with a willow branch blessed on Palm Sunday, and laying an egg or an axe at the gate for them to step over. Young people rolled in the morning dew, “Yuriy’s dew”, for health and beauty, and the fields of new grain were walked in procession with the priest and blessed. In Serbia (Đurđevdan) and Bulgaria (Gergyovden) the same day is one of the great feasts of the year, with lamb, green branches and flowers.

Some scholars have connected these customs with Jarilo or other spring powers, but those links are reconstruction; the feast as recorded is George’s.`,
    knowAndDont: {
      known: 'The herding and dew customs are richly recorded by ethnographers across the Slavic and Balkan world.',
      unknown: 'Any pre-Christian deity behind the customs is guesswork.',
    },
    celebrate: [
      'Get up early and walk through dewy grass, or wash your face in the dew.',
      'Walk the edges of your garden or a field, and bless what grows.',
      'Pick fresh green branches for the house.',
      'If you keep animals, give them a special treat or a walk somewhere new.',
    ],
    ritual: { premade: 'folk-bealtaine-dew', title: 'Washing in the morning dew' },
    correspondences: {
      herbs: ['Willow', 'Birch', 'Nettle'],
      crystals: ['Green Aventurine', 'Bloodstone'],
      colors: ['Green', 'Red'],
      foods: ['Lamb', 'Eggs', 'Fresh greens'],
      symbols: ['The dragon-slayer', 'Morning dew', 'Green branches', 'Cattle at pasture'],
    },
    respect:
      'This is a Christian saint’s day, kept by Orthodox, Greek Catholic and other Christian communities, with herding customs that belong to village life. The dew-washing working linked here is the Irish May Day custom, a near cousin; it isn’t the Slavic rite.',
    sources: [
      'https://en.wikipedia.org/wiki/Saint_George%27s_Day',
      'https://en.wikipedia.org/wiki/%C4%90ur%C4%91evdan',
      'S. A. Tokarev (ed.), Kalendarnye obychai i obriady v stranakh zarubezhnoi Evropy (Moscow, 1977–83)',
    ],
  },
  {
    ref: 'slavic-kupala-old-style',
    title: 'Ivan Kupala (Old Style)',
    aka: ['Kupala Night', 'Ivana Kupala', 'Kupalle', 'Noc Kupały', 'St John’s Eve (Old Style)'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'Midsummer night by the Old Style (the night of 6–7 July), the eve and feast of the birth of John the Baptist: bonfires, wreaths floated on the water, herbs gathered, and the search for the fern flower.',
    honours:
      'John the Baptist, whose birth the church keeps on this day; and, in folk custom, fire, water, herbs and young love at the height of summer.',
    history: `On Kupala night young people gathered by the river. Girls wove wreaths of wildflowers and herbs and set them floating on the water with candles: where the wreath went, or whether it sank, foretold love and marriage. Couples jumped over bonfires holding hands. Herbs gathered that night or at dawn were held especially powerful, and the dew that morning especially healing. Daring ones went into the forest to look for the fern flower, which was said to bloom for a single moment at midnight and grant luck and the finding of treasure.

The church condemned the bonfires and games for centuries, which is partly how we know of them: a 1505 letter of the Pskov Eleazar Monastery describes them. Chroniclers sometimes wrote of “Kupala” as a pagan god, but it is more likely the name of the feast itself, from the word for bathing (kupaty), as John baptised in water. Kupala is the best-loved of the Slavic midsummer customs, kept in Ukraine, Belarus, Poland, Russia and beyond. The app also shows Kupala Night on the New Style date (23–24 June); both are kept, by different communities.`,
    knowAndDont: {
      known: 'The customs are recorded from the 16th century onward and richly by 19th-century ethnographers; they are still kept.',
      unknown: 'Whether Kupala was ever a deity (probably not), and how much of the festival is older than Christianity. Rodnover festivals of Kupala are modern reconstructions.',
    },
    celebrate: [
      'Weave a wreath of wildflowers and herbs, and float it on a river or pond (with no candle or wire, so it harms nothing).',
      'Light a fire only where it is safe and permitted, and keep water to hand; jumping over flames is not for small children or long skirts.',
      'Gather herbs at dawn with care and thanks, and dry them for the year.',
      'Stay up for the short night with friends.',
    ],
    ritual: { premade: 'folk-kupala-wreath' },
    correspondences: {
      herbs: ['St John’s Wort', 'Mugwort', 'Yarrow', 'Wormwood', 'Birch'],
      crystals: ['Sunstone', 'Carnelian'],
      colors: ['Red', 'Gold', 'Green'],
      foods: ['Varenyky', 'Bread', 'Kvass', 'Early berries'],
      symbols: ['The fern flower', 'Floating wreaths', 'The bonfire', 'The river'],
    },
    respect:
      'Kupala is a folk festival of Slavic villages, kept within the Christian calendar on the feast of St John and now also by Rodnovers and many others. Take part with an eye to the people whose custom it is: learn its songs and meaning, and don’t claim your version is the “original pagan” one.',
    sources: [
      'https://en.wikipedia.org/wiki/Kupala_Night',
      'https://en.wikipedia.org/wiki/Nativity_of_John_the_Baptist',
      'W. F. Ryan, The Bathhouse at Midnight: Magic in Russia (Stroud, 1999)',
    ],
  },
  {
    ref: 'slavic-illia',
    title: 'Illia’s Day (Elijah the Thunderer)',
    aka: ['Illin Den', 'Ilyin Den', 'Ilinden', 'St Elijah’s Day'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'The feast of the prophet Elijah by the Old Style (2 August), who rides the thunder in his fiery chariot: the end of high summer, the harvest under way, and no more swimming after today.',
    honours:
      'The prophet Elijah (Illia), who called down fire from heaven and was taken up in a chariot of fire; in folk belief, the master of thunder, rain and lightning, who strikes at devils with his bolts.',
    history: `Elijah was the saint of storms all over the Orthodox Slavic world. On his day people were careful not to work in the fields lest he strike them; they blessed the first loaf of new grain, and they said the water grew cold after Illia, because the saint, or a stag, had dipped into it, so no more swimming. In Macedonia, Ilinden is also remembered for the uprising of 1903.

Many scholars, from 19th-century folklorists to Ivanov and Toporov in the 1970s, have argued that the thunder-riding Illia inherited the role of the old thunder god Perun. That is a reasonable idea, but it is argued over: Elijah’s fiery chariot and his power over rain come straight from the Bible, and the evidence for Perun’s own cult is thin. The feast itself is Christian.`,
    knowAndDont: {
      known: 'The feast and its storm and harvest customs are well recorded.',
      unknown: 'The link with Perun is a scholarly reconstruction, debated, and cannot be proven.',
    },
    celebrate: [
      'Watch a summer storm from somewhere safe, and listen.',
      'Bake or buy a loaf of new-season bread and give thanks for the harvest.',
      'Take your last swim of the summer, in safe water.',
      'Read the story of Elijah on Mount Carmel (1 Kings 18).',
    ],
    ritual: {
      title: 'Thanks for the first bread',
      outline: [
        'Buy or bake a loaf from the new harvest.',
        'Before you cut it, give thanks for the rain and sun that grew it.',
        'Share the first slices with others, and leave a little crumb for the birds.',
        'If a storm comes, sit and watch it safely indoors.',
      ],
    },
    correspondences: {
      deities: ['Perun'],
      herbs: ['Oak', 'Nettle'],
      crystals: ['Hematite', 'Garnet'],
      colors: ['Red', 'Gold'],
      foods: ['New bread', 'Honey'],
      symbols: ['The fiery chariot', 'Thunder and lightning', 'The first sheaf'],
    },
    respect:
      'Illia’s Day is a Christian feast. Rodnovers and others honour Perun at this season in their own reconstructed ways, which is their right; but please don’t present the saint’s feast as a disguised Perun festival, as if the people who keep it didn’t know their own faith.',
    sources: [
      'https://en.wikipedia.org/wiki/Elijah',
      'https://en.wikipedia.org/wiki/Perun',
      'V. V. Ivanov and V. N. Toporov, Issledovaniia v oblasti slavianskikh drevnostei (Moscow, 1974)',
    ],
  },
  {
    ref: 'slavic-makovei',
    title: 'Makovei (Honey Saviour)',
    aka: ['Medovyi Spas', 'Makoviia', 'Feast of the Maccabees', 'First Saviour'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'The first of the three Saviours’ feasts by the Old Style (14 August): poppy heads, honey and bouquets of herbs and flowers are blessed in church, and wells and water are blessed.',
    honours:
      'The seven Maccabee martyrs and their mother (2 Maccabees 7), and the procession of the wood of the Holy Cross; and with them Christ the Saviour, whose feasts the three Spasy are.',
    history: `In August come three “Saviour” feasts: Makovei or Honey Saviour on the 1st, Apple Saviour (the Transfiguration) on the 6th and Nut or Bread Saviour on the 16th, all Old Style. Makovei also opens the two-week Dormition fast.

The name comes from the Maccabees (Makaveï), and folk speech heard mak, “poppy”, in it: the feast became the day for blessing poppies. Women make bouquets (makoviiky) of poppy heads, mint, marigolds, wormwood, cornflowers and other herbs, have them blessed in church, and keep them behind the icons through the year. Honey from the new harvest is blessed and tasted for the first time; poppy-seed cakes (makivnyky) and pancakes with honey are made; and wells are cleaned and blessed, the water carried in procession.`,
    knowAndDont: {
      known: 'The church feasts and the poppy, honey and water customs are well recorded.',
      unknown: 'The poppy custom is a folk etymology made real; any older layer behind it is not known.',
    },
    celebrate: [
      'Make a little bouquet of poppy heads, mint and garden flowers, and hang it to dry in your home.',
      'Taste new-season honey and give thanks for the bees.',
      'Bake something with poppy seed.',
      'Clean a water source: a bird bath, a water butt, the kettle.',
    ],
    ritual: {
      title: 'A Makovei bouquet',
      outline: [
        'Gather poppy heads (dried, from a florist or garden), mint, marigold and other herbs.',
        'Tie them into a bouquet with a ribbon.',
        'Give thanks over them for the summer’s plenty, and for honey and water.',
        'Hang the bouquet in your home until next year, then return it to the earth.',
      ],
    },
    correspondences: {
      herbs: ['Mint', 'Calendula', 'Wormwood', 'Yarrow'],
      crystals: ['Citrine', 'Amber'],
      colors: ['Red', 'Gold', 'Blue'],
      foods: ['Honey', 'Poppy-seed cakes (makivnyky)', 'Pancakes with honey'],
      symbols: ['Poppy heads', 'The honeycomb', 'The well'],
    },
    respect:
      'Makovei is a Christian feast with village customs that belong to Ukrainian, Belarusian and Rusyn families. You’re welcome to make a bouquet and enjoy the honey, but please don’t present the blessed makoviiky as an ingredient in spells.',
    sources: [
      'https://en.wikipedia.org/wiki/Honey_Feast_of_the_Saviour',
      'https://en.wikipedia.org/wiki/Holy_Maccabees',
      'O. Voropai, Zvychai nashoho narodu (Munich, 1958)',
    ],
  },
  {
    ref: 'slavic-apple-spas',
    title: 'Yablichnyi Spas (Apple Saviour)',
    aka: ['Apple Spas', 'Yablochny Spas', 'Transfiguration (Old Style)', 'Second Saviour'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'The Transfiguration by the Old Style (19 August): the first apples, pears, plums and grapes are brought to church to be blessed before they are eaten.',
    honours:
      'The Transfiguration of Christ on Mount Tabor, when he shone with light before Peter, James and John; and the fruit of the year, offered in thanks.',
    history: `The Byzantine church has long blessed the first fruits on the Transfiguration, originally grapes; in the Slavic north, where grapes were few, apples took their place. Baskets of fruit are carried to church, blessed, and then shared, with the poor and with neighbours. Many people wait until this day to eat the new season’s apples.

There is a tender folk belief behind this, especially among mothers who have lost a child: that in heaven, children are given apples only if their mothers on earth have waited until the Saviour. Weather was watched too: as the Apple Saviour goes, so goes January.`,
    knowAndDont: {
      known: 'The feast and the fruit blessing are long established and still kept.',
      unknown: 'Nothing particular: it is a Christian first-fruits feast, with local variation.',
    },
    celebrate: [
      'Eat your first apple of the season today, and give thanks.',
      'Take a basket of fruit to a neighbour, a shelter or a food bank.',
      'Bake an apple cake (sharlotka) and share it.',
      'Climb a hill or watch the sunrise: the feast is about light on a mountain.',
    ],
    ritual: {
      title: 'First fruits',
      outline: [
        'Gather a small basket of new apples or other fruit.',
        'Set it on the table with a candle, and give thanks for the harvest.',
        'Share the first fruit with the people around you.',
        'Give some away to someone who needs it.',
      ],
    },
    correspondences: {
      herbs: ['Mint', 'Rose'],
      crystals: ['Clear Quartz', 'Peridot'],
      colors: ['White', 'Gold', 'Green'],
      foods: ['Apples', 'Pears', 'Plums', 'Grapes', 'Apple cake'],
      symbols: ['Mount Tabor', 'Light', 'The basket of fruit'],
    },
    respect:
      'The Transfiguration is a major Christian feast. Visitors who bring fruit to be blessed are often welcomed, but ask first and follow the parish’s custom; the blessed fruit is for eating and sharing, not for spellwork.',
    sources: [
      'https://en.wikipedia.org/wiki/Feast_of_the_Transfiguration',
      'https://en.wikipedia.org/wiki/Apple_Feast_of_the_Saviour',
    ],
  },
  {
    ref: 'slavic-pokrova',
    title: 'Pokrova (the Protecting Veil)',
    aka: ['Pokrov', 'Feast of the Intercession', 'Protection of the Theotokos'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'The feast of the Protecting Veil of the Mother of God by the Old Style (14 October), at the turn to winter: the start of the wedding season, when girls asked Pokrova for a husband.',
    honours:
      'The Mother of God (Theotokos), who in a vision seen by St Andrew the Fool-for-Christ in the Blachernae church at Constantinople in the 10th century spread her veil over the praying people to protect them.',
    history: `The feast hardly mattered in Greek lands, but became one of the great feasts of the East Slavs from the 12th century. It falls as the harvest is in and the first frosts come, so it marked the end of field work and the beginning of the season for weddings. Girls prayed: “Holy Pokrova, cover the earth with snow, and me, young one, with a kerchief”, the kerchief being the married woman’s headscarf.

The Zaporozhian Cossacks took Pokrova as their patron feast, and in Ukraine it became a day of the defenders of the homeland; since 2023, with the church’s change of calendar, both are kept on 1 October.`,
    knowAndDont: {
      known: 'The feast, its Byzantine origin and its Slavic folk customs are well recorded.',
      unknown: 'Nothing especially uncertain; the folk sayings vary by region.',
    },
    celebrate: [
      'Cover something you love: wrap a shawl around your shoulders, or put a warm cover on a bed for winter.',
      'Pray, or simply ask, for protection over those you love.',
      'Finish putting the garden to bed.',
      'Remember those who defend others, and give to a charity that supports them.',
    ],
    ritual: {
      title: 'Under a protecting cover',
      outline: [
        'Take a shawl, scarf or blanket.',
        'Light a candle and say who you ask protection for this winter.',
        'Wrap the cloth around yourself or lay it over a loved one’s bed.',
        'Keep it as a winter blanket, a reminder of shelter.',
      ],
    },
    correspondences: {
      herbs: ['Rowan', 'Oak'],
      crystals: ['Blue Lace Agate', 'Moonstone'],
      colors: ['Blue', 'White'],
      foods: ['Pancakes', 'Apples', 'Pumpkin'],
      symbols: ['The veil', 'The first snow', 'The wedding kerchief'],
    },
    respect:
      'Pokrova is a feast of the Mother of God, dear to Orthodox and Greek Catholic Ukrainians, Belarusians and Russians. Please honour it as a Christian feast, and don’t recast the Theotokos as a generic “mother goddess” in workings.',
    sources: [
      'https://en.wikipedia.org/wiki/Intercession_of_the_Theotokos',
      'https://en.wikipedia.org/wiki/Andrew_the_Fool',
      'O. Voropai, Zvychai nashoho narodu (Munich, 1958)',
    ],
  },
  {
    ref: 'slavic-andrii',
    title: 'Andrii’s Eve (St Andrew’s Night)',
    aka: ['Andriivski vechornytsi', 'Andrzejki', 'Kalyta', 'St Andrew’s Eve'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'The eve of St Andrew by the Old Style (the night of 12–13 December), the great night of girls’ fortune-telling about love and marriage, and the game of biting the kalyta loaf.',
    honours:
      'St Andrew the First-Called, the apostle who, by legend, preached on the hills of Kyiv; and, in folk custom, the hope of love and a good match.',
    history: `On Andrii’s Eve girls gathered for evening parties (vechornytsi) to tell their fortunes: pouring melted wax into water and reading the shapes; counting fence posts in the dark; listening at windows for a name; putting out dumplings for a dog to see whose it ate first, to tell who would marry first; asking the name of the first man they met in the street.

The boys had the kalyta: a large round honey cake hung from the ceiling, guarded by a comic “Pan Kalytynskyi” with a brush dipped in soot. Each boy rode up on a poker as a horse and tried to bite the kalyta without laughing; if he laughed, his face was blackened. In Poland, Andrzejki on 29–30 November New Style is now a merry evening of wax-pouring and party games.`,
    knowAndDont: {
      known: 'The divination customs and the kalyta are richly recorded and still played.',
      unknown: 'Why St Andrew became the patron of love divination is not clear; the customs are folk practice beside the church feast, not part of it.',
    },
    celebrate: [
      'Hold a party with friends and play the old games, for fun.',
      'Pour melted wax into cold water and read the shapes together.',
      'Bake a round honey cake and hang it for a game of kalyta.',
      'Keep it light: these were games of hope, played in company.',
    ],
    ritual: {
      title: 'Wax pouring',
      outline: [
        'Melt a few candle stubs in an old metal ladle or a tin set in a pan of hot water (never over an open flame unattended).',
        'Fill a bowl with cold water.',
        'Each person asks a question in their mind, then pours a little wax into the water.',
        'Lift out the shape, hold it to the candlelight, and read its shadow on the wall together.',
        'Laugh, eat honey cake, and keep the shapes you like.',
      ],
    },
    correspondences: {
      herbs: ['Rose', 'Mint'],
      crystals: ['Rose Quartz', 'Moonstone'],
      colors: ['Red', 'White'],
      foods: ['Kalyta (round honey cake)', 'Varenyky', 'Pampushky'],
      symbols: ['Poured wax', 'The kalyta', 'The X-shaped cross of St Andrew'],
    },
    respect:
      'Andrii’s Eve games are folk custom kept by Ukrainian, Polish and other Slavic communities, Christian in setting and playful in spirit. Enjoy them as such, rather than as serious love spells.',
    sources: [
      'https://en.wikipedia.org/wiki/St._Andrew%27s_Day',
      'https://en.wikipedia.org/wiki/Andrzejki',
      'O. Voropai, Zvychai nashoho narodu (Munich, 1958)',
    ],
  },
  {
    ref: 'slavic-mykolai',
    title: 'St Mykolai’s Day',
    aka: ['Sviatyi Mykolai', 'St Nicholas Day (Old Style)', 'Nikola Zimnii', 'Mikołajki'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'St Nicholas by the Old Style (19 December), the protector of children, travellers and the poor: children find gifts under their pillows in the morning.',
    honours:
      'St Nicholas of Myra, the 4th-century bishop who by legend secretly gave dowries to three poor girls; patron of children, sailors, travellers and the poor, the most loved saint of the Eastern Slavs.',
    history: `On the night before, children put their letters to Mykolai on the windowsill and find small gifts under their pillows in the morning, or a twig (rizka) if they have been naughty. In Ukraine, Mykolai rather than Father Frost was the gift-giver of tradition, and his day opened the winter festival season. Across the Slavic world many churches are dedicated to him, and he is called on by travellers and anyone in trouble.

Catholics keep his day on 6 December New Style, as do Ukrainians since 2023.`,
    knowAndDont: {
      known: 'The feast and the gift custom are well established.',
      unknown: 'Most St Nicholas stories are legends written down centuries after his life.',
    },
    celebrate: [
      'Leave a small gift for a child, or secretly for anyone, as Nicholas did.',
      'Give to a children’s charity or a shelter.',
      'Bake mykolaichyky, spiced honey biscuits.',
      'Pray, or wish, safe travel for someone on the road.',
    ],
    ritual: {
      title: 'A secret gift',
      outline: [
        'Choose someone who could use a kindness.',
        'Prepare a small gift or note, and leave it where they’ll find it, without your name.',
        'Light a candle for children and travellers.',
        'Give to a charity that helps children.',
      ],
    },
    correspondences: {
      herbs: ['Cinnamon', 'Clove', 'Star Anise'],
      crystals: ['Aquamarine'],
      colors: ['Red', 'White', 'Gold'],
      foods: ['Mykolaichyky (spiced honey biscuits)', 'Oranges', 'Gingerbread'],
      symbols: ['Three gold coins', 'The ship', 'The bishop’s staff'],
    },
    respect:
      'St Nicholas’s Day is a Christian feast, much loved by Orthodox, Greek Catholic and Catholic families. Join in the giving: that is its whole spirit.',
    sources: [
      'https://en.wikipedia.org/wiki/Saint_Nicholas_Day',
      'https://en.wikipedia.org/wiki/Saint_Nicholas',
    ],
  },
  {
    ref: 'slavic-pascha',
    title: 'Velykden (Orthodox Easter)',
    aka: ['Pascha', 'Velykden', 'Paskha', 'Vialikdzień', 'Orthodox Easter'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'Pascha, the Resurrection, the “Great Day”: baskets of paska bread, pysanky and krashanky eggs, butter, salt and meats are blessed at dawn, and the greeting “Khrystos voskres!” rings out.',
    honours:
      'Christ risen from the dead, the heart of the Christian faith; and with him the dead, remembered in the days after.',
    history: `After the seven weeks of Great Lent and Holy Week, the Paschal service begins at midnight with a procession around the church by candlelight and the proclamation “Christ is risen!” — “Indeed he is risen!” (Khrystos voskres! – Voistynu voskres!). At dawn the faithful stand outside with their baskets (koshyky), covered with embroidered cloths, holding paska (tall sweet bread, decorated with dough crosses and braids), eggs, butter, cheese, sausage, horseradish and salt, and the priest sprinkles them with holy water. The family’s Easter breakfast begins with a shared blessed egg.

Pysanky, eggs decorated in wax-resist with ancient symbols (suns, stars, wheat, the endless line), are among Ukraine’s best-known folk arts; krashanky are eggs dyed a single colour. In western Ukraine young people dance the spring circle dances (hahilky) around the church. On Pascha and the days after, people greet one another with Christ is risen, and Easter eggs are rolled and exchanged.

Pascha is reckoned by the Julian computus, so it usually falls later than Western Easter, and sometimes on the same day.`,
    knowAndDont: {
      known: 'The service, the basket blessing and the egg arts are richly recorded and very much alive.',
      unknown: 'Pysanka symbols are often said to be pre-Christian; some motifs may be old, but their meanings are mostly modern interpretations.',
    },
    celebrate: [
      'Learn to write a pysanka (wax-resist egg); many Ukrainian centres hold workshops.',
      'Bake paska, or buy one from a Ukrainian bakery or church sale.',
      'Greet friends who keep Pascha with “Khrystos voskres!” — they will answer “Voistynu voskres!”',
      'If you’re invited, go to the midnight service: it is one of the most beautiful in the world.',
      'Give generously: the feast is meant to be shared.',
    ],
    ritual: {
      title: 'An Easter basket',
      outline: [
        'Dye or decorate eggs (krashanky are simple: boiled eggs with onion skins give a deep red).',
        'Bake or buy a sweet bread.',
        'Arrange bread, eggs, butter and salt in a basket under an embroidered or white cloth.',
        'If you are Orthodox or a parish welcomes you, take it to be blessed; otherwise, share it at breakfast with thanks.',
      ],
    },
    correspondences: {
      herbs: ['Willow', 'Birch'],
      colors: ['Red', 'White', 'Gold', 'Black'],
      foods: ['Paska', 'Pysanky and krashanky', 'Butter', 'Salt', 'Horseradish', 'Kovbasa'],
      symbols: ['The pysanka', 'The paschal candle', 'The basket under an embroidered cloth'],
    },
    respect:
      'Pascha is the holiest day of the Orthodox and Greek Catholic year. Pysanky are a living Ukrainian art with deep meaning to the people who make them: buy from Ukrainian makers, learn from Ukrainian teachers, and don’t present them as “pagan charms” stripped of their Easter context. Visitors are welcome at most Paschal services; stand respectfully, follow the congregation, and don’t take communion unless you are Orthodox or have asked.',
    sources: [
      'https://en.wikipedia.org/wiki/Pysanka',
      'https://en.wikipedia.org/wiki/Paskha',
      'J. Meeus, Astronomical Algorithms, ch. 8 (the Julian computus)',
    ],
  },
  {
    ref: 'slavic-radunytsia',
    title: 'Radunytsia (Remembrance of the Dead)',
    aka: ['Radonitsa', 'Radaunica', 'Provody', 'Hrobki', 'Day of Rejoicing'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'The Tuesday after Thomas Sunday, nine days after Pascha, when families go to the graves of their dead with eggs and bread, eat with them, and share the Easter joy.',
    honours:
      'The family dead, greeted with “Christ is risen!” so they share in the Resurrection; the church calls it a day of rejoicing.',
    history: `On Radunytsia families tidy the graves, spread a cloth over them or beside them, and bring Easter food: red eggs, paska, sausage, sometimes a drink. A priest serves a memorial (panakhyda) at the cemetery, and an egg or a piece of bread is left on the grave, or crumbled for the birds. In Belarus and Russia it is a public holiday; in Ukraine the same visits (Provody, “seeing off”) are often made on Thomas Sunday or Monday.

The name is usually explained from radovatysia, “to rejoice”, because it is a day of Easter joy with the dead; some scholars connect it instead with older words for the dead. Ethnographers have long seen in it one of the oldest layers of Slavic custom, feeding and visiting the dead in spring, gathered into the Christian Easter season. That is likely, though not provable.`,
    knowAndDont: {
      known: 'The day, its customs and its place in the Easter season are well recorded and kept.',
      unknown: 'The origin of the name and how old the grave meal is are uncertain.',
    },
    celebrate: [
      'Visit and tidy a family grave; bring flowers and a red egg.',
      'If your dead are far away, set their photographs out with a candle and an egg.',
      'Tell their stories over a meal.',
      'Feed the birds with crumbs in their memory.',
    ],
    ritual: { premade: 'hedge-ancestor-candle-evening', title: 'Remembering your own dead' },
    correspondences: {
      herbs: ['Birch', 'Willow', 'Rosemary'],
      colors: ['Red', 'White'],
      foods: ['Red eggs', 'Paska', 'Kutia', 'Bread'],
      symbols: ['The red egg on the grave', 'The embroidered towel (rushnyk)', 'Birds'],
    },
    respect:
      'Radunytsia is an Orthodox and Greek Catholic remembrance, kept by families at the graves of their own dead. If you are not part of this tradition, honour your own ancestors in your own way; the ancestor evening linked here is a general remembrance, not the Orthodox rite. Don’t use cemeteries for workings.',
    sources: [
      'https://en.wikipedia.org/wiki/Radonitsa',
      'S. A. Tokarev (ed.), Kalendarnye obychai i obriady v stranakh zarubezhnoi Evropy (Moscow, 1977–83)',
    ],
  },
  {
    ref: 'slavic-zeleni-sviata',
    title: 'Zeleni Sviata (Green Holidays, Trinity)',
    aka: ['Triitsia', 'Troitsa', 'Klechalnaia Nedelia', 'Rusalii', 'Green Week', 'Orthodox Pentecost'],
    tradition: 'Slavic (Orthodox and Greek Catholic folk year)',
    summary:
      'Pentecost by the Orthodox reckoning, called Trinity: houses and churches are decked with green branches, herbs and sweet flag. The week around it is Rusalii, when the rusalky were said to walk.',
    honours:
      'The Holy Spirit and the Holy Trinity; and in folk custom the green life of early summer, and the dead, remembered on the Saturday before.',
    history: `For Trinity, homes and churches are filled with green: branches of linden, maple, birch and oak stuck in the gates and walls, and herbs and sweet flag (calamus) strewn on the floor, with lovage and wormwood among them. People come to church holding bunches of herbs and flowers, which are then dried and kept for healing. The Saturday before is a day for the dead (Batkivska subota), and graves are tidied and decorated with green.

The week around Pentecost is Rusalii or Rusalnyi tyzhden. In folk belief the rusalky, spirits of young women who had died unmarried or by drowning, came out of the water into the fields and forests, swinging in birch branches and luring young men; people carried wormwood for protection and avoided swimming. In Russia the Thursday before (Semik) had girls curling birch branches and floating wreaths. The name Rusalii comes from the Latin Rosalia, a Roman spring feast of roses for the dead, which reached the Slavs through Byzantium.`,
    knowAndDont: {
      known: 'The green decoration, the herbs, the day of the dead and the rusalka beliefs are well recorded by ethnographers.',
      unknown: 'How the rusalka beliefs grew, and whether they reflect pre-Christian spirits of water and field, is debated; the word itself is borrowed.',
    },
    celebrate: [
      'Bring green branches and herbs into your home, and strew a few fragrant herbs on the floor.',
      'Gather a bunch of herbs and flowers and dry them for the year.',
      'Visit and green a family grave on the Saturday before.',
      'Learn the rusalka stories (and swim only in safe water).',
    ],
    ritual: {
      title: 'Greening the house',
      outline: [
        'Gather a few green branches (fallen or pruned, not torn from trees) and fragrant herbs.',
        'Put branches by the door and in a vase on the table.',
        'Strew some fresh herbs on the floor or a windowsill.',
        'Give thanks for the green season, and hang a bundle to dry for the year.',
      ],
    },
    correspondences: {
      herbs: ['Birch', 'Oak', 'Wormwood', 'Mint', 'Lemon Balm'],
      crystals: ['Moss Agate', 'Green Aventurine', 'Jade'],
      colors: ['Green', 'White'],
      foods: ['Eggs', 'Green borshch (with sorrel)', 'Bread'],
      symbols: ['Green branches', 'Sweet flag', 'The birch', 'Rusalky'],
    },
    respect:
      'Trinity is a Christian feast, and the greenery and the day of the dead belong to its parish and family customs. Rusalka lore is beloved folklore; enjoy it, but please don’t present the Christian feast as a disguised pagan festival.',
    sources: [
      'https://en.wikipedia.org/wiki/Rusalii',
      'https://en.wikipedia.org/wiki/Rusalka',
      'https://en.wikipedia.org/wiki/Pentecost',
      'W. F. Ryan, The Bathhouse at Midnight: Magic in Russia (Stroud, 1999)',
    ],
  },
  // ───────────────────────── COLIGNY (GAULISH, RECONSTRUCTED) ─────────────────────────
  {
    ref: 'coligny-samonios',
    title: 'Samonios begins',
    aka: ['SAMON', 'Samonios', 'First month of the Gaulish year'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary:
      'The first month of the Gaulish year on the Coligny bronze, a “good” (MAT) month of 30 days. Its name means something to do with summer; whether it opened the summer or closed it is the great question of the calendar.',
    honours:
      'The bronze names no gods for its months. The month name comes from samo-, “summer”, the same root as Irish Samain, Welsh Haf. Anything more is our own choice.',
    history: `The Coligny calendar is a bronze tablet of the late 2nd century CE, found in 1897 in some 150 pieces in a field at Coligny in eastern France, along with fragments of a bronze statue of a god. It is written in Latin letters but in the Gaulish language, and sets out five years of lunar months as a grid of days, with a hole beside each day for a peg to mark the date. It is now in the Lugdunum museum in Lyon.

Samonios heads every year. On its 17th day the bronze writes TRINVX[...] SAMONI SINDIV, usually read as “three nights of Samonios today”, which has led many people to link Samonios with the Irish Samain at the start of November. But the name means “summer”, and several scholars (McKay, Bonsing, Le Contel and Verdier) argue the month began near the start of summer, in May or June, and the winter month Giamonios six months later. The app follows the late-spring reading by default and lets you choose.

So: a new year, its date uncertain. Modern Gaulish polytheists (Senobessus Gallicos and others) keep it according to their own readings.`,
    knowAndDont: {
      known: 'The month’s name, its place at the head of the year, its 30 days and MAT marking, and the TRINVX inscription on day 17, all on the bronze.',
      unknown:
        'When in the solar year it fell, when in the moon’s cycle the month began, and what, if anything, was done in it. No text describes Gaulish new-year customs.',
    },
    celebrate: [
      'Look at the moon tonight and note its phase: Gaulish months were lunar.',
      'Read about the Coligny bronze, and look at photographs of it: a beautiful, puzzling object.',
      'Begin a calendar journal for the Gaulish year, noting the weather and what grows.',
      'If you keep a Gaulish practice, honour the gods of your hearth in your own way.',
    ],
    ritual: {
      title: 'Opening a Gaulish year',
      outline: [
        'At dusk, step outside and find the moon if it is up.',
        'Light a candle or lamp safely on a windowsill.',
        'Speak the twelve month names aloud, beginning with Samonios.',
        'Write in a notebook what you hope the year will hold, and what you notice in the season now.',
        'Keep the notebook through the year, adding a line at each month’s start.',
      ],
    },
    correspondences: {
      colors: ['Gold', 'Green'],
      symbols: ['The bronze grid', 'The peg hole', 'Summer'],
    },
    sources: [
      'https://en.wikipedia.org/wiki/Coligny_calendar',
      'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)',
      'P.-M. Duval and G. Pinault, Recueil des inscriptions gauloises III: Les calendriers (Paris: CNRS, 1986)',
      'H. McKay, “The Coligny calendar as a Metonic lunar calendar”, Études Celtiques 42 (2016): https://codecs.vanhamel.nl/McKay_(Helen)_2016_42awe',
      'https://nouiogalatis.org/2025/10/30/when-the-year-was-born/',
    ],
  },
  {
    ref: 'coligny-trinvx-samoni',
    title: 'TRINVX SAMONI (Three Nights of Samonios)',
    aka: ['Trinoxtion Samoni', 'Three Nights of Samonios', 'Trinouxtion'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary:
      'Three nights around the 17th day of Samonios, where the bronze writes TRINVX[...] SAMONI SINDIV, usually read as “three nights of Samonios today”: the only named festival on the whole calendar.',
    honours:
      'We do not know. The words name a time, not a god. Many modern people connect it with the Irish Samain and honour the dead; others, reading Samonios as early summer, keep it as a summer feast.',
    history: `On the bronze, against day 17 of Samonios (the second day after the month’s midpoint, ATENOVX), stands a note usually read TRINVX SAMONI SINDIV, “three nights of Samonios today”. It is the clearest sign anywhere on the calendar of a festival. Other marks on the bronze (such as PRINNI LAGET, PRINNI LOVDIN and IVOS) may also note observances, but their meanings are argued.

Because Samonios means “summer”, and because Irish Samain (1 November) was the great feast opening the dark half of the year, many have identified the three nights with Samain. That fits if Samonios fell in autumn; if, as several recent scholars argue, Samonios began near the start of summer, the three nights were a summer feast and the link with Samain is a matter of the shared name only. In this app the three nights are shown as the 16th to the 18th, around the inscription’s own day.`,
    knowAndDont: {
      known: 'The inscription exists, on day 17 of Samonios, and probably refers to three nights.',
      unknown: 'Everything else: what was done, whom it honoured, and when in the year it fell. Every modern observance is a reconstruction.',
    },
    celebrate: [
      'Keep three evenings: a lamp lit each night, and a little time spent outside.',
      'If you follow the Samain reading, honour your dead; if the summer reading, celebrate the light and the season.',
      'Share a meal with friends on one of the nights.',
      'Read the inscription for yourself (photographs and transcriptions are online), and think about what you don’t know.',
    ],
    ritual: {
      title: 'Three nights',
      outline: [
        'On each of the three evenings, light a lamp or candle in a safe place.',
        'First night: give thanks for what the past year brought.',
        'Second night (the bronze’s own day): share food and drink with friends or family, and leave a portion outside.',
        'Third night: name what you hope for in the year ahead.',
        'On each night, before snuffing the light, spend a few minutes looking at the sky.',
      ],
    },
    correspondences: {
      herbs: ['Oak', 'Mistletoe'],
      colors: ['Gold', 'Black', 'White'],
      symbols: ['Three lights', 'The peg in the bronze', 'The moon past full'],
    },
    sources: [
      'https://en.wikipedia.org/wiki/Coligny_calendar',
      'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)',
      'P.-M. Duval and G. Pinault, Recueil des inscriptions gauloises III: Les calendriers (Paris: CNRS, 1986)',
      'H. McKay, “The Coligny calendar as a Metonic lunar calendar”, Études Celtiques 42 (2016)',
    ],
  },
  {
    ref: 'coligny-dumannios',
    title: 'Dumannios begins',
    aka: ['DVMAN', 'Dumannios'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary: 'The second month of the Gaulish year on the Coligny bronze, marked ANM, “not good”, with 29 days. Its name’s meaning is uncertain: perhaps “dark” or “smoky”.',
    honours: 'The bronze names no gods for its months. Dumannios has been connected with words for smoke or darkness, but the meaning is a guess.',
    history: `Dumannios follows Samonios. If the year began in late spring (the app’s default), Dumannios falls around midsummer; if it began at Samhain, it falls in the dark of late autumn, which would fit a meaning of “dark” or “smoky”. Either way, we only know the name, its 29-day ANM marking, and the days and marks of its grid.

What ANM (“not good”) meant is itself debated: it may simply mark a 29-day month rather than an unlucky one.`,
    knowAndDont: {
      known: 'The name, its place, its ANM status and 29 days on the bronze.',
      unknown: 'The meaning of the name, its season, and any customs.',
    },
    celebrate: [
      'Note the moon’s phase and the season in your Gaulish-year journal.',
      'Notice what is dark or hidden in your life this month, and what is in full light.',
      'Tend a hearth or a candle quietly one evening.',
    ],
    ritual: {
      title: 'Marking the month',
      outline: [
        'At the month’s start, look for the moon.',
        'Light a candle and say the month’s name aloud.',
        'Write a line in your journal: the weather, what grows, what you’re working on.',
        'Snuff the candle and carry on with the ordinary day.',
      ],
    },
    correspondences: { colors: ['Grey', 'Black'], symbols: ['Smoke', 'The hearth'] },
    sources: ['https://en.wikipedia.org/wiki/Coligny_calendar', 'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)'],
  },
  {
    ref: 'coligny-riuros',
    title: 'Riuros begins',
    aka: ['RIVROS', 'Riuros'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary: 'The third month of the Gaulish year on the Coligny bronze, a “good” MAT month of 30 days. The name’s meaning is uncertain: perhaps “frost”, or “fat”, as in the fatness of the year.',
    honours: 'The bronze names no gods for its months.',
    history: `Riuros is the third month. The two proposed meanings pull in opposite directions, which shows how much depends on where the year began: “frost” would suit a winter month (if Samonios is November), “fatness” a high-summer one (if Samonios is May). Neither is certain.

What we have is the name, the MAT (“good”) marking and the grid of its 30 days, with the bronze’s small notes on particular days.`,
    knowAndDont: {
      known: 'The name, its place and its MAT status with 30 days.',
      unknown: 'Its meaning and season, and anything that was done in it.',
    },
    celebrate: [
      'Notice the season: is it a time of frost, or of plenty, where you are?',
      'Record the moon and weather in your journal.',
      'Share a good meal with someone, for the “fat” of the year.',
    ],
    ritual: {
      title: 'Marking the month',
      outline: [
        'Look for the moon at the month’s start.',
        'Light a candle and say the month’s name.',
        'Write what the season is doing where you live.',
        'Snuff the candle.',
      ],
    },
    correspondences: { colors: ['White', 'Gold'], symbols: ['Frost', 'Plenty'] },
    sources: ['https://en.wikipedia.org/wiki/Coligny_calendar', 'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)'],
  },
  {
    ref: 'coligny-anagantios',
    title: 'Anagantios begins',
    aka: ['ANAGAN', 'Anagantios'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary: 'The fourth month of the Gaulish year on the Coligny bronze, marked ANM with 29 days. The name may mean “not travelling”: a time of staying at home.',
    honours: 'The bronze names no gods for its months.',
    history: `Anagantios is often analysed as an-, “not”, with a root for going or travelling: the stay-at-home month. If the Gaulish year began at Samhain, it would fall in midwinter, when travel stopped; if the year began in May, it would fall in late summer or early autumn. Both readings have their supporters.

The name, the ANM marking and the 29 days are on the bronze; the rest is interpretation.`,
    knowAndDont: {
      known: 'The name, its place and its ANM status.',
      unknown: 'The meaning is a proposal; the season and customs are unknown.',
    },
    celebrate: [
      'Stay home one evening on purpose: cook, mend, read.',
      'Tidy and bless your house.',
      'Record the moon and season in your journal.',
    ],
    ritual: {
      title: 'A home-staying evening',
      outline: [
        'Choose an evening at the month’s start to stay in.',
        'Light a candle at your hearth or table.',
        'Do one task that cares for the house.',
        'Say the month’s name and write a line in your journal.',
      ],
    },
    correspondences: { colors: ['Brown', 'Red'], symbols: ['The hearth', 'The closed door'] },
    sources: ['https://en.wikipedia.org/wiki/Coligny_calendar', 'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)'],
  },
  {
    ref: 'coligny-ogronnios',
    title: 'Ogronnios begins',
    aka: ['OGRON', 'Ogronnios'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary: 'The fifth month of the Gaulish year on the Coligny bronze, a MAT month of 30 days. The name may mean “cold” (compare Welsh oer).',
    honours: 'The bronze names no gods for its months.',
    history: `Ogronnios has been compared with Welsh oer and Irish uar, “cold”. In the default reading it falls in early autumn, and in the Samhain reading in early spring; neither is a perfect fit for “cold”, and the comparison itself is not secure.

As with all the months, we have its name, its MAT marking and its grid of days.`,
    knowAndDont: {
      known: 'The name, its place and its MAT status.',
      unknown: 'Its meaning, season and customs.',
    },
    celebrate: [
      'Notice the cold, or its absence, and record it.',
      'Warm someone: share soup, lend a blanket.',
      'Note the moon’s phase in your journal.',
    ],
    ritual: {
      title: 'Marking the month',
      outline: [
        'Look for the moon at the month’s start.',
        'Light a candle and say the month’s name.',
        'Write a line about the season.',
        'Do one warming kindness for someone.',
      ],
    },
    correspondences: { colors: ['White', 'Blue'], symbols: ['Cold', 'The hearth fire'] },
    sources: ['https://en.wikipedia.org/wiki/Coligny_calendar', 'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)'],
  },
  {
    ref: 'coligny-cutios',
    title: 'Cutios begins',
    aka: ['CVTIOS', 'Cutios'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary: 'The sixth month of the Gaulish year on the Coligny bronze, a MAT month of 30 days, the last before the year’s second half. Its meaning is uncertain: perhaps “winds” or “invocations”.',
    honours: 'The bronze names no gods for its months.',
    history: `Cutios closes the first half of the year. In the third year of the bronze’s five-year cycle, an extra month (Rantaranos) is inserted after it, before Giamonios, to keep the moons in step with the sun.

Proposed meanings include “winds” and “invocations” (“the month of calling”), neither secure.`,
    knowAndDont: {
      known: 'The name, its place at the end of the first half-year, its MAT status, and the intercalary month after it in the third year.',
      unknown: 'Its meaning, season and customs.',
    },
    celebrate: [
      'Take stock of the half-year that is ending.',
      'Notice the wind, and fly a kite or hang a wind chime.',
      'Record the moon in your journal.',
    ],
    ritual: {
      title: 'Halfway through the year',
      outline: [
        'At the month’s start, light a candle.',
        'Read back over your journal for the half-year.',
        'Write down what you want to carry into the second half.',
        'Open a window for a minute and let the air move through the house.',
      ],
    },
    correspondences: { colors: ['Grey', 'White'], symbols: ['Wind', 'A calling voice'] },
    sources: ['https://en.wikipedia.org/wiki/Coligny_calendar', 'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)'],
  },
  {
    ref: 'coligny-giamonios',
    title: 'Giamonios begins',
    aka: ['GIAMON', 'Giamonios'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary: 'The seventh month on the Coligny bronze, opening the second half of the Gaulish year; marked ANM with 29 days. Its name comes from giamo-, “winter”.',
    honours: 'The bronze names no gods for its months. The name shares its root with Irish gem-, Welsh gaeaf, “winter”.',
    history: `Samonios (“summer”) and Giamonios (“winter”) divide the Gaulish year in two, six months apart. That much is clear from the names. Which way round they sat against the seasons is not: if Samonios opened the summer half in May, Giamonios opened the winter half around November, and the two names describe what was beginning; if Samonios was November, Giamonios fell in May, and the names must describe what was ending.

The app’s default places Giamonios around Samhain, at the start of winter. The other readings are available in Settings.`,
    knowAndDont: {
      known: 'The name, its root, its place opening the second half of the year, and its ANM status.',
      unknown: 'Its season (it depends on your reading), and any customs.',
    },
    celebrate: [
      'Mark the turn of the year’s halves: put away one season’s things and bring out the next.',
      'Light the first fire or the first candle of the winter evenings.',
      'Record the moon in your journal.',
    ],
    ritual: {
      title: 'The turn of the half-year',
      outline: [
        'At the month’s start, tidy away one thing that belongs to the past season.',
        'Light a candle and say the month’s name.',
        'Name what this half of the year is for.',
        'Write it in your journal.',
      ],
    },
    correspondences: { colors: ['Black', 'White'], symbols: ['Winter', 'The year’s second half'] },
    sources: [
      'https://en.wikipedia.org/wiki/Coligny_calendar',
      'H. McKay, “The Coligny calendar as a Metonic lunar calendar”, Études Celtiques 42 (2016)',
    ],
  },
  {
    ref: 'coligny-simivisonnios',
    title: 'Simivisonnios begins',
    aka: ['SIMIVIS', 'Simivisonnios'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary: 'The eighth month of the Gaulish year on the Coligny bronze, a MAT month of 30 days. The name may mean “half-spring”.',
    honours: 'The bronze names no gods for its months.',
    history: `Simivisonnios has been analysed as simi-, “half”, with a word for spring (compare Latin ver). If so, it marks a point on the way toward spring. In the default reading it falls around midwinter, halfway from autumn to spring; in the Samhain reading it falls in early summer.

The name, the MAT marking and the grid are on the bronze; the meaning is a proposal.`,
    knowAndDont: {
      known: 'The name, its place and its MAT status.',
      unknown: 'The meaning, its season and any customs.',
    },
    celebrate: [
      'Look for the first signs of spring, however small.',
      'Sow seeds indoors.',
      'Record the moon in your journal.',
    ],
    ritual: { premade: 'green-seed-blessing-before-sowing', title: 'Halfway to spring' },
    correspondences: { colors: ['Green', 'White'], symbols: ['Buds', 'Lengthening days'] },
    sources: ['https://en.wikipedia.org/wiki/Coligny_calendar', 'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)'],
  },
  {
    ref: 'coligny-equos',
    title: 'Equos begins',
    aka: ['EQVOS', 'Equos'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary:
      'The ninth month of the Gaulish year on the Coligny bronze, marked ANM, yet 30 days long in some years and fewer in others, as if it were the month that kept pace with the moon. The name may mean “horse”.',
    honours:
      'The bronze names no gods. The Gauls did honour a horse goddess, Epona, whose cult spread across the Roman army, but there is no evidence linking her to this month.',
    history: `Equos is the odd month out: although marked ANM (“not good”, normally 29 days), it has 30 days in some years of the bronze. Scholars have seen in it the adjustable month that kept the calendar’s count of days in line with the real moon.

The name looks like the Gaulish word for horse (compare Latin equus, Old Irish ech), though some read it otherwise. If the year began in late spring, Equos falls around January or February.`,
    knowAndDont: {
      known: 'The name, its place, its ANM marking and its varying length on the bronze.',
      unknown: 'Whether the name really means “horse”, its season, and any customs.',
    },
    celebrate: [
      'If you love horses, visit some or support a horse sanctuary.',
      'Notice how the real moon and the calendar drift: compare the month’s start with the moon tonight.',
      'Record the season in your journal.',
    ],
    ritual: {
      title: 'Marking the month',
      outline: [
        'Look for the moon at the month’s start.',
        'Light a candle and say the month’s name.',
        'If you honour Epona, offer her a little grain or an apple, knowing the link is your own.',
        'Write a line in your journal.',
      ],
    },
    correspondences: { deities: ['Epona'], colors: ['White', 'Brown'], foods: ['Apples', 'Oats'], symbols: ['The horse'] },
    sources: [
      'https://en.wikipedia.org/wiki/Coligny_calendar',
      'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)',
      'https://en.wikipedia.org/wiki/Epona',
    ],
  },
  {
    ref: 'coligny-elembivios',
    title: 'Elembivios begins',
    aka: ['ELEMBIV', 'Elembivios'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary: 'The tenth month of the Gaulish year on the Coligny bronze, marked ANM with 29 days. The name may refer to deer, like the Greek month Elaphebolion, “deer-shooting”.',
    honours:
      'The bronze names no gods. Cernunnos, the antlered Gaulish god of the Pillar of the Boatmen, is a tempting association, but there is no evidence for it.',
    history: `Elembivios has been compared with the Greek Elaphebolion (the Attic month of Artemis the deer-shooter) and with Celtic words for deer. That is an appealing reading but not a proven one.

If the year began in late spring, Elembivios falls in late winter; if at Samhain, around late summer.`,
    knowAndDont: {
      known: 'The name, its place and its ANM status.',
      unknown: 'The meaning, season and any customs.',
    },
    celebrate: [
      'Walk somewhere you might see deer, quietly, at dawn or dusk.',
      'Record the moon and the season in your journal.',
      'Learn about the antlered god on the Pillar of the Boatmen in Paris (and the limits of what we know).',
    ],
    ritual: {
      title: 'A quiet walk',
      outline: [
        'At the month’s start, take a walk at dusk somewhere wild or green.',
        'Move slowly and watch for animals.',
        'At home, light a candle and say the month’s name.',
        'Write what you saw.',
      ],
    },
    correspondences: { deities: ['Cernunnos'], herbs: ['Oak'], colors: ['Brown', 'Green'], symbols: ['The deer', 'Antlers'] },
    sources: [
      'https://en.wikipedia.org/wiki/Coligny_calendar',
      'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)',
      'https://en.wikipedia.org/wiki/Pillar_of_the_Boatmen',
    ],
  },
  {
    ref: 'coligny-aedrinios',
    title: 'Aedrinios begins',
    aka: ['AEDRIN', 'Edrinios', 'Aedrinios'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary: 'The eleventh month of the Gaulish year on the Coligny bronze, a MAT month of 30 days. The name may mean “fiery” or “hot”, from aidu-, fire.',
    honours: 'The bronze names no gods for its months.',
    history: `Aedrinios is usually connected with aidu-, “fire”, “heat” (compare Old Irish áed, fire). In the default reading Aedrinios falls in early spring, an odd time for heat (unless it refers to fires lit then); in the Samhain reading it falls in late summer, which suits it better.

As always, the name, the marking and the grid are certain; the rest is interpretation.`,
    knowAndDont: {
      known: 'The name, its place and its MAT status.',
      unknown: 'The meaning, its season, and any customs.',
    },
    celebrate: [
      'Light a fire or candle safely and sit with it a while.',
      'Spend time in the sun.',
      'Record the moon and season in your journal.',
    ],
    ritual: { premade: 'green-fire-candle-scrying', title: 'Sitting with the flame' },
    correspondences: { colors: ['Red', 'Orange', 'Gold'], crystals: ['Carnelian', 'Sunstone'], symbols: ['Fire', 'Heat'] },
    sources: ['https://en.wikipedia.org/wiki/Coligny_calendar', 'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)'],
  },
  {
    ref: 'coligny-cantlos',
    title: 'Cantlos begins',
    aka: ['CANTLOS', 'Cantlos'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary: 'The twelfth and last month of the Gaulish year on the Coligny bronze, marked ANM with 29 days. The name may mean “song”, or the closing of the circle.',
    honours: 'The bronze names no gods for its months.',
    history: `Cantlos closes the year. It has been compared with Welsh cathl and Old Irish cétal, “song”, and alternatively with cant-, “circle” or “rim”: the month that rounds the year off. In the first year of the bronze’s cycle, an extra month, Quimonios, follows it before the next Samonios.

The name, its marking and its place are on the bronze; its meaning is a proposal.`,
    knowAndDont: {
      known: 'The name, its place at the end of the year and its ANM status.',
      unknown: 'The meaning, season and any customs.',
    },
    celebrate: [
      'Sing, or listen to music you love, to close the year.',
      'Read back over your Gaulish-year journal.',
      'Mend or finish something before the new year.',
    ],
    ritual: {
      title: 'Closing the circle',
      outline: [
        'At the month’s start, light a candle.',
        'Read through your journal for the year.',
        'Sing or hum a song you love.',
        'Write a short note of thanks to the year, and close the notebook.',
      ],
    },
    correspondences: { colors: ['Gold', 'Purple'], symbols: ['Song', 'The circle'] },
    sources: ['https://en.wikipedia.org/wiki/Coligny_calendar', 'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)'],
  },
  {
    ref: 'coligny-quimonios',
    title: 'Quimonios begins',
    aka: ['QVIMON', 'Quimonios', 'Intercalary month before Samonios'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary:
      'An extra (intercalary) month set before Samonios at the start of the bronze’s five-year cycle, to keep the moon months in step with the sun. Its name is read from the damaged QVIMON…, and its meaning is unknown.',
    honours: 'Nothing is known. The bronze fills the intercalary months with notes that seem to name the other months, as if summing up the year.',
    history: `A year of twelve lunar months is about eleven days short of the solar year, so lunisolar calendars add an extra month every two or three years. The Coligny bronze puts two in each five-year cycle: one before Samonios in the first year, and another before Giamonios in the third.

The first one’s heading is broken; it is read as QVIMON[IOS] or similar. Its days carry curious notes that seem to list the twelve ordinary months, which has led to suggestions that the intercalary month was a kind of summary of the year. In this reconstruction it appears when the moons and the season call for an extra month before Samonios.`,
    knowAndDont: {
      known: 'An intercalary month stands here on the bronze, with a damaged name.',
      unknown: 'Its full name, its meaning, and any customs.',
    },
    celebrate: [
      'Treat it as a between-month: a time to rest, review and prepare for the new year.',
      'Read back over the year that has ended.',
      'Do nothing new; tidy, mend, wait.',
    ],
    ritual: {
      title: 'A between-month',
      outline: [
        'Light a candle at the month’s start.',
        'Name each of the twelve months aloud and say one thing about each from your journal.',
        'Leave the next month’s page blank until Samonios.',
      ],
    },
    correspondences: { colors: ['Grey', 'Silver'], symbols: ['The threshold', 'The extra moon'] },
    sources: [
      'https://en.wikipedia.org/wiki/Coligny_calendar',
      'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)',
      'P.-M. Duval and G. Pinault, Recueil des inscriptions gauloises III: Les calendriers (Paris: CNRS, 1986)',
    ],
  },
  {
    ref: 'coligny-rantaranos',
    title: 'Rantaranos begins',
    aka: ['…ANTARAN…', 'Rantaranos', 'Bantaranos', 'Ciallos', 'Intercalary month before Giamonios'],
    tradition: 'Gaulish (Coligny calendar, reconstructed)',
    summary:
      'The extra (intercalary) month set between Cutios and Giamonios in the third year of the bronze’s cycle. Only …ANTARAN… survives of its name; its meaning is unknown.',
    honours: 'Nothing is known.',
    history: `The second intercalary month stands in the middle of the third year, between Cutios and Giamonios. Only part of its name survives, …ANTARAN…, with the first letter read as R, B or S; some modern calendars call it Ciallos, from a word in its heading whose meaning is also unclear.

Its position is one of the few things that tells us how the calendar worked: the extra month could go mid-year, so the calendar adjusted twice per cycle. In this reconstruction it appears when Giamonios would otherwise start a month too early for its season.`,
    knowAndDont: {
      known: 'An intercalary month stands here on the bronze; part of its name survives.',
      unknown: 'Its full name, meaning, and any customs.',
    },
    celebrate: [
      'Treat it as a pause at the middle of the year.',
      'Review the half-year and rest before the second half begins.',
      'Note the moon and season in your journal.',
    ],
    ritual: {
      title: 'A mid-year pause',
      outline: [
        'Light a candle at the month’s start.',
        'Read back over the half-year in your journal.',
        'Choose one thing to let go of before Giamonios.',
        'Leave a blank page for the extra month, and write in it only what you notice.',
      ],
    },
    correspondences: { colors: ['Grey', 'Silver'], symbols: ['The extra moon', 'The middle of the year'] },
    sources: [
      'https://en.wikipedia.org/wiki/Coligny_calendar',
      'G. S. Olmsted, The Gaulish Calendar (Bonn: Habelt, 1992)',
      'P.-M. Duval and G. Pinault, Recueil des inscriptions gauloises III: Les calendriers (Paris: CNRS, 1986)',
    ],
  },
  // ───────────────────────── THE MOON ─────────────────────────
  {
    ref: 'moon-new',
    title: 'New Moon',
    aka: ['Conjunction', 'Noumenia (Greek)', 'Amavasya (Hindu, the day before)', 'Rosh Chodesh (Hebrew)'],
    tradition: 'The moon',
    summary:
      'The moment the Moon passes between the Earth and the Sun, its lit side turned away from us: the start of a new lunar month. It cannot be seen; within a day or two a thin crescent appears at dusk.',
    honours:
      'The Moon at the start of her road. Many cultures have counted their months from here, or from the first crescent just after: Greek households honoured Hekate and the household gods at the turn of the month, the Hebrew Bible keeps the new moon as a holy day, and the Chinese and Hindu (amānta) months begin with it.',
    history: `Astronomically, new moon is the instant of conjunction, when the Moon’s longitude equals the Sun’s. The Moon is then too close to the Sun’s glare to be seen (except in a solar eclipse, which can only happen at new moon). In the app, the moon is called “new” within about 18 hours of that instant; the days of invisibility just before are the dark moon.

Ancient calendars marked the month’s start either at this invisible moment or at the first sighting of the crescent. Athens kept the Noumenia (“new moon”) as the first day of the month, with offerings to the household gods; the Roman Kalends were originally announced by a priest when the new crescent was seen; Israel kept the new moon (Rosh Chodesh) with offerings and trumpets, still a minor holiday in Judaism. The Chinese calendar begins each month on the day of conjunction, so the Lunar New Year is a new moon.

The modern witch’s new moon, for setting intentions and beginning things, is a 20th-century practice, from Wicca and the wider New Age; it rests on an old and widespread instinct that beginnings belong with the moon’s return, but there is no ancient rite of “new moon intentions” behind it. Folk custom, for its part, often held the moon’s first days lucky for starting things and for showing the new moon a silver coin.`,
    knowAndDont: {
      known:
        'The astronomy is exact. The Greek Noumenia, the Roman Kalends, Rosh Chodesh and the lunar months of China and India are well documented.',
      unknown:
        'There is no good scientific evidence that the new moon itself affects people’s moods or luck. “Intention setting” at the new moon is a modern practice, not an ancient one, though no worse for that.',
    },
    celebrate: [
      'Write down what you want to begin this month, and keep the page somewhere you’ll see it.',
      'Clean one place: a shelf, an altar, your desk.',
      'Watch the western sky at dusk over the next two evenings for the first thin crescent.',
      'Make a household offering, as the Greeks did on the Noumenia: a little incense, a candle, some bread.',
      'Plan meals, work or study for the month ahead.',
    ],
    ritual: { premade: 'cosmic-new-moon-intentions' },
    correspondences: {
      deities: ['Hekate', 'Selene', 'Artemis', 'Thoth'],
      herbs: ['Mugwort', 'Jasmine', 'Lemon Balm'],
      crystals: ['Moonstone', 'Labradorite', 'Clear Quartz'],
      colors: ['White', 'Silver', 'Black'],
      foods: ['Bread', 'Seeds', 'Water'],
      symbols: ['The empty circle', 'Seeds', 'A blank page'],
    },
    sources: [
      'J. Meeus, Astronomical Algorithms (2nd ed., 1998), ch. 49',
      'https://en.wikipedia.org/wiki/New_moon',
      'https://en.wikipedia.org/wiki/Noumenia',
      'https://en.wikipedia.org/wiki/Rosh_Chodesh',
      'Varro, On the Latin Language 6.27, and Macrobius, Saturnalia 1.15 (the Kalends announced at the new moon)',
    ],
  },
  {
    ref: 'moon-waxing-crescent',
    title: 'Waxing Crescent',
    aka: ['Young moon', 'New crescent', 'Hilal'],
    tradition: 'The moon',
    summary:
      'The thin, growing crescent seen in the western sky after sunset in the days after new moon: the first light of the lunar month, by which many calendars still begin their months.',
    honours:
      'The young Moon. Islam begins each month with the sighting of the new crescent (hilal), and so did the old Hebrew, Babylonian and many other calendars. Its slim bow became the emblem of Artemis and Diana, and later of Mary as the woman “with the moon under her feet”.',
    history: `Astronomically the waxing crescent lasts from just after new moon to first quarter, about a week, with the lit part growing from a sliver to half the disc. It is seen only in the evening, setting a little later each night. Often the rest of the disc glows faintly too: earthshine, sunlight reflected from the Earth, which Leonardo da Vinci first explained.

The first sighting of the crescent is one of the oldest calendar events in the world. Babylonian astronomers kept careful records of it; Islamic months still begin when it is seen (or, in many countries, when it is calculated to be visible), so the start and end of Ramadan depend on it. Jewish tradition says a blessing over the waxing moon (Kiddush Levana) between about the third and fifteenth days of the month.

Folk custom across Europe greeted the new crescent: bowing to it, turning silver in the pocket, making a wish, and not seeing it first through glass, which was unlucky. Almanac gardeners sow leafy crops in this first week. The modern witch’s use of the waxing moon for growth and attraction builds on this old sense that what grows with the moon will thrive.`,
    knowAndDont: {
      known: 'The astronomy, the crescent-based calendars and the folk customs of greeting the new moon are well documented.',
      unknown: 'Folk and modern ideas that things begun now will grow are customs and beliefs, not demonstrated effects.',
    },
    celebrate: [
      'Look for the crescent low in the west after sunset, and greet it: bow, wave, or make a wish, as people have for centuries.',
      'Turn a silver coin in your pocket when you first see it.',
      'Start a small habit you want to grow with the month.',
      'Sow seeds of leafy greens, if the season allows.',
    ],
    ritual: { premade: 'cosmic-waxing-moon-growth-jar' },
    correspondences: {
      deities: ['Artemis', 'Diana', 'Selene'],
      herbs: ['Basil', 'Mint', 'Jasmine'],
      crystals: ['Moonstone', 'Green Aventurine', 'Citrine'],
      colors: ['White', 'Silver', 'Green'],
      foods: ['Sprouts', 'Fresh greens', 'Milk'],
      symbols: ['The crescent', 'Silver coins', 'A seedling'],
    },
    sources: [
      'https://en.wikipedia.org/wiki/Crescent',
      'https://en.wikipedia.org/wiki/Hilal_(crescent_moon)',
      'https://en.wikipedia.org/wiki/Kiddush_levana',
      'https://en.wikipedia.org/wiki/Earthshine',
      'I. Opie and M. Tatem, A Dictionary of Superstitions (Oxford, 1989), “moon”',
    ],
  },
  {
    ref: 'moon-first-quarter',
    title: 'First Quarter',
    aka: ['Half moon (waxing)', 'Shukla Ashtami (near it)'],
    tradition: 'The moon',
    summary:
      'The Moon a quarter of the way through its month, its right half lit (in the northern hemisphere): high in the evening sky and setting around midnight. A turning point between beginning and fullness.',
    honours:
      'The Moon at her half. Many calendars marked the quarter days: the Babylonians, the Buddhist uposatha days, and the Hindu eighth lunar day (Ashtami), on which the bright-fortnight Durga Ashtami falls. Pliny says the Gauls began their months and years on the sixth day of the moon, near this point.',
    history: `The first quarter is the instant when the Moon is 90° east of the Sun, about seven and a half days after new moon. Despite the name, half the disc is lit: “quarter” is the quarter of the cycle. It rises around noon and sets around midnight, so it is the best phase for looking at the Moon with binoculars: along the line between light and dark (the terminator), the craters stand out in long shadows.

Several calendars treat the quarter days as special. Babylonian hemerologies marked the 7th, 14th, 21st and 28th days of some months as days of caution for the king; the Theravada Buddhist uposatha days fall on the new, full and quarter moons, and lay people keep extra precepts and visit monasteries on them. The Coligny calendar of the Gauls may have begun its months here, if Pliny’s “sixth day of the moon” is read that way.

Modern astrology (after Dane Rudhyar’s The Lunation Cycle, 1967) calls the first quarter a “crisis of action”, a time to push through obstacles. That is a modern interpretation, but a useful prompt.`,
    knowAndDont: {
      known: 'The astronomy, the Buddhist quarter-day observances and the Babylonian quarter days are documented.',
      unknown: 'The meaning of the phase as a “crisis of action” is modern astrology; there is no ancient witch’s rule for the first quarter.',
    },
    celebrate: [
      'Look at the Moon through binoculars this evening, along the terminator.',
      'Check how your new-moon intentions are going, and do the hard next step.',
      'Clear an obstacle: make the call, send the email, fix the thing.',
      'Bind a wish with knots, as below.',
    ],
    ritual: { premade: 'folk-nine-knots' },
    correspondences: {
      deities: ['Artemis', 'Diana'],
      herbs: ['Bay', 'Rosemary', 'Ginger'],
      crystals: ['Carnelian', 'Tiger Eye', 'Moonstone'],
      colors: ['White', 'Red', 'Silver'],
      foods: ['Bread', 'Eggs'],
      symbols: ['The half disc', 'A knot', 'A bridge'],
    },
    sources: [
      'https://en.wikipedia.org/wiki/Lunar_phase',
      'https://en.wikipedia.org/wiki/Uposatha',
      'Pliny the Elder, Natural History 16.95 (the Gauls’ sixth day of the moon)',
      'D. Rudhyar, The Lunation Cycle (1967)',
      'F. Rochberg, The Heavenly Writing (Cambridge, 2004), on Babylonian hemerologies',
    ],
  },
  {
    ref: 'moon-waxing-gibbous',
    title: 'Waxing Gibbous',
    aka: ['Swelling moon', 'Growing moon'],
    tradition: 'The moon',
    summary:
      'The Moon more than half lit and growing toward full, in the week between first quarter and full moon: bright in the evening sky and up for most of the night.',
    honours:
      'The Moon swelling to fullness. The almanac gardener’s moon of fruiting crops, and in many traditions a time of building toward a festival: the Hindu bright-fortnight Ekadashi falls in it, and the Jewish blessing of the moon is said until mid-month.',
    history: `“Gibbous” comes from the Latin gibbus, “hump”. In this phase the Moon is more than half lit and still growing; it rises in the afternoon and is high in the sky by evening.

There are few ancient rites for this phase in particular; it is the run-up to the full moon, when many festivals were held. Folk and almanac gardening, however, gives it a clear job: sow and plant crops that bear their fruit above ground (beans, tomatoes, squash, grains) as the light swells. Roman writers already advised doing some farm tasks while the moon waxes and others while it wanes. Varro has a character say he keeps the rule his father taught him “not only in shearing my sheep, but in cutting my hair, for fear that if I have it done when the moon is waxing I may become bald.”

Modern witches use the waxing gibbous for building, refining and adding strength to work already begun. Modern astrology calls it a time of analysis and adjustment. Both are modern readings.`,
    knowAndDont: {
      known: 'The astronomy, the Roman agricultural advice (Varro, Pliny) and the long life of almanac moon-gardening are well documented.',
      unknown: 'Controlled trials have not shown that planting by the moon’s phase makes crops grow better. It remains a cherished folk practice and a good way to organise a garden.',
    },
    celebrate: [
      'Tend what you started at the new moon: water it, feed it, refine it.',
      'Sow or plant fruiting crops, if the season allows.',
      'Take an evening walk by moonlight.',
      'Cook something that rises: bread or a cake.',
    ],
    ritual: { premade: 'green-planting-by-the-moon' },
    correspondences: {
      deities: ['Selene', 'Artemis'],
      herbs: ['Basil', 'Cinnamon', 'Calendula'],
      crystals: ['Citrine', 'Green Aventurine', 'Pyrite'],
      colors: ['Green', 'Gold', 'Silver'],
      foods: ['Bread', 'Honey', 'Fruit'],
      symbols: ['The swelling disc', 'Rising dough', 'Fruit on the vine'],
    },
    sources: [
      'Varro, On Agriculture 1.37 (Loeb, 1934, public domain): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Varro/de_Re_Rustica/1*.html',
      'Pliny the Elder, Natural History, Book 18 (on the moon and farming)',
      'https://en.wikipedia.org/wiki/Lunar_phase',
      'https://en.wikipedia.org/wiki/Kiddush_levana',
    ],
  },
  {
    ref: 'moon-full',
    title: 'Full Moon',
    aka: ['Purnima (Hindu)', 'Esbat (Wiccan)', 'Uposatha (Buddhist)'],
    tradition: 'The moon',
    summary:
      'The Moon opposite the Sun, its whole face lit: it rises at sunset and shines all night. The most celebrated phase in the world’s calendars, and the night of the modern witch’s esbat.',
    honours:
      'The Moon in her fullness. Across cultures the full moon carries great festivals: Passover and Sukkot begin at it, Easter is set by it, the Buddha’s birth, awakening and passing are kept at the Vesak full moon, the Chinese Mid-Autumn and Lantern festivals fall on it, and Hindu Purnima carries Holi, Guru Purnima and Raksha Bandhan. Selene, Artemis, Diana and later Isis and Hekate were all hailed as the shining Moon.',
    history: `Astronomically, full moon is the instant when the Moon is 180° from the Sun. It rises around sunset and sets around sunrise. A lunar eclipse can only happen at full moon, when the Moon passes through the Earth’s shadow. Near the autumn equinox, full moons rise at nearly the same time on several evenings, giving the “Harvest Moon” its long, useful light.

Full-moon festivals are ancient and worldwide; see above. The names given to each month’s full moon in the Old Farmer’s Almanac (Wolf, Snow, Worm, Pink…) are a modern compilation mixing Algonquian, colonial and European names, popularised in the 20th century.

The full moon as the witches’ meeting comes into English print with Charles Leland’s Aradia (1899), where Aradia tells her followers: “Whenever ye have need of anything, / Once in the month, and when the moon is full, / Ye shall assemble in some desert place”. Margaret Murray called the witches’ regular meetings “esbats” (1921), and Gerald Gardner’s Wicca made the full-moon esbat central from the 1950s. So the esbat is modern, built from a 19th-century folklorist’s source and 20th-century practice. Charging crystals and making moon water are also modern.

The belief that the full moon brings madness (lunacy) is old. Studies of hospital admissions, crime and births mostly find no reliable effect, though a few find people sleep a little less around the full moon.`,
    knowAndDont: {
      known: 'The astronomy, and the many full-moon festivals of living religions, are well documented; so are the modern origins of the esbat.',
      unknown: 'Popular claims about the full moon’s effects on mood, behaviour and births are not supported by most studies.',
    },
    celebrate: [
      'Go outside and look: watch it rise at sunset, huge and coloured near the horizon.',
      'Leave a jar of water in the moonlight if you like making moon water (for washing or plants, not drinking unless it’s clean tap water in a clean jar).',
      'Give thanks for what has come to fullness this month.',
      'Gather with friends, or keep an esbat alone.',
      'If a festival falls on this full moon in a living tradition, learn about it, or join if you’re invited.',
    ],
    ritual: { premade: 'wicca-full-moon-esbat' },
    correspondences: {
      deities: ['Selene', 'Artemis', 'Diana', 'Isis', 'Hekate'],
      herbs: ['Jasmine', 'Mugwort', 'Rose', 'Willow'],
      crystals: ['Moonstone', 'Selenite', 'Clear Quartz', 'Opal'],
      colors: ['White', 'Silver'],
      foods: ['Round cakes', 'Milk', 'White wine or juice', 'Moon cakes'],
      symbols: ['The full disc', 'Water in a bowl', 'The mirror'],
    },
    sources: [
      'C. G. Leland, Aradia, or the Gospel of the Witches (1899), ch. 1 (public domain): https://archive.org/details/aradiaorgospelw00lelagoog',
      'M. Murray, The Witch-Cult in Western Europe (1921)',
      'R. Hutton, The Triumph of the Moon (Oxford, 1999)',
      'https://en.wikipedia.org/wiki/Full_moon',
      'https://en.wikipedia.org/wiki/Lunar_effect',
    ],
  },
  {
    ref: 'moon-waning-gibbous',
    title: 'Waning Gibbous',
    aka: ['Disseminating moon (modern astrology)'],
    tradition: 'The moon',
    summary:
      'The Moon past full, still more than half lit but shrinking, in the week before last quarter: rising later each evening and still bright in the morning sky.',
    honours:
      'The Moon beginning to give back her light. The Hindu dark fortnight (Krishna paksha) begins now; its first half carries the fortnight of the ancestors (Pitru Paksha) once a year.',
    history: `After full moon, the lit part shrinks from the right (in the northern hemisphere). The waning gibbous rises an hour or so later each night, so it is often seen in the morning sky after sunrise.

Few traditions single this phase out. Almanac gardeners use the waning moon for planting roots and bulbs, for harvesting crops meant to keep, for pruning and for drying herbs, the idea being that the sap and moisture are drawn down. Varro and other Roman writers already advised harvesting grain and cutting wood in the waning moon.

Modern astrology calls it the “disseminating” phase, a time to share what has been learned. Modern witches often use it for gratitude, sharing, cleansing and the beginning of letting go. These are modern frameworks, but they fit the shape of the month well.`,
    knowAndDont: {
      known: 'The astronomy, the Hindu fortnights, and the long almanac tradition of waning-moon gardening are documented.',
      unknown: 'There is no evidence that crops harvested or herbs dried in the waning moon keep better; it is a folk rule.',
    },
    celebrate: [
      'Share something you have: knowledge, food, time.',
      'Cleanse and recharge your tools or stones.',
      'Harvest and dry herbs, or plant bulbs and roots.',
      'Write down what you learned this month.',
    ],
    ritual: { premade: 'crystal-cleanse-and-charge' },
    correspondences: {
      deities: ['Selene', 'Hekate'],
      herbs: ['Sage', 'Rosemary', 'Lavender'],
      crystals: ['Amethyst', 'Smoky Quartz', 'Selenite'],
      colors: ['Silver', 'Purple', 'Blue'],
      foods: ['Root vegetables', 'Soup', 'Herbal tea'],
      symbols: ['Drying herbs', 'An open hand'],
    },
    sources: [
      'Varro, On Agriculture 1.37 (Loeb, 1934, public domain): https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Varro/de_Re_Rustica/1*.html',
      'D. Rudhyar, The Lunation Cycle (1967)',
      'https://en.wikipedia.org/wiki/Lunar_phase',
    ],
  },
  {
    ref: 'moon-last-quarter',
    title: 'Last Quarter',
    aka: ['Third quarter', 'Half moon (waning)', 'Krishna Ashtami (near it)'],
    tradition: 'The moon',
    summary:
      'The Moon three-quarters of the way through its month, its left half lit (in the northern hemisphere): rising around midnight and high in the morning sky. A turning point toward release and rest.',
    honours:
      'The Moon at her waning half. In the Hindu calendar the dark eighth day (Krishna Ashtami) falls near it: Krishna was born at midnight on the dark eighth of Bhadrapada, as the half moon rose, and Janmashtami keeps his birth then. Buddhist uposatha days and the Babylonian quarter days fall here too.',
    history: `The last (or third) quarter is the instant when the Moon is 90° west of the Sun, about 22 days into the month. Half the disc is lit; it rises around midnight and sets around noon, so it is a morning moon, often seen in daylight.

As with the first quarter, several calendars marked it: the Theravada uposatha, Babylonian days of caution, and the Hindu Ashtami. Each month’s dark Ashtami is Kalashtami, for Bhairava, a fierce form of Shiva.

Modern witchcraft uses the last quarter for releasing, breaking habits, banishing and clearing. Folk gardening uses it for weeding and cutting back. Modern astrology calls it a “crisis of consciousness”, a time to reassess.`,
    knowAndDont: {
      known: 'The astronomy, the Hindu Ashtami festivals and the Buddhist quarter days are documented.',
      unknown: 'The idea that release-work is stronger now is modern practice, not ancient rule.',
    },
    celebrate: [
      'Let go of one thing: a habit, a grudge, a cluttered drawer.',
      'Weed the garden.',
      'Look for the half moon in the morning sky.',
      'Review the month and decide what not to carry forward.',
    ],
    ritual: { premade: 'cosmic-waning-moon-release' },
    correspondences: {
      deities: ['Hekate', 'Persephone'],
      herbs: ['Rosemary', 'Sage', 'Garlic'],
      crystals: ['Smoky Quartz', 'Obsidian', 'Black Tourmaline'],
      colors: ['Grey', 'Black', 'Silver'],
      foods: ['Soup', 'Bitter greens'],
      symbols: ['Untied knots', 'The broom', 'The half disc'],
    },
    sources: [
      'https://en.wikipedia.org/wiki/Lunar_phase',
      'https://en.wikipedia.org/wiki/Krishna_Janmashtami',
      'https://en.wikipedia.org/wiki/Uposatha',
      'D. Rudhyar, The Lunation Cycle (1967)',
    ],
  },
  {
    ref: 'moon-waning-crescent',
    title: 'Waning Crescent',
    aka: ['Old moon', 'Balsamic moon (modern astrology)'],
    tradition: 'The moon',
    summary:
      'The last thin crescent, seen in the east before dawn in the days before new moon: the old moon fading, a time for clearing, finishing and rest.',
    honours:
      'The old Moon. In ancient Egypt the lunar month began on the morning the old crescent could no longer be seen; in Athens the month’s last day belonged to Hekate and the restless dead.',
    history: `The waning crescent shrinks from half to nothing over the last week of the month. It rises before the Sun and is seen only in the dawn sky, a little closer to the sunrise each morning, until it disappears.

The Egyptian lunar calendar watched for this last crescent: the first day of the lunar month (pesdjentyu) was the morning it could no longer be seen. The Athenians counted the last ten days of the month backwards, and the last day belonged to Hekate. In folk practice, the waning moon was the time for cutting, cleaning, weeding and ending things.

Modern astrology (Rudhyar) calls this the “balsamic” phase, of healing and surrender; modern witches use it for banishing, cleansing, rest and preparation for the new cycle. These frameworks are modern; the instinct to finish and clear at the month’s end is very old.`,
    knowAndDont: {
      known: 'The astronomy, the Egyptian lunar month rule (Parker) and the Greek month’s end are documented.',
      unknown: 'No evidence shows that cleansing or banishing works better now; it is a fitting custom.',
    },
    celebrate: [
      'Get up early once and look for the old crescent in the east before sunrise.',
      'Sweep and clean the house thoroughly.',
      'Finish small tasks before the new month.',
      'Rest more; go to bed early.',
    ],
    ritual: { premade: 'kitchen-sweeping-out-the-old' },
    correspondences: {
      deities: ['Hekate', 'Nyx'],
      herbs: ['Rosemary', 'Lavender', 'Chamomile'],
      crystals: ['Amethyst', 'Smoky Quartz', 'Lepidolite'],
      colors: ['Grey', 'Black', 'Indigo'],
      foods: ['Herbal tea', 'Simple broth'],
      symbols: ['The broom', 'The old crescent', 'Dawn'],
    },
    sources: [
      'R. A. Parker, The Calendars of Ancient Egypt (Chicago, 1950)',
      'https://en.wikipedia.org/wiki/Attic_calendar',
      'D. Rudhyar, The Lunation Cycle (1967)',
      'https://en.wikipedia.org/wiki/Lunar_phase',
    ],
  },
  {
    ref: 'moon-dark',
    title: 'Dark Moon',
    aka: ['The dark of the moon', 'Interlunium', 'Hekate’s Deipnon (Greek)', 'Amavasya (Hindu)'],
    tradition: 'The moon',
    summary:
      'The night or two before new moon when the Moon cannot be seen at all, lost in the Sun’s glare: the quiet, hidden end of the lunar month.',
    honours:
      'The Moon hidden. In Athens, the last day of the month was Hekate’s: a supper (deipnon) was left for her at the crossroads, and the house was cleansed. Hindu Amavasya, the ancestors’ day, falls here. Many modern witches honour Hekate, the crone and the dead at the dark moon.',
    history: `Astronomers don’t name a “dark moon” phase; the term is popular and pagan usage for the days around conjunction when the Moon is too close to the Sun to see, usually one to three nights. In the app it is the last nights of the month before new moon. In some modern pagan usage “new moon” means the first crescent and “dark moon” the conjunction itself, which can confuse: here, the dark moon comes first and the new moon is the conjunction.

Old practices for this time are among the best attested of any moon customs. Athenians kept Hekate’s Deipnon on the month’s last day, leaving food at the crossroads, and carried out the leavings of the household’s purifications with it. Pliny advises that timber be felled at the interlunium, when the Moon is with the Sun, to keep it free of rot. Hindu tradition makes Amavasya a day for the ancestors, and many avoid beginning new ventures on it.

Modern witches often use the dark moon for rest, divination, shadow work, banishing and honouring the dead, or keep it as a night without spellwork at all.`,
    knowAndDont: {
      known: 'The Greek Deipnon, the Hindu Amavasya and Roman advice on timber are documented.',
      unknown: '“Dark moon” as a phase is popular usage, not astronomy, and how many nights it lasts depends on the sky and the observer. Its modern uses for shadow work are modern.',
    },
    celebrate: [
      'Rest: a night with no tasks and no spellwork, if you like.',
      'Clean the house, take out the rubbish and empty the bins.',
      'Leave a small supper for Hekate at your door or a crossroads, and don’t take it back.',
      'Journal honestly about the month.',
      'Look at the stars: the dark moon is the best time for stargazing.',
    ],
    ritual: { premade: 'cosmic-dark-moon-rest-shadow' },
    correspondences: {
      deities: ['Hekate', 'Nyx', 'Persephone', 'Hel'],
      herbs: ['Mugwort', 'Wormwood', 'Myrrh', 'Cypress'],
      crystals: ['Obsidian', 'Black Tourmaline', 'Jet', 'Smoky Quartz'],
      colors: ['Black', 'Indigo', 'Silver'],
      foods: ['Eggs', 'Bread', 'Garlic (left for Hekate, not where animals can eat it)'],
      symbols: ['The crossroads', 'The key', 'The torch', 'Stars'],
    },
    sources: [
      'https://en.wikipedia.org/wiki/Deipnon',
      'Pliny the Elder, Natural History 16.74 (felling timber at the interlunium)',
      'https://en.wikipedia.org/wiki/Amavasya',
      'R. Hutton, The Triumph of the Moon (Oxford, 1999)',
    ],
  },
];
