// Seasonal things for the altar, each kept for one or more festivals of the
// calendars in holidays.ts: on the Wheel of the Year, lanterns and a
// pomegranate at Samhain, the Yule log, Brigid's cross, eggs at Ostara, and
// the harvest's wheat, corn dolly, apples and gourds; in the Greek year, the
// eiresione and the pot of beans at the Pyanepsia, the thyrsus and the mask at
// Dionysus's festivals, Hekate's supper at the month's end. Each has a painted
// picture (assets/altar/objects/seasonal/<id>/<id>.png, listed by
// scripts/build-altar-artwork.mjs); one without a picture isn't offered. In
// the week before a festival from a calendar you keep (and while it runs) the
// cabinet shows its things first, and tonight's altar can set one out; the
// monthly Greek days come only the day before and on the day. The ones that
// are food go over as offerings do (offerings.ts); the rest keep. Pure, so it
// can be tested.
//
// The Norse and Heathen year has its drinking horn, Yule goat, blót bowl,
// Odin's sheaf and Midsummer birch; the Celtic year its May bush, bilberries
// and Brídeóg, which come near at the matching sabbats too; the Roman year its
// Parentalia tile and black beans for the dead, the februa and mola salsa, the
// flowers of Flora and Juno, and the tapers, cap, little figures and lamp of
// the Saturnalia; the Christian and folk year its Epiphany chalk and blessed
// water, Candlemas candles, Easter lilies and red eggs, the Lammas loaf, the
// Assumption's herb bundle, the Advent wreath and the holly and ivy. Someone
// who hides the Christian calendar in settings (holidays.ts hiddenTraditions)
// never has its things come near, and the drawer leaves them out
// (withoutHiddenCalendars). The Slavic year has its Marzanna, Kupala wreath,
// Dziady supper and the didukh, star, kutia and bread and salt of Koliada.
// The Hindu and Kemetic (Egyptian) festivals come from the traditional
// calendars (lib/calendars) rather than holidays.ts: Diwali's lamps and
// rangoli, Holi's colours, Ganesha's modak, the bilva leaves of Maha
// Shivaratri and the kalash of Navaratri; the Osiris bed, lamps, sistrum and
// blue lotus of the five days upon the year (one span, as they run), and the
// offering table of Wep Ronpet. Theirs come near only for someone who shows
// that calendar in settings (calendarFestivalsBetween). The turning
// seasons (snowdrops, blossom, wildflowers, autumn leaves) are for everyone,
// by the date rather than a calendar, north or south of the equator: the
// season's thing comes to the top of the drawer, after any festival that's
// near (seasonalNear).
//
// Another calendar's things need only a group in SEASONAL_TRADITIONS,
// entries in SEASONAL_OBJECTS naming its holidays, and their pictures (and,
// for a traditional calendar, its festivals' names in CALENDAR_FESTIVALS).

import { startOfDay } from '../calendar.ts';
import { calendarById, calendarContext, shownCalendars, type Place } from '../calendars/index.ts';
import { DEFAULT_TRADITIONS, holidaysBetween, TRADITIONS, type HolidayChoice } from '../holidays.ts';
import type { OfferingKindId } from './offerings.ts';
import type { CabinetItem, SavedObject } from './types.ts';

export type SabbatId = 'samhain' | 'yule' | 'imbolc' | 'ostara' | 'beltane' | 'litha' | 'lammas' | 'mabon';

export const SABBATS: { id: SabbatId; name: string }[] = [
  { id: 'samhain', name: 'Samhain' },
  { id: 'yule', name: 'Yule' },
  { id: 'imbolc', name: 'Imbolc' },
  { id: 'ostara', name: 'Ostara' },
  { id: 'beltane', name: 'Beltane' },
  { id: 'litha', name: 'Litha' },
  { id: 'lammas', name: 'Lammas' },
  { id: 'mabon', name: 'Mabon' },
];

export const sabbatName = (id: string) => SABBATS.find((s) => s.id === id)?.name ?? '';

/**
 * A festival a seasonal thing is kept for: a calendar from holidays.ts
 * (`'wheel'` for a sabbat, kept north or south of the equator) and the
 * holiday's id in it.
 */
export type FestivalRef = { tradition: string; holiday: string };

export type SeasonalObject = {
  id: string;
  name: string;
  festivals: FestivalRef[];
  keywords: string[];
  /** The gods it belongs to, so a search for one finds it. */
  deities?: string[];
  /** A line about it, for its tile and its panel. */
  description?: string;
  /** Food that goes over as an offering does (an offering kind in offerings.ts); absent for things that keep. */
  food?: OfferingKindId;
  /** A vessel that holds a poured or set-out offering, as a bowl or chalice does. */
  vessel?: boolean;
};

/**
 * The calendars whose festivals have seasonal things, in the drawer's order:
 * each a section of the drawer ("Wheel of the Year", "Greek festivals"),
 * the calendars in holidays.ts it covers, words it is searched by, and how
 * a calendar's holiday id names one of its festivals (by default the id
 * itself).
 */
export type SeasonalTradition = {
  id: string;
  title: string;
  calendars: string[];
  words: string[];
  festivalOf?: (holidayId: string) => string | null;
};

export const SEASONAL_TRADITIONS: SeasonalTradition[] = [
  // The Celtic year's Samhain, Lá Fhéile Bríde, Bealtaine and Lughnasadh are the sabbats under their older names.
  { id: 'wheel', title: 'Wheel of the Year', calendars: ['wheel', 'wheel_south', 'celtic'], words: ['sabbat', 'wheel of the year'], festivalOf: (id) => sabbatOfHoliday(id) },
  { id: 'hellenic', title: 'Greek festivals', calendars: ['hellenic', 'hellenic_monthly'], words: ['Greek', 'Hellenic', 'Athenian', 'festival'] },
  // Yule (Jól) shares its day with the Wheel's Yule, and comes under the Wheel's id when both are kept.
  {
    id: 'norse',
    title: 'Norse & Heathen',
    calendars: ['norse'],
    words: ['Norse', 'Heathen', 'Heathenry', 'blót', 'blot', 'Ásatrú', 'Asatru', 'Scandinavian', 'Viking'],
    festivalOf: (id) => (holidayKey(id) === 'yule' ? 'jol' : holidayKey(id)),
  },
  // The Celtic year's Imbolc and Samhain share their days with the sabbats, and come under the Wheel's ids when both are kept.
  {
    id: 'celtic',
    title: 'Celtic festivals',
    calendars: ['celtic'],
    words: ['Celtic', 'Gaelic', 'Irish', 'Scottish', 'fire festival'],
    festivalOf: (id) => CELTIC_OF_SABBAT[holidayKey(id)] ?? holidayKey(id),
  },
  { id: 'roman', title: 'Roman festivals', calendars: ['roman'], words: ['Roman', 'Rome', 'Religio Romana', 'Latin', 'festival'] },
  // A calendar someone can hide (holidays.ts HIDEABLE_TRADITIONS): then its things are left out of the drawer (withoutHiddenCalendars).
  { id: 'christian', title: 'Christian & folk calendar', calendars: ['christian'], words: ['Christian', 'folk custom', 'folk Catholic', 'feast day', 'saint', 'the church year'] },
  { id: 'slavic', title: 'Slavic festivals', calendars: ['slavic'], words: ['Slavic', 'Slavonic', 'Rodnovery', 'Slavic Native Faith', 'Polish', 'Ukrainian', 'Belarusian', 'Czech'] },
  // Traditional calendars (lib/calendars), not holidays.ts: near only while the calendar is shown (calendarFestivalsBetween).
  { id: 'hindu', title: 'Hindu festivals', calendars: ['hindu', 'calendar:hindu'], words: ['Hindu', 'Hinduism', 'Sanatana Dharma', 'Indian', 'puja', 'festival'] },
  { id: 'kemetic', title: 'Kemetic (Egyptian) festivals', calendars: ['kemetic', 'calendar:kemetic'], words: ['Kemetic', 'Kemeticism', 'Kemet', 'Egyptian', 'ancient Egypt', 'festival'] },
  // Not a calendar: the season by the date, for everyone (seasonNow).
  { id: 'seasons', title: 'The turning seasons', calendars: ['seasons'], words: ['season', 'seasons', 'the turning seasons', 'nature'] },
];

/**
 * The festivals with seasonal things from the traditional calendars
 * (lib/calendars, by the calendar's id), each by its id there without the
 * calendar's prefix ("hindu-diwali" → "diwali"), in the order of the year, as
 * the drawer names them. The Kemetic "epagomenal" is the five (or six) days
 * upon the year together, as they run one after another.
 */
export const CALENDAR_FESTIVALS: Record<string, { id: string; name: string }[]> = {
  hindu: [
    { id: 'maha-shivaratri', name: 'Maha Shivaratri' },
    { id: 'holika-dahan', name: 'Holika Dahan' },
    { id: 'holi', name: 'Holi' },
    { id: 'ganesh-chaturthi', name: 'Ganesh Chaturthi' },
    { id: 'navaratri', name: 'Navaratri' },
    { id: 'diwali', name: 'Diwali' },
  ],
  kemetic: [
    { id: 'wep-ronpet', name: 'Wep Ronpet' },
    { id: 'epagomenal', name: 'Epagomenal Days' },
    { id: 'birth-osiris', name: 'Birthday of Osiris' },
    { id: 'birth-horus', name: 'Birthday of Horus' },
    { id: 'birth-set', name: 'Birthday of Set' },
    { id: 'birth-isis', name: 'Birthday of Isis' },
    { id: 'birth-nephthys', name: 'Birthday of Nephthys' },
  ],
};

const CELTIC_OF_SABBAT: Record<string, string> = { imbolc: 'la_fheile_bride', beltane: 'bealtaine', lammas: 'lughnasadh', samhain: 'samhain_gaelic' };

export type SeasonId = 'late_winter' | 'spring' | 'summer' | 'autumn';

/**
 * The turning seasons as they come north of the equator, each from its first
 * day up to (not including) `until`, as [month (0-based), day]. South of the
 * equator each comes six months later.
 */
export const SEASONS: { id: SeasonId; name: string; from: [number, number]; until: [number, number] }[] = [
  { id: 'late_winter', name: 'Late winter', from: [0, 15], until: [2, 16] },
  { id: 'spring', name: 'Spring', from: [2, 16], until: [5, 1] },
  { id: 'summer', name: 'Summer', from: [5, 1], until: [8, 1] },
  { id: 'autumn', name: 'Autumn', from: [8, 1], until: [11, 1] },
];

const wheel = (...sabbats: SabbatId[]): FestivalRef[] => sabbats.map((holiday) => ({ tradition: 'wheel', holiday }));
const hellenic = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'hellenic', holiday }));
const monthly = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'hellenic_monthly', holiday }));
const norse = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'norse', holiday }));
const celtic = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'celtic', holiday }));
const roman = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'roman', holiday }));
const christian = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'christian', holiday }));
const slavic = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'slavic', holiday }));
const hindu = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'hindu', holiday }));
const kemetic = (...holidays: string[]): FestivalRef[] => holidays.map((holiday) => ({ tradition: 'kemetic', holiday }));
const season = (id: SeasonId): FestivalRef[] => [{ tradition: 'seasons', holiday: id }];

/** In the order each festival's things are shown, the first of each set out on tonight's altar (unless TONIGHT_FIRST says otherwise). */
export const SEASONAL_OBJECTS: SeasonalObject[] = [
  { id: 'pumpkin-lantern', name: 'Pumpkin Lantern', festivals: wheel('samhain'), keywords: ['lantern', 'guiding the dead', 'protection', 'jack o’ lantern'] },
  { id: 'turnip-lantern', name: 'Turnip Lantern', festivals: wheel('samhain'), keywords: ['lantern', 'the old ways', 'guiding the dead', 'protection'] },
  { id: 'pomegranate', name: 'Pomegranate', festivals: wheel('samhain'), keywords: ['the dead', 'Persephone', 'the underworld', 'fruit'], food: 'harvest' },
  { id: 'yule-log', name: 'Yule Log', festivals: wheel('yule'), keywords: ['the returning sun', 'hearth', 'luck', 'warmth'] },
  { id: 'evergreen-boughs', name: 'Evergreen Boughs', festivals: wheel('yule'), keywords: ['everlasting life', 'hope', 'protection', 'pine', 'holly'] },
  { id: 'brigids-cross', name: 'Brigid’s Cross', festivals: wheel('imbolc'), keywords: ['Brigid', 'hearth', 'protection', 'rushes', 'woven'] },
  { id: 'ostara-eggs', name: 'Ostara Eggs', festivals: wheel('ostara'), keywords: ['new life', 'fertility', 'beginnings', 'painted eggs'] },
  { id: 'flower-crown', name: 'Flower Crown', festivals: wheel('beltane'), keywords: ['love', 'fertility', 'blossom', 'May Queen', 'woven'] },
  { id: 'sun-wheel', name: 'Sun Wheel', festivals: wheel('litha'), keywords: ['the sun', 'strength', 'the turning year', 'woven'] },
  { id: 'wheat-sheaf', name: 'Wheat Sheaf', festivals: wheel('lammas', 'mabon'), keywords: ['first harvest', 'bread', 'plenty', 'grain', 'straw'] },
  { id: 'corn-dolly', name: 'Corn Dolly', festivals: wheel('lammas', 'mabon'), keywords: ['the harvest spirit', 'abundance', 'gratitude', 'straw', 'woven'] },
  { id: 'apples', name: 'Apples', festivals: wheel('mabon', 'samhain'), keywords: ['harvest', 'the Otherworld', 'love', 'fruit'], food: 'harvest' },
  { id: 'gourds', name: 'Gourds', festivals: wheel('mabon', 'samhain'), keywords: ['harvest', 'abundance', 'squash', 'pumpkin'], food: 'harvest' },

  // The Greek year, from the Panathenaia in high summer.
  {
    id: 'panathenaic-olive', name: 'Olive Branch and Peplos', festivals: hellenic('panathenaia'), deities: ['Athena'],
    keywords: ['olive', 'peplos', 'weaving', 'Athens', 'procession'],
    description: 'Athena’s olive, her gift to Athens, with the new robe woven for her and carried to her in procession at the Panathenaia.',
  },
  {
    id: 'kernos', name: 'Kernos', festivals: hellenic('eleusinia'), deities: ['Demeter', 'Persephone'],
    keywords: ['grain', 'seeds', 'the Mysteries', 'Eleusis', 'first fruits'],
    description: 'A ring of small cups made as one, each holding a different grain, bean or seed, carried for Demeter and Persephone at the Mysteries.',
  },
  {
    id: 'kykeon', name: 'Kykeon', festivals: hellenic('eleusinia'), deities: ['Demeter'], food: 'drink',
    keywords: ['barley', 'pennyroyal', 'the Mysteries', 'Eleusis', 'fasting'],
    description: 'Barley and water with pennyroyal, the drink Demeter took to end her fast in her grief, and that the initiates drank at the Mysteries.',
  },
  {
    id: 'eiresione', name: 'Eiresione', festivals: hellenic('pyanepsia'), deities: ['Apollo'],
    keywords: ['olive', 'wool', 'figs', 'loaves', 'harvest', 'blessing', 'the door'],
    description: 'An olive branch wound with wool and hung with figs and little loaves, carried home at the Pyanepsia and hung by the door to keep the house for a year.',
  },
  {
    id: 'pyanepsia-beans', name: 'Pot of Beans', festivals: hellenic('pyanepsia'), deities: ['Apollo'], food: 'cooked',
    keywords: ['beans', 'pulses', 'harvest', 'homecoming', 'the pot'],
    description: 'Beans and pulses boiled together in one pot, as Theseus’s crew did with the last of their food on coming home, offered to Apollo at the Pyanepsia.',
  },
  {
    id: 'thyrsus', name: 'Thyrsus', festivals: hellenic('lenaia', 'dionysia'), deities: ['Dionysus'],
    keywords: ['ivy', 'pine cone', 'fennel', 'maenads', 'ecstasy'],
    description: 'A fennel staff tipped with a pine cone and wound with ivy, carried by Dionysus and the maenads who followed him.',
  },
  {
    id: 'theatre-mask', name: 'Theatre Mask', festivals: hellenic('lenaia', 'dionysia'), deities: ['Dionysus'],
    keywords: ['theatre', 'tragedy', 'comedy', 'drama', 'the actor'],
    description: 'An actor’s mask. Tragedy and comedy were born at Dionysus’s festivals, and every play was performed in his honour.',
  },
  {
    id: 'chous', name: 'Wine Jug of the Anthesteria', festivals: hellenic('anthesteria'), deities: ['Dionysus'],
    keywords: ['chous', 'Choes', 'new wine', 'the dead', 'libation', 'jug'],
    description: 'The little jug of the Anthesteria’s second day, when the new wine was opened and drunk, and the spirits of the dead walked until the festival’s close.',
  },
  {
    id: 'amphiphon', name: 'Moon Cake with Torches', festivals: hellenic('mounichia'), deities: ['Artemis'], food: 'bread',
    keywords: ['amphiphon', 'cake', 'torches', 'the full moon', 'light'],
    description: 'A round cake ringed with small lit torches, brought to Artemis at the Mounichia to shine like the full moon.',
  },
  {
    id: 'thargelos', name: 'Thargelos', festivals: hellenic('thargelia'), deities: ['Apollo', 'Artemis'], food: 'cooked',
    keywords: ['first fruits', 'porridge', 'harvest', 'purification', 'the pot'],
    description: 'The pot of the year’s first grain and fruits boiled together, offered to Apollo and Artemis on their birthdays at the Thargelia.',
  },
  // Every month: the Noumenia, the Agathos Daimon and Hekate’s Deipnon.
  {
    id: 'phiale', name: 'Phiale', festivals: monthly('noumenia', 'agathos_daimon'), deities: ['Agathos Daimon'], vessel: true,
    keywords: ['libation', 'wine', 'offering bowl', 'household gods', 'the Good Spirit'],
    description: 'A shallow bowl without handles for pouring libations of wine, water, milk or honey to the gods, as at the new month and to the Good Spirit of the house.',
  },
  {
    id: 'thymiaterion', name: 'Thymiaterion', festivals: monthly('noumenia'), deities: ['Hestia', 'Zeus', 'Apollo'],
    keywords: ['incense burner', 'frankincense', 'household gods', 'new month', 'the new moon'],
    description: 'An incense burner, lit with frankincense for the household gods at the Noumenia, the first day of the new month.',
  },
  {
    id: 'hekates-deipnon', name: 'Hekate’s Supper', festivals: monthly('deipnon'), deities: ['Hekate'], food: 'cooked',
    keywords: ['crossroads', 'the dead', 'cleansing', 'the dark moon', 'eggs', 'garlic'],
    description: 'Bread, eggs, garlic and cake for the month’s last night, traditionally left for Hekate at a crossroads and not eaten by the household.',
  },

  // The Norse and Heathen year, from Þorrablót in midwinter.
  {
    id: 'drinking-horn', name: 'Drinking Horn', festivals: norse('thorrablot', 'disablot', 'sigrblot', 'haustblot', 'vetrnaetur', 'jol'), deities: ['Odin', 'Njörðr', 'Njord', 'Freyr'], vessel: true,
    keywords: ['mead', 'ale', 'toast', 'sumbel', 'libation', 'horn', 'bragarfull', 'Njord', 'drink offering'],
    description: 'A horn of mead or ale, passed round at the blót and poured out as an offering. The sagas tell of toasts drunk to Odin for victory, to Njörðr and Freyr for a good year and peace, and to kin gone before.',
  },
  {
    id: 'hlautbolli', name: 'Blót Bowl and Sprig', festivals: norse('disablot', 'sigrblot', 'haustblot', 'vetrnaetur'), deities: ['the dísir', 'the disir'],
    keywords: ['hlautbolli', 'hlautteinn', 'blessing', 'sprinkling', 'offering bowl', 'mead', 'hallowing', 'ancestors'],
    description: 'The hlautbolli, the bowl of the blót, with the sprig that sprinkles its offering over the altar and the folk as a blessing. Today it holds mead more often than blood.',
  },
  {
    id: 'midsummer-birch', name: 'Midsummer Birch', festivals: norse('midsummer'), food: 'flowers',
    keywords: ['birch', 'Midsommar', 'Juhannus', 'greenery', 'leaves', 'the sun', 'summer', 'the door'],
    description: 'Young birch boughs brought in at Midsummer and set by the door and the hearth, as in Sweden and Finland, to bring the green of the year’s height into the house.',
  },
  {
    id: 'odins-sheaf', name: 'Odin’s Sheaf', festivals: norse('haustblot'), deities: ['Odin', 'Sleipnir'],
    keywords: ['last sheaf', 'harvest', 'grain', 'straw', 'Wodan', 'thanksgiving', 'the field'],
    description: 'The last sheaf of the harvest, left standing in the field for Odin’s horse, as farmers in parts of Scandinavia and Germany did into the last century, so the land would give again.',
  },
  {
    id: 'yule-goat', name: 'Yule Goat', festivals: norse('jol'), deities: ['Thor'],
    keywords: ['julbock', 'julebukk', 'straw', 'red ribbon', 'woven', 'Scandinavian', 'luck', 'midwinter'],
    description: 'A goat of plaited straw bound with red ribbon, kept through Yule in Scandinavian homes. Some see in it the goats that draw Thor’s chariot across the sky.',
  },

  // The Celtic year. Its Samhain things and Brigid’s cross are with the Wheel’s.
  {
    id: 'brideog', name: 'Brídeóg', festivals: [...celtic('la_fheile_bride'), ...wheel('imbolc')], deities: ['Brigid', 'Bríd', 'Brigit'],
    keywords: ['Brideog', 'little Brigid', 'St Brigid’s Eve', 'doll', 'straw', 'rushes', 'Brigid’s bed', 'the hearth', 'Irish', 'Scottish'],
    description: 'A little Brigid of straw or rushes dressed in white, carried from door to door on St Brigid’s Eve and given a bed by the hearth to welcome her into the house.',
  },
  {
    id: 'may-bush', name: 'May Bush', festivals: [...celtic('bealtaine'), ...wheel('beltane')], food: 'flowers',
    keywords: ['hawthorn', 'whitethorn', 'May Eve', 'May Day', 'ribbons', 'blossom', 'eggshells', 'Irish', 'luck', 'summer'],
    description: 'A branch of whitethorn or another flowering tree, dressed with ribbons, flowers and painted eggshells and set by the door on May Eve, as in Ireland, to welcome the summer and its luck.',
  },
  {
    id: 'bilberries', name: 'Basket of Bilberries', festivals: [...celtic('lughnasadh'), ...wheel('lammas')], deities: ['Lugh'], food: 'fruit',
    keywords: ['fraughans', 'fraochán', 'whortleberries', 'blueberries', 'berries', 'Bilberry Sunday', 'Garland Sunday', 'hilltop', 'first fruits', 'Irish'],
    description: 'Bilberries gathered on the hilltops on the last Sunday of July, as Lughnasadh was kept in Ireland. A good crop promised a good harvest to come.',
  },

  // The Roman year, from the Parentalia in February.
  {
    id: 'parentalia-tile', name: 'Parentalia Offering', festivals: roman('parentalia'), deities: ['the Manes', 'Manes', 'di Parentes'], food: 'bread',
    keywords: ['the dead', 'ancestors', 'tile', 'wreath', 'grain', 'salt', 'bread', 'wine', 'violets', 'the grave'],
    description: 'A tile wreathed with garlands, a scattering of grain and a few grains of salt, bread soaked in wine and loose violets: the small gifts Ovid says are enough for the dead at the Parentalia.',
  },
  {
    id: 'februa', name: 'Februa', festivals: roman('lupercalia'), deities: ['Faunus', 'Lupercus'],
    keywords: ['goatskin', 'thongs', 'Luperci', 'the Palatine', 'purification', 'fertility', 'February'],
    description: 'Strips of goatskin, the februa, with which the Luperci ran round the Palatine at the Lupercalia, striking those they met to purify them and make them fruitful. February takes its name from them.',
  },
  {
    id: 'mola-salsa', name: 'Mola Salsa', festivals: roman('lupercalia', 'vestalia'), deities: ['Vesta'], food: 'bread',
    keywords: ['spelt', 'salt', 'meal', 'the Vestals', 'Vestal Virgins', 'the hearth', 'sacrifice', 'grain'],
    description: 'Spelt roasted and ground with salt by the Vestal Virgins and sprinkled over offerings; they made it for the Lupercalia, the Vestalia and the Ides of September.',
  },
  {
    id: 'matronalia-garland', name: 'Garland for Juno', festivals: roman('matronalia'), deities: ['Juno', 'Juno Lucina'], food: 'flowers',
    keywords: ['garland', 'flowers', 'mothers', 'wives', 'childbirth', 'the Kalends of March', 'women'],
    description: 'A garland of fresh flowers for Juno Lucina, to whose temple the married women of Rome brought flowers at the Matronalia, on the first of March.',
  },
  {
    id: 'floralia-flowers', name: 'Flowers and Beans of Flora', festivals: roman('floralia'), deities: ['Flora'], food: 'flowers',
    keywords: ['flowers', 'beans', 'lupins', 'vetches', 'spring', 'blossom', 'plenty', 'games'],
    description: 'Flowers for Flora, with the beans and lupins that were scattered among the crowds at her Floralia as a sign of plenty.',
  },
  {
    id: 'lemuria-beans', name: 'Black Beans', festivals: roman('lemuria'),
    keywords: ['beans', 'black beans', 'lemures', 'the restless dead', 'midnight', 'the house', 'ghosts', 'protection'],
    description: 'Black beans, thrown over the shoulder at midnight at the Lemuria by the head of the house, nine times without looking back, to redeem the household from the restless dead.',
  },
  {
    id: 'neptunalia-boughs', name: 'Leafy Boughs', festivals: roman('neptunalia'), deities: ['Neptune'], food: 'flowers',
    keywords: ['boughs', 'branches', 'leaves', 'greenery', 'shade', 'umbrae', 'summer', 'water', 'huts'],
    description: 'Leafy branches, of the kind Romans made into shady huts, the umbrae, to keep the Neptunalia in the height of summer.',
  },
  {
    id: 'saturnalia-cerei', name: 'Saturnalia Tapers', festivals: roman('saturnalia'), deities: ['Saturn'],
    keywords: ['cerei', 'tapers', 'candles', 'wax', 'gifts', 'light', 'midwinter', 'feasting'],
    description: 'Wax tapers, the cerei, given as gifts at the Saturnalia and lit through the darkest week of the year.',
  },
  {
    id: 'pileus', name: 'Pileus', festivals: roman('saturnalia'), deities: ['Saturn'],
    keywords: ['cap', 'felt cap', 'freedom', 'liberty', 'the world turned upside down', 'misrule', 'feasting'],
    description: 'The felt cap of a freed slave, worn by everyone at the Saturnalia, when the ordinary order was set aside and masters waited on their households.',
  },
  {
    id: 'sigillaria', name: 'Sigillaria', festivals: roman('saturnalia'), deities: ['Saturn'],
    keywords: ['figurines', 'little figures', 'clay', 'gifts', 'children', 'the market', 'Saturnalia gifts'],
    description: 'Little figures of clay or wax, given as gifts on the Sigillaria, the last day of the Saturnalia, when a market of them was held in Rome.',
  },
  {
    id: 'lucerna', name: 'Lucerna', festivals: roman('saturnalia'), deities: ['Saturn', 'the Lares', 'Lares'],
    keywords: ['oil lamp', 'lamp', 'light', 'lararium', 'household gods', 'the hearth', 'gifts', 'clay'],
    description: 'A clay oil lamp, of the kind lit before the Lares in the household shrine, and given as a gift and set burning at the Saturnalia.',
  },
  {
    id: 'radiate-crown', name: 'Radiate Crown', festivals: roman('sol_invictus'), deities: ['Sol Invictus', 'Sol', 'the Unconquered Sun'],
    keywords: ['crown', 'sun rays', 'the sun', 'the returning sun', 'midwinter', 'light', 'Dies Natalis'],
    description: 'The crown of sun rays worn by Sol Invictus, the Unconquered Sun, whose birthday was kept on 25 December as the days began to lengthen.',
  },

  // The Christian and folk year, from Epiphany.
  {
    id: 'epiphany-chalk', name: 'Epiphany Chalk and Water', festivals: christian('epiphany'), deities: ['the Magi', 'the Three Kings', 'Caspar', 'Melchior', 'Balthasar'],
    keywords: ['chalk', 'chalking the door', 'C+M+B', 'house blessing', 'the door', 'lintel', 'Twelfth Night', 'Epiphany water', 'blessed water', 'the new year', 'protection'],
    description: 'Chalk and water blessed at Epiphany, for the old house blessing: the year and the Magi’s initials, C+M+B, are chalked over the door, and the rooms sprinkled with the water to keep the house through the year ahead.',
  },
  {
    id: 'holy-water', name: 'Blessed Water and Salt', festivals: christian('epiphany', 'easter'),
    keywords: ['holy water', 'blessed water', 'blessed salt', 'salt', 'water', 'Epiphany water', 'Easter water', 'sprinkling', 'house blessing', 'cleansing', 'protection', 'the door'],
    description: 'Water and salt blessed at Epiphany or on Easter Eve, carried home in a bottle and sprinkled over the house, the garden and the sick, and on anyone setting out from the door.',
  },
  {
    id: 'candlemas-candles', name: 'Candlemas Candles', festivals: christian('candlemas'), deities: ['Mary', 'the Virgin Mary', 'Simeon'],
    keywords: ['candles', 'beeswax', 'blessed candles', 'light', 'the Presentation', 'the Purification', 'storms', 'weather lore', 'winter', 'the year’s candles'],
    description: 'Beeswax candles for the year, blessed at Candlemas and kept to be lit in storms, in sickness and at a deathbed. A fair, bright Candlemas was said to mean more winter to come.',
  },
  {
    id: 'easter-lilies', name: 'Easter Lilies', festivals: christian('easter'), food: 'flowers',
    keywords: ['lilies', 'white lilies', 'trumpet lilies', 'flowers', 'new life', 'spring', 'resurrection', 'white'],
    description: 'White trumpet lilies, which fill churches and homes at Easter, for new life coming up out of the dark of the year.',
  },
  {
    id: 'red-eggs', name: 'Red Eggs', festivals: christian('easter'), food: 'cooked',
    keywords: ['eggs', 'red eggs', 'dyed eggs', 'onion skins', 'egg tapping', 'tsougrisma', 'Pascha', 'Orthodox', 'Greek', 'new life', 'luck'],
    description: 'Eggs dyed red, often with onion skins, as Greek and other Orthodox households do for Easter, then knocked together end to end: the one whose egg stays whole is said to have luck for the year.',
  },
  {
    id: 'pentecost-peonies', name: 'Pentecost Peonies', festivals: christian('pentecost'), food: 'flowers',
    keywords: ['peonies', 'Pfingstrosen', 'Pentecost roses', 'Whitsun', 'Whitsunday', 'flowers', 'greenery', 'green branches', 'early summer', 'the Holy Spirit'],
    description: 'Peonies, called Pentecost roses in German for flowering at Whitsun, when houses and churches were decked with fresh green branches and flowers.',
  },
  // The Wheel’s Lammas too: when both calendars are kept the day is one festival, and when the Christian one is hidden the loaf stays for the Wheel.
  {
    id: 'lammas-loaf', name: 'Lammas Loaf', festivals: [...christian('lammas'), ...wheel('lammas')], food: 'bread',
    keywords: ['loaf', 'bread', 'first loaf', 'new wheat', 'first harvest', 'Loaf Mass', 'hlafmaesse', 'grain', 'the barn', 'thanksgiving'],
    description: 'A loaf baked from the first of the new wheat and blessed at Lammas, the loaf-mass. An old English charm has it broken in four and the pieces laid in the corners of the barn to keep the gathered grain.',
  },
  {
    id: 'herb-bundle', name: 'Assumption Herb Bundle', festivals: christian('assumption'), deities: ['Mary', 'the Virgin Mary', 'Our Lady'],
    keywords: ['herbs', 'herb bundle', 'Kräuterbuschen', 'Krauterbuschen', 'Our Lady of the Herbs', 'mugwort', 'tansy', 'yarrow', 'St John’s wort', 'grain', 'dried herbs', 'healing', 'protection', 'the house'],
    description: 'A bundle of healing herbs, mugwort, tansy, yarrow and St John’s wort among them, with a few ears of grain, blessed on the Assumption as in Germany, Austria and Poland, then dried and hung in the house to keep it through the year.',
  },
  {
    id: 'michaelmas-daisies', name: 'Michaelmas Daisies and Blackberries', festivals: christian('michaelmas'), deities: ['St Michael', 'Michael the Archangel'], food: 'flowers',
    keywords: ['asters', 'Michaelmas daisies', 'blackberries', 'brambles', 'autumn', 'the devil', 'protection', 'the last of the harvest', 'flowers', 'berries'],
    description: 'Michaelmas daisies, the asters that flower about St Michael’s feast, with the last of the blackberries. The old saying goes that none should be picked after today, for the devil, cast out of heaven by Michael, spoils them.',
  },
  {
    id: 'advent-wreath', name: 'Advent Wreath', festivals: christian('advent'),
    keywords: ['wreath', 'Adventskranz', 'evergreen', 'four candles', 'candles', 'waiting', 'the light', 'the dark of the year', 'winter', 'Sundays'],
    description: 'A ring of evergreens holding four candles, one more lit on each Sunday of Advent so the light grows week by week toward Christmas. The custom began in Germany in the 1800s.',
  },
  {
    id: 'holly-and-ivy', name: 'Holly and Ivy', festivals: christian('christmas'), food: 'flowers',
    keywords: ['holly', 'ivy', 'evergreen', 'greenery', 'berries', 'decking the house', 'the twelve days', 'midwinter', 'protection', 'the carol'],
    description: 'Holly and ivy brought in to deck the house for Christmas, as the old carol sings, and by custom taken down by Twelfth Night, or Candlemas Eve in older use, so no ill luck follows.',
  },

  // The Slavic year, from the drowning of Marzanna.
  {
    id: 'marzanna', name: 'Marzanna', festivals: slavic('marzanna'),
    keywords: ['Morana', 'Marzanna', 'Mařena', 'straw effigy', 'effigy', 'straw', 'winter', 'death', 'spring', 'the river', 'drowning', 'sending winter away'],
    description: 'A straw figure of Marzanna (Morana), winter and death, dressed in rags and ribbons, carried out of the village and burned or drowned in the river to send winter away and let spring in.',
  },
  {
    id: 'kupala-wreath', name: 'Kupala Wreath', festivals: slavic('kupala'), food: 'flowers',
    keywords: ['wreath', 'vinok', 'wianek', 'flowers', 'herbs', 'the river', 'floating wreaths', 'midsummer', 'St John’s Eve', 'love', 'divination', 'water', 'Ivan Kupala'],
    description: 'A wreath of wildflowers and herbs woven on Kupala Night and floated down the river, often with a candle in it: where it drifted, and who caught it, was read for love and marriage in the year ahead.',
  },
  {
    id: 'dziady-supper', name: 'Dziady Supper', festivals: slavic('dziady'), food: 'cooked',
    keywords: ['supper', 'the forefathers', 'the ancestors', 'the dead', 'Forefathers’ Eve', 'memorial meal', 'a place laid', 'food for the dead', 'Belarus', 'All Souls'],
    description: 'A supper for the forefathers at Dziady: kutia, pancakes and other dishes set out, the first spoonful of each put aside for the souls, and the table left laid overnight so the dead may come and eat.',
  },
  {
    id: 'kutia', name: 'Kutia', festivals: slavic('koliada', 'dziady'), food: 'cooked',
    keywords: ['kutia', 'kutya', 'kućcia', 'wheat', 'wheat berries', 'honey', 'poppy seed', 'Holy Supper', 'Christmas Eve', 'the ancestors', 'the dead', 'memorial meal'],
    description: 'Wheat berries cooked and sweetened with honey and poppy seed: the first dish of the Christmas Eve supper, and set out for the dead at Dziady and memorial meals, a spoonful left for the ancestors.',
  },
  {
    id: 'didukh', name: 'Didukh', festivals: slavic('koliada'),
    keywords: ['didukh', 'sheaf', 'wheat', 'straw', 'grandfather', 'the ancestors', 'Sviat Vechir', 'Holy Supper', 'Christmas Eve', 'Ukrainian', 'the harvest', 'the corner of honour'],
    description: 'The Ukrainian didukh, “grandfather”: a sheaf of wheat from the harvest, carried into the house on Christmas Eve and stood in the corner of honour, where the spirits of the ancestors are said to stay through the holy days.',
  },
  {
    id: 'koliada-star', name: 'Carollers’ Star', festivals: slavic('koliada'),
    keywords: ['star', 'carollers', 'carolling', 'koliadki', 'kolędy', 'kolędnicy', 'the Christmas star', 'paper star', 'Christmas Eve', 'the twelve days', 'blessing the house', 'the new year'],
    description: 'The paper star on a pole, lit from within, that carollers carry from house to house through the Koliada season, singing koliadki for blessings on each household in the year ahead.',
  },
  {
    id: 'bread-and-salt', name: 'Bread and Salt', festivals: slavic('koliada'), food: 'bread',
    keywords: ['bread', 'salt', 'loaf', 'korovai', 'karavai', 'khleb-sol', 'chleb i sól', 'welcome', 'hospitality', 'guests', 'plenty', 'the threshold'],
    description: 'The old Slavic welcome: a round loaf with a little dish of salt on top, offered to guests at the door and set on the table at the winter feasts, for hospitality and plenty in the year ahead.',
  },

  // The Hindu year, from Maha Shivaratri: the customs of a living religion, as households keep them.
  {
    id: 'bilva-leaves', name: 'Bilva Leaves', festivals: hindu('maha-shivaratri'), deities: ['Shiva', 'Mahadeva'], food: 'flowers',
    keywords: ['bilva', 'bel', 'bael', 'bel patra', 'leaves', 'three leaves', 'night vigil', 'the linga', 'puja', 'offering', 'Shivaratri'],
    description: 'Leaves of the bilva (bael) tree, three to a stem, offered to Shiva with water and milk on the linga through the night vigil of Maha Shivaratri.',
  },
  {
    id: 'holi-colours', name: 'Holi Colours', festivals: hindu('holi'), deities: ['Krishna', 'Radha'],
    keywords: ['gulal', 'abir', 'coloured powder', 'colours', 'festival of colours', 'spring', 'Holika Dahan', 'play', 'forgiveness', 'Rangwali Holi', 'Dhulandi'],
    description: 'Bright powdered colours, gulal, thrown and smeared on friends and neighbours alike on the morning of Holi, the festival of colours at the coming of spring, after the bonfire of Holika Dahan the night before.',
  },
  {
    id: 'modak', name: 'Modak', festivals: hindu('ganesh-chaturthi'), deities: ['Ganesha', 'Ganesh', 'Ganapati', 'Vinayaka'], food: 'sweets',
    keywords: ['modak', 'sweets', 'dumplings', 'coconut', 'jaggery', 'rice flour', 'prasad', 'offering', 'Ganeshotsav', 'Maharashtra'],
    description: 'Sweet dumplings of rice flour filled with coconut and jaggery, said to be Ganesha’s favourite, made and offered to him at Ganesh Chaturthi, often twenty-one at a time.',
  },
  {
    id: 'kalash', name: 'Kalash', festivals: hindu('navaratri'), deities: ['Durga', 'Devi', 'the Goddess', 'Lakshmi', 'Saraswati'],
    keywords: ['kalash', 'kalasha', 'ghata', 'Ghatasthapana', 'water pot', 'brass pot', 'coconut', 'mango leaves', 'barley', 'nine nights', 'puja'],
    description: 'A brass or copper pot of water crowned with mango leaves and a coconut, set up at Ghatasthapana on the first day of Navaratri, barley sown beside it, and worshipped as the seat of the Goddess through the nine nights.',
  },
  {
    id: 'diya-lamps', name: 'Diya Lamps', festivals: hindu('diwali'), deities: ['Lakshmi', 'Kali', 'Rama'],
    keywords: ['diya', 'diyas', 'deepa', 'clay lamps', 'oil lamps', 'lamps', 'light', 'Deepavali', 'festival of lights', 'the doorstep', 'welcome'],
    description: 'Little clay lamps of oil with cotton wicks, lit in rows along doorsteps, windows and walls at Diwali, the festival of lights, to welcome Lakshmi into the home.',
  },
  {
    id: 'rangoli', name: 'Rangoli', festivals: hindu('diwali'), deities: ['Lakshmi'],
    keywords: ['rangoli', 'kolam', 'coloured powder', 'rice flour', 'petals', 'the threshold', 'the doorstep', 'pattern', 'welcome', 'Deepavali', 'festival of lights'],
    description: 'A pattern of coloured powder, rice flour or flower petals drawn on the floor at the threshold for Diwali, to welcome guests and Lakshmi into the house. In Tamil Nadu it is the kolam.',
  },
  {
    id: 'marigold-garland', name: 'Marigold Garland', festivals: hindu('diwali', 'navaratri', 'ganesh-chaturthi'), food: 'flowers',
    keywords: ['marigolds', 'genda', 'garland', 'mala', 'toran', 'flowers', 'the doorway', 'puja', 'orange', 'offering'],
    description: 'Strings of orange and yellow marigolds hung over doorways and around shrines, and offered at puja: at Diwali, through the nine nights of Navaratri, and when Ganesha is welcomed home at Ganesh Chaturthi.',
  },

  // The Kemetic year, from Wep Ronpet: from the ancient temple calendars, as Kemetic practice keeps them today.
  {
    id: 'hetep-table', name: 'Offering Table', festivals: kemetic('wep-ronpet'), food: 'bread',
    keywords: ['offering table', 'hetep', 'htp', 'bread', 'loaves', 'offerings', 'the new year', 'opening of the year', 'the dead', 'hospitality'],
    description: 'An offering table, its top carved with the sign of a loaf on a reed mat that wrote “hetep”, offering, and laid with fresh bread for Wep Ronpet, the opening of the year, as tables were laid for the gods and the dead.',
  },
  {
    id: 'blue-lotus', name: 'Blue Lotus', festivals: kemetic('epagomenal', 'wep-ronpet'), deities: ['Nefertem', 'Ra'], food: 'flowers',
    keywords: ['lotus', 'blue lotus', 'water lily', 'seshen', 'Nymphaea', 'the Nile', 'rebirth', 'the sun', 'flowers', 'the new year'],
    description: 'The blue water lily of the Nile, seshen, which opens with the sun and closes at night; in one old account the sun was born from a lotus. Kemetic practice today sets it out as the old year ends and the new one opens.',
  },
  {
    id: 'epagomenal-lamps', name: 'Lamps of the Five Days', festivals: kemetic('epagomenal'), deities: ['Osiris', 'Horus', 'Set', 'Isis', 'Nephthys'],
    keywords: ['lamps', 'oil lamps', 'five lamps', 'the five days', 'heriu renpet', 'the days upon the year', 'birthdays of the gods', 'protection', 'the year’s end'],
    description: 'Five lamps, one for each god born on the days upon the year: Osiris, Horus, Set, Isis and Nephthys. The days stood outside the twelve months, and the ancient texts kept them with care and spells of protection.',
  },
  {
    id: 'osiris-bed', name: 'Osiris Bed', festivals: kemetic('birth-osiris'), deities: ['Osiris', 'Wesir'],
    keywords: ['Osiris bed', 'grain Osiris', 'corn mummy', 'sprouting grain', 'barley', 'earth', 'rebirth', 'the dead', 'the flood', 'Khoiak'],
    description: 'A frame in the shape of Osiris, filled with earth and sown with grain so that the god sprouts green, as in the Khoiak mysteries and the beds laid in royal tombs; set out for his birthday, the first of the days upon the year.',
  },
  {
    id: 'sistrum', name: 'Sistrum', festivals: kemetic('birth-isis', 'birth-nephthys'), deities: ['Isis', 'Nephthys', 'Hathor', 'Aset', 'Nebet-Het'],
    keywords: ['sistrum', 'sesheshet', 'rattle', 'music', 'priestess', 'the temple', 'the days upon the year'],
    description: 'A sacred rattle whose metal rods shiver and ring when it is shaken, played by priestesses to soothe and please the goddesses, Hathor and Isis above all; set out for the birthdays of Isis and Nephthys.',
  },

  // The turning seasons, for everyone, by the date.
  {
    id: 'snowdrops', name: 'Snowdrops', festivals: season('late_winter'), food: 'flowers',
    keywords: ['first flowers', 'Candlemas bells', 'hope', 'winter', 'the thaw', 'white', 'flowers'],
    description: 'The first flowers of the year, pushing up through cold ground while winter still holds, a promise that the light is coming back.',
  },
  {
    id: 'blossom-branch', name: 'Blossoming Branch', festivals: season('spring'), food: 'flowers',
    keywords: ['blossom', 'cherry', 'apple blossom', 'blackthorn', 'spring', 'growth', 'renewal', 'flowers'],
    description: 'A spray of blossom cut from a flowering tree, cherry, apple or blackthorn, for the quickening of spring.',
  },
  {
    id: 'summer-wildflowers', name: 'Summer Wildflowers', festivals: season('summer'), food: 'flowers',
    keywords: ['meadow', 'hedgerow', 'daisies', 'poppies', 'cornflowers', 'clover', 'summer', 'abundance', 'flowers'],
    description: 'A handful of wildflowers from the meadow and the hedgerow, daisies, poppies, cornflowers and clover, for the season at its fullest.',
  },
  {
    id: 'autumn-leaves', name: 'Fallen Leaves', festivals: season('autumn'),
    keywords: ['leaves', 'fall', 'oak', 'maple', 'red and gold', 'letting go', 'release', 'harvest', 'the turning year'],
    description: 'Leaves gathered as they turn red and gold, kept as the year leans toward rest and letting go.',
  },
];

/** What tonight's altar sets out first for a festival ("wheel/samhain"), when it isn't the first listed. */
const TONIGHT_FIRST: Record<string, string> = {
  'wheel/samhain': 'pumpkin-lantern',
  'wheel/yule': 'yule-log',
  'wheel/imbolc': 'brigids-cross',
  'wheel/ostara': 'ostara-eggs',
  'wheel/beltane': 'flower-crown',
  'wheel/litha': 'sun-wheel',
  'wheel/lammas': 'wheat-sheaf',
  'wheel/mabon': 'apples',
  'hellenic/noumenia': 'thymiaterion',
  'norse/haustblot': 'odins-sheaf',
  'norse/jol': 'yule-goat',
  'roman/lupercalia': 'februa',
  'christian/easter': 'easter-lilies',
  'slavic/koliada': 'didukh',
  'kemetic/epagomenal': 'epagomenal-lamps',
};

export const seasonalObject = (id: string) => SEASONAL_OBJECTS.find((o) => o.id === id) ?? null;

/** The offering kind a seasonal thing ages as (the food ones), or null for those that keep. */
export const seasonalFood = (id: string): string | null => seasonalObject(id)?.food ?? null;

/** Which seasonal thing a saved object is, by its id (its `form`), or null. */
export const seasonalIdOf = (object: { type?: string; form?: string }) => (object.type === 'seasonal' && seasonalObject(String(object.form || '')) ? String(object.form) : null);

/** A seasonal thing that holds an offering (the phiale), as a bowl or chalice does. */
export const seasonalHolds = (object: { type?: string; form?: string }) => !!seasonalObject(seasonalIdOf(object) ?? '')?.vessel;

/** A line about a seasonal thing, for its panel. */
export const seasonalDescription = (object: Pick<SavedObject, 'type' | 'form'>) => seasonalObject(seasonalIdOf(object) ?? '')?.description ?? '';

/** The drawer section (SEASONAL_TRADITIONS) a festival belongs to, or null: its own when it has one (the Celtic year), else the one covering its calendar. */
export const traditionOf = (ref: FestivalRef) =>
  SEASONAL_TRADITIONS.find((t) => t.id === ref.tradition) ?? SEASONAL_TRADITIONS.find((t) => t.calendars.includes(ref.tradition)) ?? null;

/** A festival's key across calendars: "wheel/samhain", "hellenic/noumenia". */
export const festivalKey = (ref: FestivalRef) => `${traditionOf(ref)?.id ?? ref.tradition}/${ref.holiday}`;

/** A festival's name: "Samhain", "City Dionysia", "Hekate’s Deipnon". */
export function festivalName(ref: FestivalRef): string {
  if (ref.tradition === 'wheel') return sabbatName(ref.holiday);
  if (ref.tradition === 'seasons') return SEASONS.find((s) => s.id === ref.holiday)?.name ?? '';
  const own = CALENDAR_FESTIVALS[ref.tradition];
  if (own) return own.find((f) => f.id === ref.holiday)?.name ?? '';
  return TRADITIONS.find((t) => t.id === ref.tradition)?.holidays.find((h) => h.id === ref.holiday)?.name ?? '';
}

/** The sabbats a seasonal thing is kept for. */
export const sabbatsOf = (object: SeasonalObject): SabbatId[] => object.festivals.filter((f) => f.tradition === 'wheel').map((f) => f.holiday as SabbatId);

/** The festivals a seasonal thing is kept for, by name: "Lenaia · City Dionysia" (a name already given, as Imbolc in "Imbolc · Lá Fhéile Bríde", once). */
export function festivalLine(object: SeasonalObject): string {
  const parts: string[] = [];
  for (const name of object.festivals.map(festivalName)) for (const part of name.split(' · ')) if (part && !parts.includes(part)) parts.push(part);
  return parts.join(' · ');
}

/** Where a festival comes in its section, so each section reads through its calendar's year. */
function festivalOrder(key: string): number {
  const [group, holiday] = key.split('/');
  if (group === 'wheel') return SABBATS.findIndex((s) => s.id === holiday);
  if (group === 'seasons') return SEASONS.findIndex((s) => s.id === holiday);
  if (CALENDAR_FESTIVALS[group]) return CALENDAR_FESTIVALS[group].findIndex((f) => f.id === holiday);
  const tradition = SEASONAL_TRADITIONS.find((t) => t.id === group);
  const all = TRADITIONS.filter((t) => tradition?.calendars.includes(t.id)).flatMap((t) => t.holidays.map((h) => h.id));
  return all.indexOf(holiday);
}

/**
 * The cabinet's Seasonal drawer: every seasonal thing that has a picture
 * (`images`, id → picture, from the artwork data), placed as `type: 'seasonal'`
 * with its id as its form. Found by its festivals' names, its gods and its
 * calendar ("sabbat", "Greek").
 */
export function seasonalCabinetItems(images: Record<string, string>, hidden: string[] = []): CabinetItem[] {
  return SEASONAL_OBJECTS.filter((o) => !!images[o.id])
    .map((o) => ({ ...o, festivals: o.festivals.filter((f) => !hidden.includes(f.tradition)) }))
    .filter((o) => o.festivals.length > 0)
    .map((o) => ({
      id: `seasonal:${o.id}`,
      category: 'seasonal',
      name: o.name,
      keywords: [
        ...new Set([...o.keywords, ...(o.deities ?? []), ...o.festivals.map(festivalName), ...o.festivals.flatMap((f) => traditionOf(f)?.words ?? [])]),
      ].filter(Boolean),
      sabbats: sabbatsOf(o),
      festivals: o.festivals.map(festivalKey),
      description: festivalLine(o),
      forms: [{ label: 'Place', image: images[o.id], type: 'seasonal', form: o.id }],
    }));
}

/**
 * The cabinet without the seasonal things of the calendars hidden in
 * settings (holidays.ts hiddenTraditions: the Christian calendar, for those
 * it hurts): a thing kept only for a hidden calendar's festivals isn't
 * offered or found at all, and one kept for another calendar's too (the
 * Lammas loaf, at the Wheel's Lammas) stays as that calendar's thing alone.
 */
export function withoutHiddenCalendars(items: CabinetItem[], hidden: string[]): CabinetItem[] {
  if (!hidden.length) return items;
  return items.flatMap((item) => {
    // The website's cabinet has items without forms (its backgrounds).
    const form = item.category === 'seasonal' && !item.customCabinetItemId ? item.forms?.[0] : undefined;
    const object = form ? seasonalObject(String(form.form ?? '')) : null;
    if (!form || !object || !object.festivals.some((f) => hidden.includes(f.tradition))) return [item];
    const [shown] = seasonalCabinetItems({ [object.id]: form.image || object.id }, hidden);
    return shown ? [{ ...item, ...shown, forms: item.forms }] : [];
  });
}

/** "wheel-samhain-2026-9-31" (or a bare "samhain") → "samhain": a holiday's own id, without its calendar or date. */
export function holidayKey(id: string): string {
  const bare = id.replace(/-\d+-\d+-\d+$/, '');
  const at = bare.indexOf('-');
  return at >= 0 ? bare.slice(at + 1) : bare;
}

/** The sabbat a holiday is (the Celtic year's Lughnasadh is Lammas, Bealtaine is Beltane), or null. */
export function sabbatOfHoliday(id: string): SabbatId | null {
  const key = holidayKey(id);
  if (key === 'lughnasadh' || key.startsWith('lughnasadh_')) return 'lammas';
  if (key === 'bealtaine') return 'beltane';
  if (key === 'la_fheile_bride') return 'imbolc';
  // The Celtic year's "samhain_gaelic" is Samhain too.
  return SABBATS.find((s) => key === s.id || key.startsWith(`${s.id}_`))?.id ?? null;
}

/**
 * The festivals (as "wheel/samhain" keys) a holiday from the calendars is,
 * among those that have seasonal things. `calendars` are the calendars it
 * came from (Holiday.traditionIds); without them, the one its id begins with.
 */
export function festivalsOfHoliday(id: string, calendars?: string[]): string[] {
  const bare = id.replace(/-\d+-\d+-\d+$/, '');
  const at = bare.indexOf('-');
  const from = calendars ?? (at >= 0 ? [bare.slice(0, at)] : null);
  const kept = new Set(SEASONAL_OBJECTS.flatMap((o) => o.festivals.map(festivalKey)));
  const out: string[] = [];
  for (const tradition of SEASONAL_TRADITIONS) {
    // A bare id ("samhain") may be from any calendar.
    if (from && !from.some((c) => tradition.calendars.includes(c))) continue;
    const festival = tradition.festivalOf ? tradition.festivalOf(id) : holidayKey(id);
    const key = `${tradition.id}/${festival}`;
    if (festival && kept.has(key) && !out.includes(key)) out.push(key);
  }
  return out;
}

export type FestivalNear = {
  /** "wheel/samhain", "hellenic/pyanepsia", "seasons/autumn": the festival it is named for. */
  key: string;
  /**
   * Every festival it is ("celtic/bealtaine" and "wheel/beltane" for the
   * Celtic year's Bealtaine), so the things of each come under it.
   */
  keys: string[];
  /** The drawer section it belongs to (SEASONAL_TRADITIONS). */
  tradition: string;
  name: string;
  /** The day it begins. */
  date: Date;
  /** How many days it runs. */
  days: number;
  /** 0 on the day, and on every day while it runs. */
  inDays: number;
  /** Which of its days today is (1-based), or 0 before it begins. */
  day: number;
};

/** How many days before a festival its things come to the front of the cabinet. */
export const SABBAT_LEAD_DAYS = 7;
/** The days that come every month (the Noumenia, Hekate's Deipnon) are near only the day before and on the day. */
export const MONTHLY_LEAD_DAYS = 1;

/**
 * The traditional calendars (lib/calendars) shown in settings, and where the
 * person is: the Hindu festivals follow sunrise and the Kemetic new year the
 * rising of Sirius, both worked out where you are (or at Ujjain and Cairo).
 */
export type CalendarsShown = { settings: Record<string, unknown> | null | undefined; place?: Place | null };

/** A festival from a traditional calendar, in the shape festivalsNear reads; `parts` are the calendar's own ids it covers. */
export type CalendarFestival = { id: string; name: string; date: Date; days: number; traditionIds: string[]; recurs?: 'monthly' | 'yearly'; parts: string[] };

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
/** How far either side of a window to look in a calendar, for a festival already running (Navaratri's nine nights) and the whole run of the epagomenal days. */
const CALENDAR_MARGIN_DAYS = 10;
const EPAGOMENAL_DAY = /^(birth-|epagomenal)/;

/**
 * The festivals with seasonal things (CALENDAR_FESTIVALS) from the
 * traditional calendars you show in settings, running at any time from
 * `from` to `to`, as each calendar works them out: none for a calendar not
 * shown. The Kemetic days upon the year, which follow one another, come as
 * one span, "kemetic-epagomenal", from the first through the last.
 */
export function calendarFestivalsBetween(from: Date, to: Date, shown?: CalendarsShown | null): CalendarFestival[] {
  if (!shown) return [];
  const first = startOfDay(from);
  const out: CalendarFestival[] = [];
  for (const id of shownCalendars(shown.settings).filter((c) => !!CALENDAR_FESTIVALS[c])) {
    const def = calendarById(id);
    if (!def) continue;
    let events;
    try {
      events = def.eventsBetween(addDays(first, -CALENDAR_MARGIN_DAYS), addDays(startOfDay(to), CALENDAR_MARGIN_DAYS), calendarContext(shown.settings, shown.place ?? null, id));
    } catch {
      // A calendar that can't say leaves the others.
      continue;
    }
    for (const event of [...events].sort((a, b) => a.date.getTime() - b.date.getTime())) {
      const date = startOfDay(event.date);
      if (id === 'kemetic' && EPAGOMENAL_DAY.test(holidayKey(event.id))) {
        const span = out.find((f) => f.id === 'kemetic-epagomenal' && addDays(f.date, f.days).getTime() === date.getTime());
        if (span) {
          span.days += 1;
          span.parts.push(event.id);
        } else out.push({ id: 'kemetic-epagomenal', name: 'Epagomenal Days', date, days: 1, traditionIds: [id], recurs: 'yearly', parts: [event.id] });
        continue;
      }
      if (!festivalsOfHoliday(event.id, [id]).length) continue;
      out.push({ id: event.id, name: event.name, date, days: Math.max(1, event.days), traditionIds: [id], recurs: event.recurs ?? 'yearly', parts: [event.id] });
    }
  }
  return out
    .filter((f) => addDays(f.date, f.days - 1).getTime() >= first.getTime() && f.date.getTime() <= to.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * The festivals that are near, soonest first: from a week before each
 * through its last day (the monthly days only from the day before), among
 * the calendars you keep (the Wheel of the Year, north or south, when none
 * has been chosen; single holidays picked into your own calendar count too),
 * and the traditional calendars you show (`calendars`: the Hindu and Kemetic
 * festivals, calendarFestivalsBetween). Only festivals that have seasonal
 * things.
 */
export function festivalsNear(now: Date, choice?: HolidayChoice | null, calendars?: CalendarsShown | null): FestivalNear[] {
  const kept: HolidayChoice = choice ? { traditions: choice.traditions, custom: [], picked: choice.picked } : { traditions: DEFAULT_TRADITIONS, custom: [] };
  const today = startOfDay(now);
  const until = new Date(today.getFullYear(), today.getMonth(), today.getDate() + SABBAT_LEAD_DAYS);
  const out: (FestivalNear & { own: Set<string> })[] = [];
  const groupOf = (key: string) => key.split('/')[0];
  const fromCalendars = calendarFestivalsBetween(today, until, calendars);
  const holidays: (Pick<CalendarFestival, 'id' | 'name' | 'date' | 'days' | 'traditionIds'> & { recurs?: string; parts?: string[] })[] = holidaysBetween(today, until, kept);
  const all = fromCalendars.length ? [...holidays, ...fromCalendars].sort((a, b) => a.date.getTime() - b.date.getTime()) : holidays;
  for (const holiday of all) {
    const inDays = Math.max(0, Math.round((holiday.date.getTime() - today.getTime()) / 86_400_000));
    if (holiday.recurs === 'monthly' && inDays > MONTHLY_LEAD_DAYS) continue;
    const offset = Math.round((today.getTime() - holiday.date.getTime()) / 86_400_000);
    // The epagomenal days are the span's festival first, then each god's birthday in it.
    const keys = [...new Set([holiday.id, ...(holiday.parts ?? [])].flatMap((id) => festivalsOfHoliday(id, holiday.traditionIds)))];
    if (!keys.length) continue;
    // Which of them belong to a calendar this holiday came from (Bealtaine is the Celtic year's own; Beltane the Wheel's).
    const own = keys.filter((k) => holiday.traditionIds.some((c) => c === groupOf(k) || c.startsWith(`${groupOf(k)}_`)));
    // The same festival from two calendars (Lammas and Lughnasadh) once.
    const same = out.find((n) => n.keys.some((k) => keys.includes(k)));
    if (same) {
      keys.forEach((k) => !same.keys.includes(k) && same.keys.push(k));
      own.forEach((k) => same.own.add(k));
      continue;
    }
    out.push({ key: keys[0], keys, own: new Set(own), tradition: '', name: holiday.name, date: holiday.date, days: holiday.days, inDays, day: offset >= 0 && offset < holiday.days ? offset + 1 : 0 });
  }
  // Each is named as the calendar you keep names it: "Beltane" on the Wheel of the Year, "Bealtaine" in the Celtic year alone.
  const order = (key: string) => SEASONAL_TRADITIONS.findIndex((t) => t.id === groupOf(key));
  return out.map(({ own, ...near }) => {
    const key = [...near.keys].sort((a, b) => Number(own.has(b)) - Number(own.has(a)) || order(a) - order(b))[0];
    const [tradition, festival] = key.split('/');
    const ref = SEASONAL_OBJECTS.flatMap((o) => o.festivals).find((f) => festivalKey(f) === key);
    const name = tradition === 'wheel' ? sabbatName(festival) : ref ? festivalName(ref) : near.name;
    return { ...near, key, keys: [key, ...near.keys.filter((k) => k !== key)], tradition, name };
  });
}

/**
 * The festivals running today, for tonight's altar: festivalsNear's (the
 * same calendars, traditional ones and place as the Seasonal drawer) that
 * fall on the day, or are running on it (Navaratri's nights, the epagomenal
 * days).
 */
export function festivalsTonight(now: Date, choice?: HolidayChoice | null, calendars?: CalendarsShown | null): FestivalNear[] {
  return festivalsNear(now, choice, calendars).filter((n) => n.inDays === 0 && n.day >= 1);
}

/** Whether you keep the year south of the equator (the Wheel of the Year, Southern Hemisphere). */
export const keepsSouth = (choice?: HolidayChoice | null) =>
  !!choice && (choice.traditions.includes('wheel_south') || (choice.picked ?? []).some((id) => id.startsWith('wheel_south/')));

/**
 * The turning season today, by the date (SEASONS, six months later south of
 * the equator), as a near festival that runs the season through; or null in
 * early winter, which has no season's thing of its own.
 */
export function seasonNow(now: Date, choice?: HolidayChoice | null): FestivalNear | null {
  const today = startOfDay(now);
  const shift = keepsSouth(choice) ? 6 : 0;
  for (const s of SEASONS) {
    for (const year of [today.getFullYear() - 1, today.getFullYear()]) {
      const fromMonth = s.from[0] + shift;
      const untilMonth = s.until[0] + shift + (s.until[0] < s.from[0] ? 12 : 0);
      const from = new Date(year, fromMonth, s.from[1]);
      const until = new Date(year, untilMonth, s.until[1]);
      if (today >= from && today < until) {
        const key = `seasons/${s.id}`;
        const days = Math.round((until.getTime() - from.getTime()) / 86_400_000);
        const day = Math.round((today.getTime() - from.getTime()) / 86_400_000) + 1;
        return { key, keys: [key], tradition: 'seasons', name: s.name, date: from, days, inDays: 0, day };
      }
    }
  }
  return null;
}

/**
 * What the Seasonal drawer brings to the top: the festivals that are near
 * (festivalsNear), then the season it is (seasonNow), which never comes
 * before a festival.
 */
export function seasonalNear(now: Date, choice?: HolidayChoice | null, calendars?: CalendarsShown | null): FestivalNear[] {
  const season = seasonNow(now, choice);
  return [...festivalsNear(now, choice, calendars), ...(season ? [season] : [])];
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * When a near festival is, in a sentence: "Samhain is in 7 days.", and for
 * one of several days "Eleusinian Mysteries, in 6 days, for 9 days." and
 * "City Dionysia, day 3 of 7."
 */
export function festivalWhen(near: Pick<FestivalNear, 'name' | 'inDays' | 'days' | 'day'> & Partial<Pick<FestivalNear, 'tradition' | 'date'>>): string {
  // The season it is: "Late winter, until mid-March.", "Autumn, until the end of November."
  if (near.tradition === 'seasons' && near.date) {
    const last = new Date(near.date.getFullYear(), near.date.getMonth(), near.date.getDate() + near.days - 1);
    const month = MONTHS[last.getMonth()];
    return `${near.name}, until ${last.getDate() <= 20 ? `mid-${month}` : `the end of ${month}`}.`;
  }
  const when = near.inDays === 0 ? 'today' : near.inDays === 1 ? 'tomorrow' : `in ${near.inDays} days`;
  if (near.days <= 1) return `${near.name} is ${when}.`;
  if (near.day >= 1) return `${near.name}, day ${near.day} of ${near.days}.`;
  return `${near.name}, ${near.inDays === 1 ? 'from tomorrow' : when}, for ${near.days} days.`;
}

export type SabbatNear = { id: SabbatId; name: string; date: Date; /** 0 on the day. */ inDays: number };

/** The sabbat that is near (festivalsNear's first from the Wheel of the Year), or null between them. */
export function sabbatNear(now: Date, choice?: HolidayChoice | null): SabbatNear | null {
  const near = festivalsNear(now, choice).find((n) => n.keys.some((k) => k.startsWith('wheel/')));
  const id = near?.keys.find((k) => k.startsWith('wheel/'))?.split('/')[1] as SabbatId | undefined;
  return near && id ? { id, name: sabbatName(id), date: near.date, inDays: near.inDays } : null;
}

export type SeasonalSection = {
  title: string;
  /** The calendar section it is (SEASONAL_TRADITIONS), or null for a near festival's or your own. */
  tradition: string | null;
  /** The festival that is near, for a "For Samhain" section. */
  near: FestivalNear | null;
  items: CabinetItem[];
};

const festivalsOf = (item: CabinetItem): string[] => (Array.isArray(item.festivals) ? item.festivals : Array.isArray(item.sabbats) ? item.sabbats.map((s) => `wheel/${s}`) : []);

/**
 * The Seasonal drawer in sections: a "For Samhain" for each festival that is
 * near, soonest first, and "This season" for the season it is (seasonalNear);
 * then each calendar's things ("Wheel of the Year", "Greek festivals", …,
 * "The turning seasons"), through its year, each under the calendar of the
 * first festival it names (the May bush under the Celtic festivals); and
 * anything of your own at the end. Each thing is shown once, under the first
 * section it belongs to.
 */
export function seasonalSections(items: CabinetItem[], near: FestivalNear[] | null = []): SeasonalSection[] {
  const used = new Set<string>();
  const sections: SeasonalSection[] = [];
  for (const festival of near ?? []) {
    const keys = festival.keys ?? [festival.key];
    const list = items.filter((item) => !used.has(item.id) && festivalsOf(item).some((k) => keys.includes(k)));
    list.forEach((item) => used.add(item.id));
    const title = festival.tradition === 'seasons' ? 'This season' : `For ${festival.name}`;
    if (list.length) sections.push({ title, tradition: null, near: festival, items: list });
  }
  for (const tradition of SEASONAL_TRADITIONS) {
    const first = (item: CabinetItem) => Math.min(...festivalsOf(item).filter((k) => k.startsWith(`${tradition.id}/`)).map(festivalOrder));
    const list = items
      .filter((item) => !used.has(item.id) && festivalsOf(item)[0]?.startsWith(`${tradition.id}/`))
      .map((item, index) => ({ item, index, order: first(item) }))
      .sort((a, b) => a.order - b.order || a.index - b.index)
      .map(({ item }) => item);
    list.forEach((item) => used.add(item.id));
    if (list.length) sections.push({ title: tradition.title, tradition: tradition.id, near: null, items: list });
  }
  const rest = items.filter((item) => !used.has(item.id));
  if (rest.length) sections.push({ title: 'Your own', tradition: null, near: null, items: rest });
  return sections;
}

/**
 * The near festivals that have something in the drawer (`items`), so the
 * drawer is worth opening on. The season it is doesn't count: it's always
 * some season.
 */
export const nearWithThings = (near: FestivalNear[] | null, items: CabinetItem[]) =>
  (near ?? []).filter(
    (n) => n.tradition !== 'seasons' && items.some((item) => item.category === 'seasonal' && festivalsOf(item).some((k) => (n.keys ?? [n.key]).includes(k))),
  );

/** The seasonal things to set out for a festival ("wheel/samhain"), the most fitting first. */
export function seasonalForFestival(key: string): string[] {
  const all = SEASONAL_OBJECTS.filter((o) => o.festivals.some((f) => festivalKey(f) === key)).map((o) => o.id);
  const first = TONIGHT_FIRST[key];
  return first && all.includes(first) ? [first, ...all.filter((id) => id !== first)] : all;
}

/** The seasonal things to set out on a sabbat night, the most fitting first. */
export const seasonalFor = (sabbat: SabbatId): string[] => seasonalForFestival(`wheel/${sabbat}`);

/** The seasonal things for a holiday from the calendars ("hellenic-pyanepsia-2026-9-25"), the most fitting first. */
export const seasonalForHoliday = (id: string): string[] => [...new Set(festivalsOfHoliday(id).flatMap(seasonalForFestival))];
