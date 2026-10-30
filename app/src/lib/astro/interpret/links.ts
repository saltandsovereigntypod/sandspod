// Where a reading leads: the planet's full guide, the Living Library entries
// its magic names, and the premade rituals and dedication journeys that suit
// the planet and the house. The registry adds these to every reading it
// hands out, so the tables only have to name things in plain words.
// Pure; the tests check every name and id here exists.

import type { TermLink } from '../glossary/types.ts';
import { CLASSICAL, TRADITIONAL_RULER, type ChartPointName, type Classical, type ZodiacSign } from '../signs.ts';
import type { Interpretation } from './types.ts';

/**
 * Herbs and stones linked when the magic text names them (any case), as the
 * Living Library spells them. Left out: names that are also everyday words
 * in these readings (bay, elder, violet).
 */
export const LIBRARY_HERBS_AND_STONES: string[] = [
  // herbs
  'Basil', 'Cedar', 'Chamomile', 'Cinnamon', 'Clove', 'Frankincense', 'Jasmine', 'Lavender', 'Lemon Balm', 'Mint', 'Mugwort', 'Myrrh', 'Nettle', 'Patchouli',
  'Rose', 'Rosemary', 'Sage', 'Thyme', 'Yarrow', 'Calendula', 'Cypress', 'Dandelion', 'Garlic', 'Hyssop', 'Juniper', 'Peppermint', 'Saffron', 'Wormwood', 'Yew',
  'Vervain', 'Rue', 'Hawthorn', 'Rowan', 'St John’s Wort', 'Dragon’s Blood', 'Star Anise', 'Oak', 'Birch', 'Willow', 'Holly', 'Meadowsweet', 'Angelica',
  'Valerian', 'Catnip', 'Comfrey', 'Dittany of Crete', 'Allspice', 'Ginger', 'Black Pepper', 'Lemongrass', 'Orris Root', 'Sandalwood', 'Copal', 'Vanilla', 'Anise',
  'Borage', 'Cardamom', 'Cinquefoil', 'Red Clover', 'Damiana', 'Eucalyptus', 'Fennel', 'Galangal', 'Heather', 'Hibiscus', 'Honeysuckle', 'Lilac', 'Mullein',
  'Nutmeg', 'Passionflower', 'Pine', 'Rosehip', 'Sunflower',
  // stones
  'Amethyst', 'Black Tourmaline', 'Carnelian', 'Citrine', 'Clear Quartz', 'Fluorite', 'Garnet', 'Green Aventurine', 'Hematite', 'Labradorite', 'Lapis Lazuli',
  'Malachite', 'Moonstone', 'Moss Agate', 'Obsidian', 'Pyrite', 'Rose Quartz', 'Selenite', 'Smoky Quartz', 'Tiger Eye', 'Jet', 'Bloodstone', 'Onyx', 'Red Jasper',
  'Sunstone', 'Kyanite', 'Rhodonite', 'Rhodochrosite', 'Amber', 'Aquamarine', 'Blue Lace Agate', 'Chrysocolla', 'Emerald', 'Peridot', 'Turquoise', 'Ruby',
  'Sapphire', 'Opal', 'Howlite', 'Lepidolite', 'Sodalite', 'Unakite', 'Jade', 'Chrysoprase', 'Apache Tear', 'Celestite', 'Herkimer Diamond', 'Angelite', 'Ametrine',
  'Aragonite', 'Azurite', 'Orange Calcite', 'Charoite', 'Larimar', 'Prehnite', 'Rutilated Quartz', 'Snowflake Obsidian', 'Tourmalinated Quartz', 'Ocean Jasper',
  'Pink Tourmaline', 'Iolite', 'Morganite', 'Amazonite', 'Spirit Quartz', 'Desert Rose',
];

/**
 * Gods linked when the magic text names them (with a capital). Left out:
 * the gods who share a planet's name (their journeys are linked from the
 * planet instead) and short names that are also words.
 */
export const LIBRARY_DEITIES: string[] = [
  'Aphrodite', 'Apollo', 'Artemis', 'Bastet', 'Brigid', 'Cernunnos', 'Cerridwen', 'Durga', 'Freyja', 'Ganesha', 'Hekate', 'Hermes', 'Isis', 'Lilith', 'Loki',
  'The Morrigan', 'Odin', 'Persephone', 'Thor', 'Anubis', 'Juno', 'Minerva', 'Vesta', 'Diana', 'Janus', 'Ceres', 'Perun', 'Mokosh', 'Veles', 'Lugh', 'Epona',
  'Arianrhod', 'Rhiannon', 'Frigg', 'Freyr', 'Tyr', 'Skadi', 'Baldur', 'Idunn', 'Demeter', 'Dionysus', 'Hestia', 'Hades', 'Athena', 'Selene', 'Nyx', 'Thoth',
  'Hathor', 'Sekhmet', 'Osiris', 'Flora', 'Zeus', 'Hera', 'Poseidon', 'Horus', 'Nephthys', 'Maat', 'Lakshmi', 'Shiva', 'Saraswati', 'Kali', 'Krishna', 'Ares',
  'Hephaestus', 'Gaia', 'Helios', 'Eros', 'Asclepius', 'Fortuna', 'Proserpina', 'Vulcan', 'Ptah', 'Heimdall', 'Bragi', 'Eir', 'The Norns', 'Danu', 'Ogma',
  'The Cailleach', 'Gwydion', 'Blodeuwedd', 'Taranis', 'Sulis', 'Svarog', 'Inanna', 'Ereshkigal', 'Shamash', 'Astarte',
];

const PLANET_GUIDE = new Set<ChartPointName>(CLASSICAL);

const premade = (id: string, title: string): TermLink => ({ kind: 'premade', id, label: `Ritual: ${title}` });
const journey = (id: string, god: string): TermLink => ({ kind: 'journey', id, label: `${god}: a dedication journey` });

/** Premade workings and journeys that suit each body. */
export const BODY_LINKS: Partial<Record<ChartPointName, TermLink[]>> = {
  Sun: [premade('cosmic-sunday-sun-success', 'Sunday Sun Crown'), journey('deity-sol', 'Sol'), journey('deity-apollo', 'Apollo')],
  Moon: [premade('cosmic-monday-moon-intuition', 'Monday Moon Bowl'), journey('deity-selene', 'Selene')],
  Mercury: [premade('cosmic-wednesday-mercury-study', 'Wednesday Mercury Desk Blessing'), journey('deity-hermes', 'Hermes'), journey('deity-mercury', 'Mercury')],
  Venus: [premade('cosmic-friday-venus-love', 'Friday Venus Rose Bath'), journey('deity-aphrodite', 'Aphrodite'), journey('deity-venus', 'Venus')],
  Mars: [premade('cosmic-tuesday-mars-courage', 'Tuesday Mars Spark'), journey('deity-mars', 'Mars')],
  Jupiter: [premade('cosmic-thursday-jupiter-prosperity', 'Thursday Jupiter Open Hand'), journey('deity-jupiter', 'Jupiter'), journey('deity-zeus', 'Zeus')],
  Saturn: [premade('cosmic-saturday-saturn-boundaries', 'Saturday Saturn Boundary Stones'), journey('deity-saturn', 'Saturn')],
  Uranus: [premade('green-storm-energy-working', 'Storm Energy Working'), premade('folk-build-your-own-ritual', 'Build Your Own Ritual')],
  Neptune: [premade('hedge-dark-bowl-scrying', 'Scrying in a Dark Bowl of Water'), journey('deity-neptune', 'Neptune'), journey('deity-poseidon', 'Poseidon')],
  Pluto: [premade('cosmic-dark-moon-rest-shadow', 'Dark Moon Rest and Shadow Pages'), journey('deity-hades', 'Hades'), journey('deity-persephone', 'Persephone')],
  Chiron: [premade('folk-healing-poppet', 'A Poppet for Your Own Healing')],
  'North Node': [premade('hedge-crossroads-choice', 'Crossroads Working for a Choice')],
  'South Node': [premade('hedge-ancestor-candle-evening', 'Ancestor Altar & Candle Evening')],
  Lilith: [premade('kitchen-solitary-self-love-mirror', 'Self-Love Mirror Ritual'), journey('deity-lilith', 'Lilith')],
};

/** A premade working that suits each house. */
export const HOUSE_LINKS: Record<number, TermLink> = {
  1: premade('kitchen-solitary-grounding-centering', 'Grounding and Centering Basics'),
  2: premade('crystal-abundance-grid', 'Abundance Grid'),
  3: premade('hedge-tea-leaf-reading', 'Reading the Tea Leaves'),
  4: premade('kitchen-hearth-blessing', 'Blessing the Hearth'),
  5: premade('wicca-beltane-flower-crown', 'Beltane Flower Crown and Fire Leap'),
  6: premade('kitchen-healing-broth', 'Hearth Healing Broth'),
  7: premade('kitchen-honey-sweetening-cake', 'Honey Sweetening Cake'),
  8: premade('hedge-letting-go-of-the-dead', 'Letting Go of the Dead: A Grief Rite'),
  9: premade('cosmic-stargazing-name-your-star', 'Stargazing Devotion: Naming Your Star'),
  10: premade('cosmic-sunday-sun-success', 'Sunday Sun Crown'),
  11: premade('wicca-wolf-moon', 'Wolf Moon: Calling the Pack Home'),
  12: premade('hedge-dream-pillow', 'Mugwort Dream Pillow & Dream Journal'),
};

const norm = (s: string) => s.replace(/’/g, "'");
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let finder: { herbs: RegExp; gods: RegExp; byLower: Map<string, string> } | null = null;
function getFinder() {
  if (finder) return finder;
  const byLower = new Map<string, string>();
  for (const n of [...LIBRARY_HERBS_AND_STONES, ...LIBRARY_DEITIES]) byLower.set(norm(n).toLowerCase(), n);
  const alt = (names: string[]) => [...names].map(norm).sort((a, b) => b.length - a.length).map(escape).join('|');
  finder = {
    herbs: new RegExp(`(?:^|[^\\w'-])(${alt(LIBRARY_HERBS_AND_STONES)})(?![\\w-])`, 'gi'),
    gods: new RegExp(`(?:^|[^\\w'-])(${alt(LIBRARY_DEITIES)})(?![\\w-])`, 'g'),
    byLower,
  };
  return finder;
}

/** The Living Library names a text mentions, in order, once each. */
export function libraryMentions(text: string): string[] {
  const f = getFinder();
  const t = norm(text);
  const hits: { at: number; name: string }[] = [];
  for (const re of [f.herbs, f.gods]) {
    re.lastIndex = 0;
    for (let m = re.exec(t); m; m = re.exec(t)) {
      const name = f.byLower.get(m[1].toLowerCase());
      if (name) hits.push({ at: m.index, name });
    }
  }
  return [...new Set(hits.sort((a, b) => a.at - b.at).map((h) => h.name))];
}

const guide = (planet: Classical): TermLink => ({ kind: 'planet-guide', planet });
const key = (l: TermLink) => JSON.stringify([l.kind, 'id' in l ? l.id : 'name' in l ? l.name : 'planet' in l ? l.planet : '']);

/** A reading with its links: the given ones first, then what its magic names (at most `max`). */
function withLinks(reading: Interpretation | null, lead: TermLink[], tail: TermLink[], max = 8): Interpretation | null {
  if (!reading) return null;
  const library: TermLink[] = libraryMentions(reading.magic).slice(0, 5).map((name) => ({ kind: 'library', name }));
  const out: TermLink[] = [];
  for (const l of [...(reading.links ?? []), ...lead, ...library, ...tail]) if (!out.some((o) => key(o) === key(l))) out.push(l);
  return { ...reading, links: out.slice(0, max) };
}

const bodyLead = (body: ChartPointName): TermLink[] => (PLANET_GUIDE.has(body) ? [guide(body as Classical)] : []);

export const linkInSign = (reading: Interpretation | null, body: ChartPointName): Interpretation | null =>
  withLinks(reading, bodyLead(body), BODY_LINKS[body] ?? []);

export const linkInHouse = (reading: Interpretation | null, body: ChartPointName, house: number): Interpretation | null =>
  withLinks(reading, bodyLead(body), [...(BODY_LINKS[body] ?? []).slice(0, 1), HOUSE_LINKS[house], ...(BODY_LINKS[body] ?? []).slice(1)].filter(Boolean));

export const linkCusp = (reading: Interpretation | null, house: number, sign: ZodiacSign): Interpretation | null =>
  withLinks(reading, [guide(TRADITIONAL_RULER[sign])], [HOUSE_LINKS[house]]);
