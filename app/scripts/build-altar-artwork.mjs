// Build the altar cabinet's Living Library artwork from the pictures on disk:
// every herb, crystal, deity, tool and vessel in the Traditional Library that
// has a picture in assets/altar/objects becomes a cabinet item, with a form
// for each picture it has; and the seasonal things, natural finds, frames,
// offering foods and potted plants' stages are listed for the app's own logic. Writes the website's js/altar-artwork.js and the
// app's src/lib/altar/artworkData.ts, so both cabinets offer the same things.
//
// Run from app/:  node scripts/build-altar-artwork.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { decodePng, findOpening, pngSize } from './frame-opening.mjs';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(APP, '..');
const OBJECTS = path.join(ROOT, 'assets/altar/objects');
const source = fs.readFileSync(path.join(ROOT, 'js/traditional-library.js'), 'utf8');
const library = new Function(`${source}; return TraditionalLibrary;`)();

const exists = (rel) => fs.existsSync(path.join(OBJECTS, rel));
const image = (rel) => `../assets/altar/objects/${rel}`;
const folderOf = (key) => key.replaceAll('_', '-');
const small = new Set(['of', 'and', 'the', 'to', 'in']);
const titleOf = (key) =>
  key
    .split('_')
    .map((word, i) => (i > 0 && small.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
const nameOf = (type, key) => String(library[type][key].DisplayName || titleOf(key));
const keywordsOf = (record, field = 'Uses') =>
  String(record[field] || record.Purpose || record.Domains || '')
    .split(',')
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w && w.length <= 28)
    .slice(0, 5);

// The website's original herbs keep their order, keywords and file names.
const ORIGINAL_HERBS = [
  ['basil', ['protection', 'prosperity', 'love', 'courage', 'cleansing']],
  ['bay', ['wishes', 'protection', 'victory', 'divination', 'success'], 'bay-leaf', 'bay'],
  ['cedar', ['protection', 'purification', 'blessing', 'grounding', 'ancestors']],
  ['chamomile', ['calm', 'sleep', 'luck', 'money', 'healing']],
  ['cinnamon', ['prosperity', 'passion', 'speed', 'success', 'protection']],
  ['lavender', ['peace', 'sleep', 'love', 'healing', 'purification']],
  ['mugwort', ['dreams', 'divination', 'intuition', 'thresholds']],
  ['rosemary', ['protection', 'purification', 'remembrance', 'healing']],
  ['sage', ['cleansing', 'wisdom', 'protection', 'purification']],
];
const ORIGINAL_CRYSTALS = [
  ['amethyst', ['intuition', 'dreams', 'meditation', 'protection']],
  ['clear_quartz', ['amplification', 'clarity', 'healing', 'cleansing']],
];

function herbItem(key, keywords, folder = folderOf(key), fileBase = folder) {
  const pic = (form) => (exists(`herbs/${folder}/${fileBase}-${form}.png`) ? image(`herbs/${folder}/${fileBase}-${form}.png`) : '');
  return {
    category: 'herbs',
    name: nameOf('herb', key),
    icon: '🌿',
    keywords,
    forms: [
      { label: 'Sprig', image: pic('sprig'), type: 'herb', herb: key, form: 'sprig' },
      { label: 'Loose', image: pic('loose'), type: 'herb', herb: key, form: 'loose' },
      { label: 'Oil', image: pic('oil'), type: 'oil', herb: key, form: 'oil' },
      { label: 'Incense', image: image('herbs/incense/incense.png'), type: 'herb', herb: key, form: 'incense' },
    ],
  };
}

function crystalItem(key, keywords) {
  const folder = folderOf(key);
  const pic = (form) => (exists(`crystals/${folder}/${folder}-${form}.png`) ? image(`crystals/${folder}/${folder}-${form}.png`) : '');
  const forms = ['point', 'chips', 'cluster'].map((form) => ({
    label: form.charAt(0).toUpperCase() + form.slice(1),
    image: pic(form),
    type: 'crystal',
    crystal: key,
    form,
  }));
  if (pic('tumbled')) forms.push({ label: 'Tumbled', image: pic('tumbled'), type: 'crystal', crystal: key, form: 'tumbled' });
  return { category: 'crystals', name: nameOf('crystal', key), icon: '💎', keywords, forms };
}

const herbs = [
  ...ORIGINAL_HERBS.map(([key, keywords, folder, fileBase]) => herbItem(key, keywords, folder, fileBase)),
  ...Object.keys(library.herb)
    .filter((key) => !ORIGINAL_HERBS.some(([k]) => k === key))
    .map((key) => herbItem(key, keywordsOf(library.herb[key])))
    // Only herbs with at least one picture of their own.
    .filter((item) => item.forms.some((f) => f.form !== 'incense' && f.image))
    .sort((a, b) => a.name.localeCompare(b.name)),
];

const crystals = [
  ...ORIGINAL_CRYSTALS.map(([key, keywords]) => crystalItem(key, keywords)),
  ...Object.keys(library.crystal)
    .filter((key) => !ORIGINAL_CRYSTALS.some(([k]) => k === key))
    .map((key) => crystalItem(key, keywordsOf(library.crystal[key])))
    .filter((item) => item.forms.some((f) => f.image))
    .sort((a, b) => a.name.localeCompare(b.name)),
];

// Deities, tools and vessels beyond the website's hand-placed ones (Key,
// Athame, Raven Skull, Black Salt, Salt Circle, Hekate, Lilith, Cauldron, Spell Jar).
const HAND_PLACED = { deity: ['hekate', 'lilith'], tool: ['key', 'athame', 'raven_skull', 'black_salt', 'salt_circle', 'cauldron'], vessel: ['spell_jar'] };

const deities = Object.keys(library.deity)
  .filter((key) => !HAND_PLACED.deity.includes(key) && exists(`tools/deities/${key}/${key}-statue.png`))
  .map((key) => ({
    category: 'deities',
    name: `${nameOf('deity', key)} Statue`,
    icon: '🗝️',
    keywords: keywordsOf(library.deity[key], 'Domains'),
    forms: [{ label: 'Place', image: image(`tools/deities/${key}/${key}-statue.png`), type: 'deity', deity: key, form: 'statue' }],
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const single = (type, category, icon, dir) =>
  Object.keys(library[type])
    .filter((key) => !HAND_PLACED[type].includes(key) && exists(`${dir}/${folderOf(key)}/${folderOf(key)}.png`))
    .map((key) => ({
      category,
      name: nameOf(type, key),
      icon,
      keywords: keywordsOf(library[type][key], 'BestFor'),
      forms: [{ label: 'Place', image: image(`${dir}/${folderOf(key)}/${folderOf(key)}.png`), type, [type]: folderOf(key), form: 'standard' }],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

const tools = single('tool', 'tools', '🗝️', 'tools');

// The ancestor frame, in the styles that have a picture. Where each one's
// opening is (the flat white or see-through region inside it) is found from
// the picture itself, so a photo can be drawn into it.
const FRAME_STYLES = [
  ['gilt', 'Gilt'],
  ['wood', 'Wood'],
];
const ratioOf = (rel) => {
  const size = pngSize(fs.readFileSync(path.join(OBJECTS, rel)));
  return size ? Math.round((size.height / size.width) * 10000) / 10000 : null;
};
const frames = {};
for (const [style] of FRAME_STYLES) {
  const rel = `tools/ancestor-frame/ancestor-frame-${style}.png`;
  if (!exists(rel)) continue;
  const pixels = decodePng(fs.readFileSync(path.join(OBJECTS, rel)));
  const opening = pixels ? findOpening(pixels) : null;
  if (!opening) console.warn(`Altar artwork: no opening found in ${rel}; its photo won't show until the picture has a white or clear opening.`);
  frames[style] = { image: image(rel), ratio: ratioOf(rel), opening };
}
const frameForms = FRAME_STYLES.filter(([style]) => frames[style]).map(([style, label]) => ({ label, image: frames[style].image, type: 'tool', tool: 'ancestor-frame', form: style }));
if (frameForms.length) {
  tools.push({ category: 'tools', name: 'Ancestor Frame', icon: '🖼️', keywords: ['ancestors', 'remembrance', 'the beloved dead', 'photo', 'memorial'], forms: frameForms });
  tools.sort((a, b) => a.name.localeCompare(b.name));
}

// Seasonal things for the sabbats (named and tagged in src/lib/altar/seasonal.ts):
// every assets/altar/objects/seasonal/<id>/<id>.png.
const folderPictures = (dir) => {
  const full = path.join(OBJECTS, dir);
  if (!fs.existsSync(full)) return {};
  return Object.fromEntries(
    fs
      .readdirSync(full)
      .filter((id) => exists(`${dir}/${id}/${id}.png`))
      .sort()
      .map((id) => [id, image(`${dir}/${id}/${id}.png`)]),
  );
};
const seasonal = folderPictures('seasonal');

// Tools that aren't in the Traditional Library, and the Natural drawer's finds
// (named and described in src/lib/altar/shelf.ts): every tools/<id>/<id>.png
// the Library doesn't already place, and every natural/<id>/<id>.png.
// (Graveyard Dirt is placed by the cabinet by hand.)
const libraryTools = new Set([...Object.keys(library.tool).map(folderOf), 'grave-dirt']);
const shelfTools = Object.fromEntries(Object.entries(folderPictures('tools')).filter(([id]) => !libraryTools.has(id)));
const natural = folderPictures('natural');

// Food and flowers heaped without a bowl, drawn inside a vessel that holds them
// (src/lib/altar/offeringArt.ts): assets/altar/objects/offerings/<id>/<id>.png.
const offeringFoods = Object.fromEntries(
  Object.entries(folderPictures('offerings')).map(([id, src]) => [id, { image: src, ratio: ratioOf(`offerings/${id}/${id}.png`) }]),
);
const vessels = single('vessel', 'vessels', '🏺', 'vessels');

// Potted plants for your real houseplants (named and described in src/lib/altar/pottedPlants.ts):
// each plants/<id>/<id>-<stage>.png, for the stages young, established and lush.
// A plant with none of its pictures yet isn't listed; one with some offers those.
const PLANT_STAGES = ['young', 'established', 'lush'];
const plantsDir = path.join(OBJECTS, 'plants');
const plants = Object.fromEntries(
  (fs.existsSync(plantsDir) ? fs.readdirSync(plantsDir).sort() : [])
    .map((id) => [id, Object.fromEntries(PLANT_STAGES.filter((stage) => exists(`plants/${id}/${id}-${stage}.png`)).map((stage) => [stage, image(`plants/${id}/${id}-${stage}.png`)]))])
    .filter(([, stages]) => Object.keys(stages).length > 0),
);

// Candle colours: the website's twelve, then the Library's newer colours that have a vigil picture.
const CANDLE_COLORS = ['white', 'black', 'green', 'purple', 'red', 'orange', 'yellow', 'blue', 'brown', 'pink', 'gold', 'silver'];
const candleColors = [
  ...CANDLE_COLORS,
  ...Object.keys(library.candle).filter((key) => !key.startsWith('_') && key !== 'styles' && !CANDLE_COLORS.includes(key) && exists(`candles/${key}-candle.png`)),
];
// Candle forms beyond the catalogue's five, with a picture in every colour.
const STYLE_FORMS = [
  ['votive', 'Votive Candle', ['votive']],
  ['jar', 'Jar Candle', ['jar candle', 'container candle']],
  ['novena', 'Novena Candle', ['novena', 'glass candle']],
  ['floating', 'Floating Candle', ['floating']],
  ['birthday', 'Birthday Candle', ['birthday', 'spiral']],
  ['figure', 'Figure Candle', ['figure', 'figural', 'image candle']],
  ['figure-male', 'Male Figure Candle', ['figure', 'man', 'male', 'image candle']],
  ['figure-female', 'Female Figure Candle', ['figure', 'woman', 'female', 'image candle']],
  ['figure-couple', 'Lovers Candle', ['lovers', 'couple', 'embracing', 'marriage']],
  ['phallus', 'Phallus Candle', ['phallus', 'male genital', 'fertility', 'virility']],
  ['yoni', 'Yoni Candle', ['yoni', 'female genital', 'fertility', 'sacred feminine']],
  ['beeswax-rolled', 'Rolled Beeswax Candle', ['beeswax', 'rolled', 'honeycomb']],
  ['seven-knob', 'Seven-Knob Candle', ['seven knob', 'knob candle', 'wishing candle']],
  ['double-action', 'Double-Action Candle', ['double action', 'two colour']],
  ['reversible', 'Reversible Candle', ['reversible', 'reversing']],
];
const candleStyleForms = STYLE_FORMS.filter(([id]) => candleColors.every((color) => exists(`candles/${id}/${color}-${id}.png`))).map(
  ([id, label, aliases]) => ({ id, label, aliases, supportedAsset: true }),
);

// Where each candle form's wick is (scripts/find-candle-wicks.py), so the flame sits on it.
const wicksPath = path.join(OBJECTS, 'candles/wicks.json');
const candleWicks = fs.existsSync(wicksPath) ? JSON.parse(fs.readFileSync(wicksPath, 'utf8')) : {};

// Each deity's pantheon, for grouping the cabinet's deity drawer (Irish, Welsh and
// Gaulish gods are all Celtic; anything else outside the main pantheons is Other).
const PANTHEON_GROUPS = ['Celtic', 'Egyptian', 'Greek', 'Hindu', 'Norse', 'Roman', 'Slavic'];
const deityPantheons = Object.fromEntries(
  Object.entries(library.deity).map(([key, record]) => {
    const pantheon = String(record.Pantheon || '');
    const group = /welsh|irish|gaulish/i.test(pantheon) ? 'Celtic' : PANTHEON_GROUPS.find((name) => pantheon.startsWith(name)) ?? 'Other';
    return [key, group];
  }),
);

// Altar backgrounds beyond the website's two originals: every picture in
// assets/altar/backgrounds, in this order, named here.
const BACKGROUND_NAMES = {
  ocean: 'Moonlit Shore',
  river: 'Forest River',
  'witch-cabin': 'Witch’s Cabin',
  'dark-academia': 'Dark Academia Study',
  gothic: 'Gothic Crypt',
  cottagecore: 'Cottagecore Garden',
  celestial: 'Celestial Hilltop',
  'winter-yule': 'Yule Hearth',
  'spring-meadow': 'Spring Meadow',
  'autumn-harvest': 'Autumn Harvest',
  'desert-temple': 'Desert Temple',
  'candlelit-cave': 'Candlelit Crystal Cave',
};
const ORIGINAL_BACKGROUNDS = new Set(['forest-scene', 'shelf-deity-altar', 'wooden-altar2']);
const backgroundsDir = path.join(ROOT, 'assets/altar/backgrounds');
const backgroundFiles = fs.existsSync(backgroundsDir) ? fs.readdirSync(backgroundsDir).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)) : [];
const backgrounds = [
  ...Object.keys(BACKGROUND_NAMES).filter((id) => backgroundFiles.includes(id)),
  ...backgroundFiles.filter((id) => !ORIGINAL_BACKGROUNDS.has(id) && !(id in BACKGROUND_NAMES)).sort(),
].map((id) => ({ id, name: BACKGROUND_NAMES[id] ?? titleOf(id.replaceAll('-', '_')), assetPath: `/assets/altar/backgrounds/${id}.png` }));

const items = { herbs, crystals, deities, tools, vessels };
const data = { candleColors, candleStyleForms, candleWicks, pantheonGroups: [...PANTHEON_GROUPS, 'Other'], deityPantheons, backgrounds, seasonal, shelfTools, natural, frames, offeringFoods, plants, items };
const count = Object.values(items).reduce((n, list) => n + list.length, 0);

fs.writeFileSync(
  path.join(ROOT, 'js/altar-artwork.js'),
  `/* Generated by app/scripts/build-altar-artwork.mjs from the pictures in assets/altar/objects. Do not edit by hand. */\n` +
    `(function (global) {\n  global.AltarArtwork = ${JSON.stringify(data, null, 2).replace(/\n/g, '\n  ')};\n` +
    `  if (typeof module !== "undefined" && module.exports) module.exports = global.AltarArtwork;\n})(typeof window !== "undefined" ? window : globalThis);\n`,
);

const app = JSON.parse(JSON.stringify(data));
for (const list of Object.values(app.items)) for (const item of list) delete item.icon;
fs.writeFileSync(
  path.join(APP, 'src/lib/altar/artworkData.ts'),
  `// Generated by scripts/build-altar-artwork.mjs from the pictures in ../assets/altar/objects. Do not edit by hand.\n` +
    `import type { CabinetForm } from './types.ts';\n\n` +
    `type ArtworkItem = { category: 'herbs' | 'crystals' | 'deities' | 'tools' | 'vessels'; name: string; keywords: string[]; forms: CabinetForm[] };\n\n` +
    `export const ALTAR_ARTWORK: {\n  candleColors: string[];\n  candleStyleForms: { id: string; label: string; aliases: string[]; supportedAsset: boolean }[];\n  candleWicks: Record<string, [number, number]>;\n  pantheonGroups: string[];\n  deityPantheons: Record<string, string>;\n  backgrounds: { id: string; name: string; assetPath: string }[];\n  seasonal: Record<string, string>;\n  shelfTools: Record<string, string>;\n  natural: Record<string, string>;\n  frames: Record<string, { image: string; ratio: number | null; opening: { left: number; top: number; width: number; height: number; oval: boolean } | null }>;\n  offeringFoods: Record<string, { image: string; ratio: number | null }>;\n  plants: Record<string, Partial<Record<'young' | 'established' | 'lush', string>>>;\n  items: Record<'herbs' | 'crystals' | 'deities' | 'tools' | 'vessels', ArtworkItem[]>;\n} = ${JSON.stringify(app, null, 2)};\n`,
);
console.log(`Altar artwork: ${backgrounds.length} extra backgrounds; ${count} items (herbs ${herbs.length}, crystals ${crystals.length}, deities ${deities.length}, tools ${tools.length}, vessels ${vessels.length}); ${candleColors.length} candle colours; ${candleStyleForms.length} extra candle forms; ${Object.keys(seasonal).length} seasonal, ${Object.keys(shelfTools).length} more tools, ${Object.keys(natural).length} natural, ${Object.keys(frames).length} frames, ${Object.keys(offeringFoods).length} offering foods, ${Object.keys(plants).length} potted plants`);
