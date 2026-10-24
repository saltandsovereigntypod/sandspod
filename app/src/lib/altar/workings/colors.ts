// The colour each ingredient shows as a layer in a jar or a pinch in a
// sachet: its own colour when it's known (lavender is purple, salt is white),
// otherwise its element's, otherwise a warm earth tone picked from its name.

import { normalizeName } from '../../library/model.ts';
import type { ElementOrSpirit } from '../reading/correspondence.ts';

const KNOWN: Record<string, string> = {
  // herbs and resins
  basil: '#4f7a3a', bay: '#6f7d3c', cedar: '#8a5a3b', chamomile: '#e3c75a', cinnamon: '#8b4a2b', clove: '#5a3523',
  frankincense: '#d9b56a', jasmine: '#efe6cf', lavender: '#8d7bb8', 'lemon balm': '#9db35a', mint: '#5f9a5f',
  mugwort: '#7d8c74', myrrh: '#9a5b33', nettle: '#3f6b3a', patchouli: '#5b4a33', rose: '#c9707f', rosemary: '#55704d',
  sage: '#9aa58a', thyme: '#6c7d4f', yarrow: '#e8e0c4', calendula: '#e59a2f', cypress: '#3e5a3e', dandelion: '#e8c43a',
  garlic: '#eee7d6', hyssop: '#5e6ea8', juniper: '#3d5466', peppermint: '#4f8f5f', saffron: '#d9622b', wormwood: '#a3ab92',
  yew: '#2f4a33', mandrake: '#7a5c45', vervain: '#9a86b8', rue: '#7d9a5a', elder: '#3b2f45', hawthorn: '#b0413e',
  rowan: '#c8462e', "st john s wort": '#e2b33a', "dragon s blood": '#7a1f1f', 'dragons blood': '#7a1f1f', 'star anise': '#6b3f2a',
  oak: '#7a5a35', birch: '#e9e2d0', willow: '#9fae7d', holly: '#2f5a33', mistletoe: '#c9cf9a', meadowsweet: '#efe4c0',
  angelica: '#a6b57d', valerian: '#c9b7a3', catnip: '#8faa7a', comfrey: '#4d6b45', 'dittany of crete': '#b5a5b5',
  allspice: '#6a3b26', ginger: '#c99a5a', 'black pepper': '#2c2622', lemongrass: '#c5c56a', 'orris root': '#d8c8a8',
  sandalwood: '#c49a6c', copal: '#e7d39a', vanilla: '#3b2a20', 'bay leaf': '#6f7d3c',
  anise: '#a8977a', borage: '#4f6fb8', cardamom: '#8fa267', cinquefoil: '#e3c348', 'red clover': '#b85a86',
  damiana: '#7d8a55', eucalyptus: '#8aa69e', fennel: '#a9b86a', galangal: '#c9a27a', heather: '#a3628f',
  hibiscus: '#a3243b', honeysuckle: '#f0dca0', lilac: '#b89ad2', mullein: '#b9ba98', nutmeg: '#7a4e2e',
  passionflower: '#8676b8', pine: '#3f5d3a', rosehip: '#c4462c', 'rose hip': '#c4462c', sunflower: '#e8b923',
  violet: '#6b4a9c',
  // salts and the like
  salt: '#f1ede4', 'sea salt': '#eef0ee', 'black salt': '#24211f', 'pink salt': '#e7b7b0', 'himalayan salt': '#e7b7b0',
  'epsom salt': '#f4f6f7', 'red brick dust': '#a4442e', sugar: '#f6f1e6', honey: '#d99a2b', rice: '#f0ebdf',
  coffee: '#4a2f22', 'eggshell powder': '#f5f0e6', cascarilla: '#f5f0e6', ash: '#8c8780', 'graveyard dirt': '#4a3c30',
  dirt: '#5c4632', soil: '#5c4632', sand: '#d8c19a', 'pins': '#a9adb2', nails: '#7d7f82', coins: '#c9a646',
  // stones
  amethyst: '#8a5fb0', 'black tourmaline': '#1f1f22', carnelian: '#c4562e', citrine: '#e2b23e', 'clear quartz': '#e9eef2',
  fluorite: '#7fa7a3', garnet: '#7c1f2a', 'green aventurine': '#4f9a6a', hematite: '#4d4f55', labradorite: '#5d7686',
  'lapis lazuli': '#28418f', malachite: '#1f7a55', moonstone: '#e4e6ea', 'moss agate': '#8ea98a', obsidian: '#141416',
  pyrite: '#b9a35a', 'rose quartz': '#efc1c8', selenite: '#f6f4ee', 'smoky quartz': '#6a5a4f', 'tiger eye': '#a8742c',
  jet: '#121212', bloodstone: '#2d4a3a', onyx: '#1a1a1a', 'red jasper': '#9a3a2c', sunstone: '#e08a4a', shungite: '#232323',
  kyanite: '#4f75a8', rhodonite: '#c97a8a', rhodochrosite: '#d67f8c', amber: '#d9902a', aquamarine: '#8fc6cf',
  'blue lace agate': '#a9c3df', chrysocolla: '#3f9a9a', emerald: '#2f8a5a', peridot: '#9cb83a', turquoise: '#3fb0a9',
  ruby: '#a3162f', sapphire: '#22408f', opal: '#dfe6e9', howlite: '#eeeeea', lepidolite: '#b49ac6', sodalite: '#2f4f8f',
  unakite: '#9a8a6a', jade: '#4d9a6a', chrysoprase: '#7fc08f', 'apache tear': '#1c1a1a', celestite: '#a9c6e3',
  'herkimer diamond': '#f1f4f6', angelite: '#a9bfe0', ametrine: '#b48ac0',
  aragonite: '#c4895a', azurite: '#1f3f9a', 'orange calcite': '#e8954a', charoite: '#8a5aa8', danburite: '#f2ece6',
  'dalmatian jasper': '#e8e0cf', larimar: '#8fcde0', prehnite: '#bcd8a0', 'rutilated quartz': '#e8d9a8',
  'snowflake obsidian': '#2a2a2c', 'tourmalinated quartz': '#d9dadc', 'ocean jasper': '#9db58a', mookaite: '#b0563f',
  'pink tourmaline': '#e17aa0', iolite: '#5a5fa8', morganite: '#f2c2b4', amazonite: '#6fc4b4', 'blue apatite': '#2fa0c4',
  'spirit quartz': '#a68ab8', 'desert rose': '#d4b08c',
  // candle wax colours, for seals
  white: '#f2ede1', black: '#1d1b1a', red: '#a52a2a', green: '#3f7a4a', blue: '#335c99', yellow: '#e2c041', orange: '#d9772b',
  purple: '#6f4a9a', pink: '#e39fb5', gold: '#cfa443', silver: '#bfc3c7', brown: '#6b4a32', grey: '#8a8a8a', indigo: '#3b3a7a',
  magenta: '#b0307a', rainbow: '#c98ab8',
};

const ELEMENT_COLOR: Record<ElementOrSpirit, string> = {
  Fire: '#b5532f',
  Water: '#3e6e8e',
  Air: '#d8c88a',
  Earth: '#6b5a3a',
  Spirit: '#cdbfe0',
};

const EARTH_TONES = ['#8a6a4a', '#a58a5a', '#6f7d5a', '#9a7a6a', '#7a6a5a', '#b0905f', '#5f6a4f', '#9a8a6f'];

/** The colour an ingredient shows. */
export function ingredientColor(name: string, element?: ElementOrSpirit | null): string {
  const key = normalizeName(name).replace(/[’']/g, ' ').replace(/\s+/g, ' ').trim();
  if (KNOWN[key]) return KNOWN[key];
  // "dried lavender", "lavender buds", "rose petals"
  const word = Object.keys(KNOWN)
    .filter((k) => key.includes(k))
    .sort((a, b) => b.length - a.length)[0];
  if (word) return KNOWN[word];
  if (element) return ELEMENT_COLOR[element];
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return EARTH_TONES[hash % EARTH_TONES.length];
}

/** The colour of a candle's wax, by its saved colour name. */
export const waxColor = (color: string) => KNOWN[normalizeName(color)] ?? KNOWN.red;
