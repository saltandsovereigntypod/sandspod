// The seven planets of the days and hours, in depth: their nature, what
// they rule, their metals, colours, herbs, stones and incense, the angels
// of the old grimoires and the gods linked to them across traditions, and
// the magic each suits. Herbs, stones and deities are named as they are in
// the Living Library, so the screens can link straight to those entries.
//
// Sourcing, said plainly: the correspondences are the common ones of
// Western ceremonial and folk magic (chiefly Agrippa's Three Books of
// Occult Philosophy, 1533, and the Heptameron attributed to Peter of Abano,
// 1496), with modern additions marked as such. The gods are those whom the
// planets or weekdays were named for, or whom traditions themselves tie to
// that light; they are not interchangeable, and each has their own
// tradition to be approached through.

import type { Classical } from './signs.ts';

/**
 * How a god came to be tied to a planet. 'ancient': attested in antiquity or
 * the tradition's own sources (the planet or weekday named for them, their
 * own lore, the old astrologers); 'modern': a link made in modern practice
 * and not found in their own lore. Where the evidence is unsure, 'modern'.
 */
export type DeityLink = 'ancient' | 'modern';

export const DEITY_LINK_LABEL: Record<DeityLink, string> = { ancient: 'Ancient link', modern: 'Modern link' };

export type PlanetDeity = { name: string; tradition: string; note: string; link: DeityLink };

export type PlanetGuide = {
  planet: Classical;
  day: string;
  /** The weekday's name in other tongues, which carries the old planets and gods. */
  dayNames: string;
  nature: string;
  rules: string;
  body: string;
  metal: string;
  colours: string[];
  /** Names as in the Living Library. */
  herbs: string[];
  stones: string[];
  incense: string[];
  /** Agrippa's planetary magic square, and its constant. */
  square: string;
  angel: { name: string; source: string };
  intelligence: string;
  deities: PlanetDeity[];
  /** What workings it suits. */
  suits: string;
  /** What it isn't the best time for. */
  avoid: string;
  sourcing: string;
};

const HEPTAMERON = 'the Heptameron (attributed to Peter of Abano, printed 1496)';
const AGRIPPA = 'Agrippa, Three Books of Occult Philosophy II.22 (1533)';

export const PLANET_GUIDES: Record<Classical, PlanetGuide> = {
  Sun: {
    planet: 'Sun',
    day: 'Sunday',
    dayNames: 'Sunday (Old English Sunnandæg, the Sun\'s day); Sonntag; zondag; Latin dies Solis; in Romance languages the Lord\'s day (domingo, dimanche).',
    nature: 'Hot, dry and bright: the giver of life and the source of all the other lights in the old cosmos. The Sun is will, vitality, honour and clarity; what it shines on is seen and named. In the chart it is the self we grow into; in magic, the power that blesses, heals and makes things succeed.',
    rules: 'Leo; exalted in Aries. Kings, leaders, fathers, gold, fame, confidence, the heart\'s courage.',
    body: 'The heart, the eyes (especially the right), the spine and vitality.',
    metal: 'Gold',
    colours: ['gold', 'yellow', 'orange'],
    herbs: ['Bay', 'Calendula', 'Chamomile', 'Cinnamon', 'Frankincense', 'Rosemary', 'St John’s Wort', 'Sunflower', 'Saffron', 'Oak'],
    stones: ['Citrine', 'Carnelian', 'Sunstone', 'Tiger Eye', 'Amber', 'Pyrite', 'Clear Quartz'],
    incense: ['frankincense', 'copal', 'cinnamon', 'bay'],
    square: '6 × 6, each line adding to 111',
    angel: { name: 'Michael', source: HEPTAMERON },
    intelligence: 'Nakhiel',
    deities: [
      { name: 'Ra', tradition: 'Egyptian', note: 'The sun god whose boat crosses the day and the underworld night.', link: 'ancient' },
      { name: 'Helios', tradition: 'Greek', note: 'The Sun himself, all-seeing witness of oaths.', link: 'ancient' },
      { name: 'Sol', tradition: 'Roman', note: 'Sol Invictus, whose day became Sunday.', link: 'ancient' },
      { name: 'Apollo', tradition: 'Greek', note: 'Linked with the Sun in later antiquity: light, healing, music, prophecy.', link: 'ancient' },
      { name: 'Sól', tradition: 'Norse', note: 'The Sun as a goddess driving her chariot, chased by a wolf.', link: 'ancient' },
      { name: 'Surya', tradition: 'Hindu', note: 'The Sun among the Navagraha, the nine planetary deities.', link: 'ancient' },
      { name: 'Amaterasu', tradition: 'Shinto', note: 'The Sun goddess, ancestor of the imperial line.', link: 'ancient' },
      { name: 'Saulė', tradition: 'Baltic', note: 'The Sun goddess of Lithuanian and Latvian song.', link: 'ancient' },
      { name: 'Shamash', tradition: 'Mesopotamian', note: 'The Sun as god of justice and seeing.', link: 'ancient' },
    ],
    suits: 'Success, confidence, health and vitality, career and recognition, favour from those in authority, blessing new ventures, joy, clearing gloom.',
    avoid: 'Secrecy, hiding and quiet banishing; the Sun shows everything.',
    sourcing: `${AGRIPPA}; ${HEPTAMERON}; herbs and stones as in the Living Library.`,
  },
  Moon: {
    planet: 'Moon',
    day: 'Monday',
    dayNames: 'Monday (Mōnandæg, the Moon\'s day); Montag; lundi, lunes, lunedì (Latin dies Lunae).',
    nature: 'Cold, moist and changeable: the nearest light, gathering the others\' influences and passing them to Earth. The Moon is feeling, memory, the body\'s tides, dreams and the home. In magic it governs timing itself (waxing and waning), intuition, water and the night.',
    rules: 'Cancer; exalted in Taurus. Mothers, the people, travel by water, silver, dreams, the home.',
    body: 'The breasts, stomach, womb and the body\'s fluids; the left eye.',
    metal: 'Silver',
    colours: ['silver', 'white', 'pale blue'],
    herbs: ['Jasmine', 'Mugwort', 'Lemon Balm', 'Willow', 'Sandalwood', 'Myrrh'],
    stones: ['Moonstone', 'Selenite', 'Labradorite', 'Aquamarine', 'Opal', 'Celestite'],
    incense: ['jasmine', 'sandalwood', 'myrrh', 'mugwort'],
    square: '9 × 9, each line adding to 369',
    angel: { name: 'Gabriel', source: HEPTAMERON },
    intelligence: 'Malkah be-Tharshishim',
    deities: [
      { name: 'Selene', tradition: 'Greek', note: 'The Moon herself, driving her silver chariot.', link: 'ancient' },
      { name: 'Artemis', tradition: 'Greek', note: 'Joined with the Moon from the classical period on.', link: 'ancient' },
      { name: 'Diana', tradition: 'Roman', note: 'Queen of the night in later Roman and modern witchcraft.', link: 'ancient' },
      { name: 'Hekate', tradition: 'Greek', note: 'Linked with the Moon in late antiquity and modern practice; a goddess of crossroads first.', link: 'ancient' },
      { name: 'Máni', tradition: 'Norse', note: 'The Moon as a god, brother of Sól.', link: 'ancient' },
      { name: 'Khonsu', tradition: 'Egyptian', note: 'The Moon as wanderer and healer.', link: 'ancient' },
      { name: 'Nanna', tradition: 'Mesopotamian', note: 'Sîn, the Moon god of Ur.', link: 'ancient' },
      { name: 'Chang’e', tradition: 'Chinese', note: 'The lady in the Moon of the Mid-Autumn Festival.', link: 'ancient' },
      { name: 'Tsukuyomi', tradition: 'Shinto', note: 'The Moon god, brother of Amaterasu.', link: 'ancient' },
      { name: 'Mėnulis', tradition: 'Baltic', note: 'The Moon, husband of Saulė.', link: 'ancient' },
    ],
    suits: 'Dreamwork, divination, intuition, home and family, emotional healing, cleansing, water magic, travel, fertility, anything timed to the phase.',
    avoid: 'Firm, lasting decisions and contracts; the Moon changes.',
    sourcing: `${AGRIPPA}; ${HEPTAMERON}; herbs and stones as in the Living Library.`,
  },
  Mars: {
    planet: 'Mars',
    day: 'Tuesday',
    dayNames: 'Tuesday (Tīwesdæg, Tiw\'s day, the Germanic sky and war god matched with Mars); Dienstag; mardi, martes, martedì (dies Martis).',
    nature: 'Hot, dry and sharp: the force that cuts, separates, defends and drives. Mars is courage, anger, desire and effort. In magic it protects, banishes, breaks bonds and gives strength for hard things.',
    rules: 'Aries and Scorpio; exalted in Capricorn. Soldiers, surgeons, smiths, iron and fire, conflict and competition.',
    body: 'The blood, muscles, head, gall bladder and genitals; fevers and cuts.',
    metal: 'Iron',
    colours: ['red', 'scarlet', 'rust'],
    herbs: ['Basil', 'Nettle', 'Garlic', 'Black Pepper', 'Dragon’s Blood', 'Ginger', 'Rue', 'Hawthorn'],
    stones: ['Garnet', 'Hematite', 'Bloodstone', 'Red Jasper'],
    incense: ['dragon\'s blood', 'pine', 'black pepper', 'tobacco (offered, not smoked)'],
    square: '5 × 5, each line adding to 65',
    angel: { name: 'Samael', source: HEPTAMERON },
    intelligence: 'Graphiel',
    deities: [
      { name: 'Ares', tradition: 'Greek', note: 'War\'s fury and courage.', link: 'ancient' },
      { name: 'Mars', tradition: 'Roman', note: 'War and also a guardian of fields and boundaries; father of Rome.', link: 'ancient' },
      { name: 'Tyr', tradition: 'Norse', note: 'The god of oaths and justice behind Tuesday.', link: 'ancient' },
      { name: 'Tiw', tradition: 'Anglo-Saxon', note: 'Tyr\'s English name, kept in Tuesday.', link: 'ancient' },
      { name: 'Sekhmet', tradition: 'Egyptian', note: 'In modern practice, the fierce lioness of plague and healing (Egypt\'s own Mars was Horus the Red).', link: 'modern' },
      { name: 'Perun', tradition: 'Slavic', note: 'In modern practice, for thunder and the warrior\'s strength (older comparisons match him with Jupiter, if anyone).', link: 'modern' },
      { name: 'Hachiman', tradition: 'Shinto', note: 'In modern practice, as protector and god of archery and war (not a planetary deity in his own lore).', link: 'modern' },
    ],
    suits: 'Courage, protection, defence, banishing, cutting cords, breaking curses, physical strength, competition and getting things moving.',
    avoid: 'Reconciliation, love and peace-making (unless it is courage for them).',
    sourcing: `${AGRIPPA}; ${HEPTAMERON}; herbs and stones as in the Living Library.`,
  },
  Mercury: {
    planet: 'Mercury',
    day: 'Wednesday',
    dayNames: 'Wednesday (Wōdnesdæg, Woden\'s day, Odin matched with Mercury as guide of souls and god of words); Mittwoch; mercredi, miércoles, mercoledì (dies Mercurii).',
    nature: 'Changeable, quick and two-sided: takes on the nature of whatever it is near. Mercury is thought, speech, writing, trade, travel and cleverness, and the guide between worlds. In magic it carries messages, opens roads and sharpens the mind.',
    rules: 'Gemini and Virgo; exalted in Virgo. Scribes, merchants, students, messengers, thieves and tricksters.',
    body: 'The nerves, tongue, hands, lungs and the mind.',
    metal: 'Quicksilver (mercury). Never handle it; use its symbol or an alloy instead.',
    colours: ['orange', 'yellow', 'mixed and shimmering colours'],
    herbs: ['Lavender', 'Mint', 'Peppermint', 'Fennel', 'Lemongrass'],
    stones: ['Fluorite', 'Sodalite', 'Blue Lace Agate', 'Amazonite', 'Kyanite'],
    incense: ['lavender', 'mastic', 'lemongrass'],
    square: '8 × 8, each line adding to 260',
    angel: { name: 'Raphael', source: HEPTAMERON },
    intelligence: 'Tiriel',
    deities: [
      { name: 'Hermes', tradition: 'Greek', note: 'Messenger, guide of souls, god of roads and trade.', link: 'ancient' },
      { name: 'Mercury', tradition: 'Roman', note: 'Merchants\' and travellers\' god.', link: 'ancient' },
      { name: 'Thoth', tradition: 'Egyptian', note: 'Scribe of the gods; joined with Hermes as Hermes Trismegistus.', link: 'ancient' },
      { name: 'Odin', tradition: 'Norse', note: 'Woden of Wednesday: runes, poetry, wisdom.', link: 'ancient' },
      { name: 'Ogma', tradition: 'Celtic (Irish)', note: 'In modern practice, for eloquence and the ogham script.', link: 'modern' },
      { name: 'Nisaba', tradition: 'Mesopotamian', note: 'In modern practice, as goddess of writing and grain; Nabû was the planet\'s own god.', link: 'modern' },
    ],
    suits: 'Communication, study, exams, writing, contracts, business, travel plans, divination, road opening and quick results.',
    avoid: 'Slow, lasting work; Mercury rarely stays.',
    sourcing: `${AGRIPPA}; ${HEPTAMERON}; herbs and stones as in the Living Library.`,
  },
  Jupiter: {
    planet: 'Jupiter',
    day: 'Thursday',
    dayNames: 'Thursday (Þūnresdæg, Thunor\'s day, Thor matched with Jupiter as thunderer); Donnerstag; jeudi, jueves, giovedì (dies Iovis).',
    nature: 'Warm, moist and generous: the great benefic who enlarges and blesses. Jupiter is faith, law, wisdom, abundance and good fortune. In magic it brings growth, luck, justice and protection from on high.',
    rules: 'Sagittarius and Pisces; exalted in Cancer. Judges, priests, teachers, the wealthy, law and religion.',
    body: 'The liver, thighs, blood and growth.',
    metal: 'Tin',
    colours: ['royal blue', 'purple', 'deep green'],
    herbs: ['Clove', 'Sage', 'Nutmeg', 'Star Anise', 'Hyssop', 'Dandelion', 'Cinquefoil', 'Honeysuckle'],
    stones: ['Amethyst', 'Lapis Lazuli', 'Lepidolite', 'Iolite', 'Charoite'],
    incense: ['cedar', 'clove', 'nutmeg', 'sage'],
    square: '4 × 4, each line adding to 34',
    angel: { name: 'Sachiel', source: HEPTAMERON },
    intelligence: 'Iophiel',
    deities: [
      { name: 'Zeus', tradition: 'Greek', note: 'King of the gods, keeper of hospitality and oaths.', link: 'ancient' },
      { name: 'Jupiter', tradition: 'Roman', note: 'Best and greatest; the state\'s protector.', link: 'ancient' },
      { name: 'Thor', tradition: 'Norse', note: 'Thunderer of Thursday, friend of farmers.', link: 'ancient' },
      { name: 'Thunor', tradition: 'Anglo-Saxon', note: 'Thor\'s English name.', link: 'ancient' },
      { name: 'Marduk', tradition: 'Mesopotamian', note: 'Babylon\'s king of the gods, and the planet itself.', link: 'ancient' },
      { name: 'Perun', tradition: 'Slavic', note: 'Thunder god, matched with Jupiter by some modern writers.', link: 'modern' },
      { name: 'Taranis', tradition: 'Celtic (Gaulish)', note: 'The wheel-bearing thunderer, matched with Jupiter by the Romans.', link: 'ancient' },
    ],
    suits: 'Luck, abundance, growth, legal matters and justice, learning and teaching, generosity, spiritual expansion and blessing.',
    avoid: 'Binding and restricting; Jupiter enlarges.',
    sourcing: `${AGRIPPA}; ${HEPTAMERON}; herbs and stones as in the Living Library.`,
  },
  Venus: {
    planet: 'Venus',
    day: 'Friday',
    dayNames: 'Friday (Frīgedæg, Frigg\'s day, matched with Venus); Freitag; vendredi, viernes, venerdì (dies Veneris).',
    nature: 'Warm, moist and harmonising: the lesser benefic who joins and delights. Venus is love, beauty, pleasure, art, friendship and peace. In magic it attracts, reconciles, beautifies and makes life sweet.',
    rules: 'Taurus and Libra; exalted in Pisces. Lovers, artists, adornment, music, gardens, pleasure and peace.',
    body: 'The throat, kidneys, skin and the senses of touch and taste.',
    metal: 'Copper',
    colours: ['green', 'pink', 'rose', 'turquoise'],
    herbs: ['Rose', 'Vervain', 'Yarrow', 'Thyme', 'Vanilla', 'Violet', 'Hibiscus', 'Cardamom', 'Elder'],
    stones: ['Rose Quartz', 'Emerald', 'Jade', 'Green Aventurine', 'Malachite', 'Rhodochrosite', 'Turquoise'],
    incense: ['rose', 'benzoin', 'vanilla', 'sandalwood'],
    square: '7 × 7, each line adding to 175',
    angel: { name: 'Anael', source: HEPTAMERON },
    intelligence: 'Hagiel',
    deities: [
      { name: 'Aphrodite', tradition: 'Greek', note: 'Born of the sea foam; the planet bore her name.', link: 'ancient' },
      { name: 'Venus', tradition: 'Roman', note: 'Love, beauty and the gardens; ancestor of Rome.', link: 'ancient' },
      { name: 'Inanna', tradition: 'Mesopotamian', note: 'The morning and evening star herself, queen of heaven.', link: 'ancient' },
      { name: 'Astarte', tradition: 'Canaanite', note: 'The star goddess of love and war.', link: 'ancient' },
      { name: 'Freyja', tradition: 'Norse', note: 'Love, beauty, seiðr and war; often joined with Friday in modern practice, though the day is most likely Frigg\'s.', link: 'modern' },
      { name: 'Frigg', tradition: 'Norse', note: 'Whose name Friday most likely carries.', link: 'ancient' },
      { name: 'Hathor', tradition: 'Egyptian', note: 'Love, music, joy and the sky; the Greeks matched her with Aphrodite, but the planet is not hers in Egyptian lore.', link: 'modern' },
      { name: 'Lakshmi', tradition: 'Hindu', note: 'Beauty and abundance, honoured on Fridays in later Hindu practice (Shukra is the planet among the Navagraha).', link: 'modern' },
      { name: 'Turan', tradition: 'Etruscan', note: 'Etruscan goddess of love, matched with Venus today; no planetary link of hers survives.', link: 'modern' },
    ],
    suits: 'Love and self-love, friendship, beauty and glamour, art, harmony and reconciliation, pleasure, fertility of gardens, drawing money gently.',
    avoid: 'Fights, harsh banishing and severing; Venus joins.',
    sourcing: `${AGRIPPA}; ${HEPTAMERON}; herbs and stones as in the Living Library.`,
  },
  Saturn: {
    planet: 'Saturn',
    day: 'Saturday',
    dayNames: 'Saturday (Sæternesdæg, keeping the Roman Saturn\'s name); zaterdag; Latin dies Saturni; in Romance languages the Sabbath (sábado, samedi).',
    nature: 'Cold, dry and slow: the outermost visible planet, keeper of the boundary of the old cosmos. Saturn is time, limits, endurance, age and the ancestors. In magic it binds, banishes, protects, ends and makes things last.',
    rules: 'Capricorn and Aquarius; exalted in Libra. The old, the dead, farmers, builders, land, lead, the long view.',
    body: 'The bones, teeth, skin, spleen and the knees; chronic illness.',
    metal: 'Lead. Don\'t handle it; use its symbol, or pewter-coloured stand-ins.',
    colours: ['black', 'indigo', 'deep grey', 'brown'],
    herbs: ['Patchouli', 'Cypress', 'Comfrey', 'Mullein', 'Yew'],
    stones: ['Obsidian', 'Jet', 'Onyx', 'Black Tourmaline', 'Smoky Quartz', 'Apache Tear'],
    incense: ['myrrh', 'patchouli', 'cypress'],
    square: '3 × 3, each line adding to 15',
    angel: { name: 'Cassiel', source: HEPTAMERON },
    intelligence: 'Agiel',
    deities: [
      { name: 'Saturn', tradition: 'Roman', note: 'God of sowing and the golden age; the Saturnalia.', link: 'ancient' },
      { name: 'Kronos', tradition: 'Greek', note: 'The Titan of the harvest sickle and of time\'s devouring.', link: 'ancient' },
      { name: 'Ninurta', tradition: 'Mesopotamian', note: 'The planet\'s Babylonian god.', link: 'ancient' },
      { name: 'The Cailleach', tradition: 'Celtic (Irish)', note: 'In modern practice, a winter crone of age and endurance (not a planetary deity in her own lore).', link: 'modern' },
      { name: 'Hekate', tradition: 'Greek', note: 'In modern practice, for thresholds and protection (not a planetary deity in her own lore).', link: 'modern' },
    ],
    suits: 'Binding, banishing, boundaries, protection of the home, endings, discipline, long-term goals, ancestor work and work with the land.',
    avoid: 'Love, luck and quick beginnings; Saturn slows things.',
    sourcing: `${AGRIPPA}; ${HEPTAMERON}; herbs and stones as in the Living Library. Kronos and Ninurta are not in the Library yet.`,
  },
};

export const GUIDE_ORDER: Classical[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
