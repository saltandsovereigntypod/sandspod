// The blending lab: herbs, resins and essential oils from the Living Library
// and your shelves, put together as a loose incense, an anointing oil, a
// powder or a tea for one intent. It reads what the parts share and where
// they pull against each other, their elements and planets, and the safety
// of each part for the form chosen: oils that burn skin, smoke that harms,
// what must never be drunk, pregnancy, and cats, dogs and birds. Oils come
// with a dilution worked out in drops. Blends are kept in the craft
// collection `kitchen.blends` and can be written into the Grimoire.
//
// The safety notes follow widely published guidance: for essential oils,
// Tisserand & Young, Essential Oil Safety (2nd ed., 2014); for pets, the
// ASPCA's toxic plant lists. They are general notes, not medical advice. Pure.

import type { LibraryEntry } from '../../library/types.ts';
import { correspondenceOf, ELEMENTS, entryByName, PLANET_DAY, planetPossessive, tally, WEEKDAY_NAMES, type Element, type Planet } from '../../altar/reading/correspondence.ts';

export const BLENDS = 'kitchen.blends';

export type BlendForm = 'incense' | 'oil' | 'powder' | 'tea';
export type PartAs = 'herb' | 'resin' | 'oil';

export const FORMS: { key: BlendForm; label: string; line: string }[] = [
  { key: 'incense', label: 'Loose incense', line: 'Burned a pinch at a time on a charcoal disc or a warmer.' },
  { key: 'oil', label: 'Anointing oil', line: 'Essential oils, or dried herbs infused, in a carrier oil.' },
  { key: 'powder', label: 'Powder', line: 'Ground fine, to dress candles, sprinkle a threshold or fill a sachet.' },
  { key: 'tea', label: 'Tea', line: 'Dried herbs steeped in hot water, to drink.' },
];

export const AS_LABEL: Record<PartAs, string> = { herb: 'Dried herb', resin: 'Resin', oil: 'Essential oil' };

export type BlendPart = {
  name: string;
  as: PartAs;
  /** Parts by measure (a spoon, a pinch); for oils in an oil blend, its share of the drops. */
  parts: number;
  /** The Living Library entry it was read from, when known. */
  entryId?: string;
  /** A thing on My Shelves it came from. */
  shelfId?: string;
};

export type Blend = {
  name: string;
  form: BlendForm;
  intent: string;
  parts: BlendPart[];
  /** Oils: the carrier and how much of it. */
  carrier: string;
  carrierMl: number;
  /** Oils: the dilution chosen (a percentage). */
  strength: number;
  notes: string;
  /** When it was made, if it was (ISO), or ''. */
  madeAt: string;
};

export const PARTS_MAX = 12;
export const NAME_MAX = 80;

export const CARRIERS = ['Jojoba', 'Sweet almond', 'Fractionated coconut', 'Olive', 'Sunflower', 'Grapeseed'];

/** Dilutions for skin, as commonly advised. 1 ml is taken as 20 drops; droppers vary. */
export const STRENGTHS: { value: number; label: string; line: string }[] = [
  { value: 0.5, label: '0.5%', line: 'The face, sensitive skin, older people, and pregnancy (after asking your midwife).' },
  { value: 1, label: '1%', line: 'Gentle, for oils you’ll wear often or on a wide area.' },
  { value: 2, label: '2%', line: 'The usual strength for adults: candles, wrists, a dab over the heart.' },
  { value: 3, label: '3%', line: 'The most for skin, and only a small area for a short time.' },
];

export const DROPS_PER_ML = 20;

export function emptyBlend(form: BlendForm = 'incense', intent = ''): Blend {
  return { name: '', form, intent, parts: [], carrier: 'Jojoba', carrierMl: 10, strength: 2, notes: '', madeAt: '' };
}

// ─── Safety, by plant ─────────────────────────────────────────────────────

/**
 * How a plant stands for each use.
 * skin (as an essential oil): ok · care (patch test, keep low) · low (irritant or sensitiser: 0.5% at most, or leave out) · sun (phototoxic) · never.
 * burn: ok · care (harsh or strong smoke) · never (poisonous or dangerous smoke).
 * drink: food (a common kitchen or tea herb) · care (with its note) · never.
 */
type Skin = 'ok' | 'care' | 'low' | 'sun' | 'never';
type Burn = 'ok' | 'care' | 'never';
type Drink = 'food' | 'care' | 'never';
type PlantSafety = {
  skin?: Skin;
  burn?: Burn;
  drink?: Drink;
  /** Commonly advised against in pregnancy (as herb, oil or both). */
  pregnancy?: boolean;
  cats?: boolean;
  dogs?: boolean;
  note?: string;
};

const POISON = 'Poisonous. Keep it in the Library to be known, never in a blend.';

/** Keys are loose names (lower case, letters and spaces). */
const PLANTS: Record<string, PlantSafety> = {
  basil: { skin: 'low', drink: 'food', cats: false, note: 'Basil oil is high in estragole; keep it very low on skin.' },
  bay: { skin: 'low', drink: 'food', note: 'Bay leaf oil can sensitise skin. In tea, strain out the leaf.' },
  cedar: { skin: 'care', burn: 'ok', drink: 'never', pregnancy: true, note: 'Cedarwood oil is commonly avoided in pregnancy.' },
  chamomile: { skin: 'ok', drink: 'food', cats: true, dogs: true, note: 'A daisy-family plant: hayfever and ragweed allergies can react.' },
  cinnamon: { skin: 'never', burn: 'ok', drink: 'care', cats: true, dogs: true, note: 'Cinnamon bark oil burns skin even well diluted. As a drink, cassia (the usual supermarket cinnamon) is high in coumarin; keep to a little.' },
  clove: { skin: 'low', burn: 'ok', drink: 'food', pregnancy: true, cats: true, note: 'Clove oil irritates skin and mucous membranes; keep it to 0.5% at most.' },
  frankincense: { skin: 'ok', burn: 'ok', drink: 'never' },
  jasmine: { skin: 'low', drink: 'care', note: 'Jasmine absolute can sensitise skin. Only true jasmine (Jasminum) is drunk; “yellow jasmine” (Gelsemium) is deadly.' },
  lavender: { skin: 'ok', burn: 'ok', drink: 'care', cats: true, dogs: true, note: 'Lavender tea is strong-tasting; a pinch is plenty.' },
  'lemon balm': { skin: 'low', drink: 'food', note: 'Melissa oil can sensitise skin.' },
  mint: { skin: 'care', drink: 'food', cats: true, dogs: true, note: 'Mint oils are not for young children or near the face.' },
  peppermint: { skin: 'care', drink: 'food', cats: true, dogs: true, note: 'Peppermint oil is not for children under six or near the face.' },
  mugwort: { skin: 'never', burn: 'care', drink: 'never', pregnancy: true, cats: true, dogs: true, note: 'Mugwort oil is high in thujone. The smoke is strong; the herb is traditionally avoided in pregnancy.' },
  myrrh: { skin: 'ok', burn: 'ok', drink: 'never', pregnancy: true },
  nettle: { skin: 'ok', drink: 'care', pregnancy: true, note: 'Nettle tea can lower blood pressure and sugar; ask first if you take medicine for either.' },
  patchouli: { skin: 'ok', burn: 'ok', drink: 'never' },
  rose: { skin: 'ok', burn: 'ok', drink: 'food' },
  rosemary: { skin: 'care', burn: 'ok', drink: 'food', pregnancy: true, note: 'Rosemary oil is a caution with epilepsy and high blood pressure.' },
  sage: { skin: 'low', burn: 'ok', drink: 'care', pregnancy: true, note: 'Garden sage holds thujone: a cup now and then, not daily, and not in pregnancy. White sage is a sacred plant to many Native nations and is over-harvested; grow your own or choose garden sage.' },
  thyme: { skin: 'low', drink: 'food', pregnancy: true, note: 'Thyme oil is rich in phenols and burns skin; the herb is gentle.' },
  yarrow: { skin: 'care', burn: 'ok', drink: 'care', pregnancy: true, cats: true, dogs: true, note: 'A daisy-family plant; traditionally avoided in pregnancy.' },
  calendula: { skin: 'ok', drink: 'food', note: 'A daisy-family plant: allergies can react.' },
  cypress: { skin: 'ok', burn: 'ok', drink: 'never', pregnancy: true },
  dandelion: { drink: 'food', note: 'Dandelion is a diuretic; ask first if you take medicine for blood pressure or water.' },
  garlic: { skin: 'never', drink: 'food', cats: true, dogs: true, note: 'Garlic oil burns skin. Garlic is poisonous to cats and dogs.' },
  hyssop: { skin: 'never', burn: 'ok', drink: 'care', pregnancy: true, note: 'Hyssop oil can bring on seizures; never use it on skin.' },
  juniper: { skin: 'care', burn: 'ok', drink: 'care', pregnancy: true, dogs: true, note: 'Juniper berries are not for pregnancy or kidney trouble.' },
  saffron: { drink: 'care', pregnancy: true, note: 'A few threads only; large amounts are toxic.' },
  wormwood: { skin: 'never', burn: 'care', drink: 'never', pregnancy: true, cats: true, dogs: true, note: 'Wormwood is high in thujone, a nerve poison.' },
  yew: { skin: 'never', burn: 'never', drink: 'never', pregnancy: true, cats: true, dogs: true, note: POISON },
  mandrake: { skin: 'never', burn: 'never', drink: 'never', pregnancy: true, cats: true, dogs: true, note: POISON },
  belladonna: { skin: 'never', burn: 'never', drink: 'never', pregnancy: true, cats: true, dogs: true, note: POISON },
  foxglove: { skin: 'never', burn: 'never', drink: 'never', pregnancy: true, cats: true, dogs: true, note: POISON },
  vervain: { drink: 'care', pregnancy: true, note: 'Traditionally avoided in pregnancy.' },
  rue: { skin: 'never', burn: 'care', drink: 'never', pregnancy: true, cats: true, dogs: true, note: 'Rue sap blisters skin in sunlight and the plant can cause miscarriage.' },
  elder: { drink: 'care', note: 'Only the cooked berries and the flowers; raw berries, leaves, stems and bark are poisonous.' },
  hawthorn: { drink: 'care', note: 'Hawthorn acts on the heart; ask first if you take heart or blood pressure medicine.' },
  rowan: { burn: 'ok', drink: 'care', note: 'Rowan berries are eaten only cooked.' },
  'st johns wort': { skin: 'sun', drink: 'care', pregnancy: true, note: 'St John’s wort weakens many medicines, the contraceptive pill among them, and makes skin burn in sun.' },
  'dragons blood': { skin: 'care', burn: 'ok', drink: 'never', note: 'Dragon’s blood resin stains; the “oil” sold under the name is usually a perfume, not an essential oil.' },
  'star anise': { skin: 'low', drink: 'care', pregnancy: true, note: 'Only Chinese star anise is drunk; Japanese star anise looks alike and is poisonous. Buy from a food supplier.' },
  oak: { burn: 'ok', drink: 'never' },
  birch: { skin: 'never', burn: 'ok', drink: 'never', note: 'Sweet birch oil, like wintergreen, is almost pure methyl salicylate: never on skin.' },
  willow: { burn: 'ok', drink: 'care', note: 'Willow bark holds salicylates: not with an aspirin allergy or blood thinners.' },
  holly: { burn: 'care', drink: 'never', cats: true, dogs: true, note: 'Holly berries are poisonous.' },
  mistletoe: { burn: 'never', drink: 'never', pregnancy: true, cats: true, dogs: true, note: POISON },
  meadowsweet: { drink: 'care', note: 'Meadowsweet holds salicylates: not with an aspirin allergy.' },
  angelica: { skin: 'sun', drink: 'care', pregnancy: true, note: 'Angelica root oil is phototoxic; the herb is avoided in pregnancy.' },
  valerian: { drink: 'care', note: 'Valerian is sedating: not with alcohol, sleeping pills or before driving.' },
  catnip: { drink: 'food', pregnancy: true },
  comfrey: { drink: 'never', note: 'Comfrey holds alkaloids that harm the liver; it is not drunk.' },
  'dittany of crete': { drink: 'care', pregnancy: true },
  allspice: { skin: 'low', drink: 'food' },
  ginger: { skin: 'ok', drink: 'food' },
  'black pepper': { skin: 'care', burn: 'care', drink: 'food', note: 'Pepper smoke stings eyes and throat.' },
  lemongrass: { skin: 'low', drink: 'food', cats: true, dogs: true, note: 'Lemongrass oil can sensitise skin.' },
  'orris root': { burn: 'ok', drink: 'never', note: 'Orris powder is a known allergen to breathe in.' },
  sandalwood: { skin: 'ok', burn: 'ok', drink: 'never', note: 'Indian sandalwood is endangered; choose a sustainably grown kind.' },
  copal: { skin: 'never', burn: 'ok', drink: 'never' },
  vanilla: { skin: 'care', burn: 'ok', drink: 'food' },
  anise: { skin: 'low', drink: 'food', pregnancy: true },
  borage: { drink: 'never', note: 'Borage holds liver-harming alkaloids; it is not drunk as a tea.' },
  cardamom: { skin: 'ok', drink: 'food' },
  cinquefoil: { drink: 'care' },
  'red clover': { drink: 'care', pregnancy: true, note: 'Not with blood thinners or hormone-sensitive conditions.' },
  damiana: { drink: 'care', pregnancy: true },
  eucalyptus: { skin: 'care', burn: 'care', drink: 'never', cats: true, dogs: true, note: 'Not for young children’s faces; poisonous to swallow.' },
  fennel: { skin: 'low', drink: 'food', pregnancy: true, note: 'Fennel oil is avoided in pregnancy and with hormone-sensitive conditions.' },
  galangal: { drink: 'food' },
  heather: { burn: 'ok', drink: 'care' },
  hibiscus: { drink: 'care', pregnancy: true, note: 'Hibiscus lowers blood pressure.' },
  honeysuckle: { drink: 'care', cats: true, dogs: true, note: 'The berries of many honeysuckles are poisonous; only the flowers are used.' },
  lilac: { burn: 'ok', drink: 'care' },
  mullein: { burn: 'care', drink: 'care', note: 'Strain mullein tea through cloth: its hairs catch in the throat.' },
  nutmeg: { skin: 'low', drink: 'care', pregnancy: true, dogs: true, note: 'A grating in food only; large amounts are toxic.' },
  passionflower: { drink: 'care', pregnancy: true, note: 'Sedating: not with alcohol or sleeping pills.' },
  pine: { skin: 'care', burn: 'ok', drink: 'care', pregnancy: true, cats: true, dogs: true, note: 'Some trees called pine are poisonous (yew, Norfolk Island pine); be sure of the tree.' },
  rosehip: { drink: 'food', note: 'Strain well: the seed hairs irritate.' },
  sunflower: { drink: 'food' },
  violet: { drink: 'food' },
  // Not in the Library's herbs, but common in blends.
  wintergreen: { skin: 'never', drink: 'never', cats: true, dogs: true, note: 'Almost pure methyl salicylate: harmful on skin and deadly to swallow.' },
  pennyroyal: { skin: 'never', burn: 'never', drink: 'never', pregnancy: true, cats: true, dogs: true, note: 'Pennyroyal oil has caused deaths and miscarriage.' },
  'tea tree': { skin: 'care', drink: 'never', cats: true, dogs: true, note: 'Tea tree oil is poisonous to cats and dogs, even through the skin.' },
  'ylang ylang': { skin: 'low', cats: true, dogs: true },
  bergamot: { skin: 'sun', drink: 'food', cats: true, note: 'Cold-pressed bergamot oil burns skin in sunlight; choose bergapten-free.' },
  lemon: { skin: 'sun', drink: 'food', cats: true, dogs: true },
  lime: { skin: 'sun', drink: 'food', cats: true, dogs: true },
  orange: { skin: 'ok', drink: 'food', cats: true, dogs: true },
  grapefruit: { skin: 'sun', drink: 'food', cats: true, dogs: true },
  oregano: { skin: 'never', drink: 'food', note: 'Oregano oil burns skin.' },
  cassia: { skin: 'never', drink: 'care' },
  'clary sage': { skin: 'ok', drink: 'never', pregnancy: true },
  benzoin: { skin: 'care', burn: 'ok', drink: 'never' },
  'palo santo': { burn: 'ok', drink: 'never', note: 'Choose wood from fallen trees, gathered under licence.' },
  tobacco: { burn: 'care', drink: 'never', cats: true, dogs: true, note: 'Tobacco is a sacred plant to many Native nations; nicotine is poisonous to pets.' },
  cayenne: { skin: 'never', burn: 'never', drink: 'food', note: 'Chilli smoke is the burn of pepper spray.' },
  chilli: { skin: 'never', burn: 'never', drink: 'food', note: 'Chilli smoke is the burn of pepper spray.' },
  datura: { skin: 'never', burn: 'never', drink: 'never', cats: true, dogs: true, note: POISON },
  henbane: { skin: 'never', burn: 'never', drink: 'never', cats: true, dogs: true, note: POISON },
};

const loose = (name: string) =>
  name
    .toLowerCase()
    .replace(/[’'.]/g, '')
    .replace(/\b(essential oil|oil|absolute|resin|tears|dried|loose|powder|ground|leaf|leaves|root|bark|flowers?|berries|needles?|chips|sprig|whole)\b/g, '')
    .replace(/[^a-z]+/g, ' ')
    .trim();

/** A plant's safety notes, by its name ("Clove oil", "St. John’s wort"). */
export function plantSafety(name: string): PlantSafety | null {
  const key = loose(name);
  if (!key) return null;
  if (PLANTS[key]) return PLANTS[key];
  const hit = Object.keys(PLANTS)
    .sort((a, b) => b.length - a.length)
    .find((k) => key === k || key.startsWith(`${k} `) || key.endsWith(` ${k}`));
  return hit ? PLANTS[hit] : null;
}

export type Level = 'stop' | 'care' | 'info';
export type BlendNote = { level: Level; title: string; text: string; part?: string };

const RESIN_WORDS = /\b(frankincense|myrrh|copal|dragons? blood|benzoin|amber|resin|pine resin|sandarac|mastic)\b/;
const isResin = (p: Pick<BlendPart, 'name' | 'as'>) => p.as === 'resin' || RESIN_WORDS.test(p.name.toLowerCase().replace(/[’']/g, ''));

/** What each part asks of this form, worst first; then the notes every blend of this form carries. */
export function blendSafety(blend: Pick<Blend, 'form' | 'parts'>): BlendNote[] {
  const out: BlendNote[] = [];
  const add = (n: BlendNote) => {
    if (!out.some((x) => x.title === n.title && x.part === n.part)) out.push(n);
  };
  const pregnant: string[] = [];
  const cats: string[] = [];
  const dogs: string[] = [];
  for (const part of blend.parts) {
    const s = plantSafety(part.name);
    const name = part.name;
    if (!s) {
      add({ level: 'info', part: name, title: `${name}: no notes held`, text: `We hold no safety notes for ${name}. Look it up in a trusted herbal before you use it${blend.form === 'tea' ? ', and never drink a plant you can’t name for certain' : ''}.` });
      continue;
    }
    if (s.pregnancy) pregnant.push(name);
    if (s.cats) cats.push(name);
    if (s.dogs) dogs.push(name);
    const note = s.note ? ` ${s.note}` : '';
    if (s.burn === 'never' && s.drink === 'never' && s.skin === 'never') {
      add({ level: 'stop', part: name, title: `${name} is poisonous`, text: `${name} doesn’t belong in a blend of any kind.${note}` });
      continue;
    }
    if (blend.form === 'oil') {
      if (part.as === 'oil' || part.as === 'resin') {
        if (s.skin === 'never') add({ level: 'stop', part: name, title: `${name} oil is not for skin`, text: `Leave it out of an oil you’ll wear or rub on candles you hold.${note}` });
        else if (s.skin === 'low') add({ level: 'care', part: name, title: `${name} oil: keep it very low`, text: `A known irritant or sensitiser. Keep it to 0.5% of the blend or less (one drop in 10 ml), and patch test.${note}` });
        else if (s.skin === 'sun') add({ level: 'care', part: name, title: `${name} oil and sunlight`, text: `Phototoxic: skin it touches can burn in sun or under a sunbed for up to 12 hours. Use it at night, or on candles only.${note}` });
        else if (s.skin === 'care') add({ level: 'care', part: name, title: `${name} oil: patch test`, text: `Keep it to 1% and patch test first.${note}` });
      } else if (s.skin === 'never' || s.skin === 'low') {
        add({ level: 'care', part: name, title: `${name} infused in oil`, text: `An infusion is far milder than the essential oil, but ${name} can still irritate. Strain it well and patch test.${note}` });
      }
    } else if (blend.form === 'incense') {
      if (s.burn === 'never') add({ level: 'stop', part: name, title: `Don’t burn ${name}`, text: `Its smoke is harmful.${note}` });
      else if (s.burn === 'care') add({ level: 'care', part: name, title: `${name} smoke is harsh`, text: `Burn only a pinch, with a window open.${note}` });
    } else if (blend.form === 'tea') {
      if (s.drink === 'never') add({ level: 'stop', part: name, title: `${name} is not for drinking`, text: `Leave it out of anything you swallow.${note}` });
      else if (s.drink === 'care') add({ level: 'care', part: name, title: `${name} in tea`, text: (s.note ?? 'Fine in small amounts; ask first if you take regular medicine.').trim() });
      else if (part.as === 'oil') add({ level: 'stop', part: name, title: `No essential oils in tea`, text: 'Essential oils don’t mix with water and can burn the mouth and gut. Use the dried herb.' });
    } else if (blend.form === 'powder') {
      if (s.skin === 'never' || s.skin === 'low') add({ level: 'care', part: name, title: `${name} powder on skin`, text: `Keep this powder off your skin and out of the eyes; wear gloves to grind it.${note}` });
      if (s.burn === 'never') add({ level: 'stop', part: name, title: `${name} is poisonous`, text: `Not for a powder you’ll handle or scatter.${note}` });
    }
    if (part.as === 'oil' && blend.form === 'incense') add({ level: 'care', part: name, title: 'Oils on hot charcoal', text: 'A drop or two of oil in loose incense is plenty; more spits and flares on charcoal. Let it soak into the herbs first.' });
  }
  if (pregnant.length) add({ level: 'care', title: 'Pregnancy', text: `${listing(pregnant)} ${pregnant.length === 1 ? 'is' : 'are'} commonly advised against in pregnancy${blend.form === 'tea' ? ' and breastfeeding' : ''}. If you are pregnant or may be, leave ${pregnant.length === 1 ? 'it' : 'them'} out or ask your midwife first.` });
  if (cats.length || dogs.length) {
    const both = cats.filter((c) => dogs.includes(c));
    const words = [both.length ? `${listing(both)} (cats and dogs)` : '', cats.filter((c) => !both.includes(c)).length ? `${listing(cats.filter((c) => !both.includes(c)))} (cats)` : '', dogs.filter((c) => !both.includes(c)).length ? `${listing(dogs.filter((c) => !both.includes(c)))} (dogs)` : ''].filter(Boolean);
    add({ level: 'care', title: 'Pets', text: `On pet-safety lists as harmful: ${words.join('; ')}. Keep the blend shut away, ${blend.form === 'incense' ? 'burn it where they can’t go, ' : blend.form === 'oil' ? 'never diffuse it near cats (their livers can’t clear these oils), ' : blend.form === 'powder' ? 'don’t scatter it where paws will walk through and be licked, ' : ''}and call a vet if one eats some.` });
  }
  if (blend.form === 'incense') {
    add({ level: 'info', title: 'Smoke in the house', text: 'Burn incense with a window open, never near sleeping babies, and not at all where birds are kept: their lungs are badly hurt by smoke. Asthma is a reason to choose an oil or simmer pot instead.' });
    if (blend.parts.length && !blend.parts.some(isResin)) add({ level: 'info', title: 'A resin holds it together', text: 'Herbs alone smoulder and smell of bonfire. A resin base (frankincense, copal, benzoin) burns sweeter: about two parts resin to one of herbs is a common start.' });
  }
  if (blend.form === 'oil') add({ level: 'info', title: 'Before you wear it', text: 'Patch test: a dab inside the elbow, covered, for a day. Keep oils from eyes and children, and store in dark glass.' });
  if (blend.form === 'tea') add({ level: 'info', title: 'Before you drink it', text: 'Only drink what you can name for certain and bought as food, or grew and know. One cup to start; ask a pharmacist if you take regular medicine, as many herbs change how medicines work.' });
  if (blend.form === 'powder') add({ level: 'info', title: 'Grinding', text: 'Grind with a mortar or a grinder kept for craft, not food, and don’t breathe the dust.' });
  const order: Record<Level, number> = { stop: 0, care: 1, info: 2 };
  return out.sort((a, b) => order[a.level] - order[b.level]);
}

// ─── Dilution ─────────────────────────────────────────────────────────────

export type DropPlan = { name: string; drops: number; capped: boolean };
export type Dilution = { percent: number; carrierMl: number; totalDrops: number; parts: DropPlan[]; line: string };

/**
 * How many drops of each essential oil for the carrier and strength chosen,
 * shared by parts. Oils that aren't for skin are left out; those to keep very
 * low are held to 0.5% of the carrier. Whole drops, at least one of each.
 */
export function dilution(blend: Pick<Blend, 'form' | 'parts' | 'carrierMl' | 'strength'>): Dilution | null {
  if (blend.form !== 'oil') return null;
  const oils = blend.parts.filter((p) => p.as === 'oil');
  const ml = Math.max(1, Math.min(250, Number(blend.carrierMl) || 10));
  const percent = STRENGTHS.some((s) => s.value === blend.strength) ? blend.strength : 2;
  if (!oils.length) return { percent, carrierMl: ml, totalDrops: 0, parts: [], line: `Infuse the herbs in ${ml} ml of carrier oil: cover them, keep the jar somewhere warm for two to four weeks, shaking it now and then, and strain.` };
  const usable = oils.filter((p) => plantSafety(p.name)?.skin !== 'never');
  const budget = Math.max(1, Math.floor((ml * DROPS_PER_ML * percent) / 100));
  const lowCap = Math.max(1, Math.floor((ml * DROPS_PER_ML * 0.5) / 100));
  const share = usable.reduce((n, p) => n + Math.max(1, p.parts || 1), 0) || 1;
  const parts: DropPlan[] = oils.map((p) => {
    const s = plantSafety(p.name)?.skin;
    if (s === 'never') return { name: p.name, drops: 0, capped: true };
    const want = Math.max(1, Math.round((budget * Math.max(1, p.parts || 1)) / share));
    const cap = s === 'low' ? lowCap : budget;
    return { name: p.name, drops: Math.min(want, cap), capped: want > cap };
  });
  const totalDrops = parts.reduce((n, p) => n + p.drops, 0);
  const over = totalDrops > budget;
  const line = `${percent}% in ${ml} ml of carrier is about ${budget} drop${budget === 1 ? '' : 's'} of essential oil in all${over ? `; with one of each oil it comes to ${totalDrops}, so take one oil out or use more carrier` : ''}.`;
  return { percent, carrierMl: ml, totalDrops, parts, line };
}

// ─── What the parts say together ──────────────────────────────────────────

/** Uses that pull against each other in one blend. */
const PULLS: { a: RegExp; b: RegExp; why: string }[] = [
  { a: /\b(love|attract|attraction|prosperity|money|abundance|luck|success|fertility|drawing|wealth|growth)\b/, b: /\b(banish|banishing|exorcism|uncrossing|hex[- ]?breaking|severing|release|endings?|repel|repelling)\b/, why: 'drawing in and sending away' },
  { a: /\b(sleep|calm|peace|rest|tranquil|tranquillity|relaxation|soothing|dreams?)\b/, b: /\b(courage|energy|passion|lust|strength|vitality|stimulat\w*|motivation|power)\b/, why: 'settling down and stirring up' },
  { a: /\b(binding|silence|silencing)\b/, b: /\b(communication|eloquence|opening|road opening|travel)\b/, why: 'binding and opening' },
];

const OPPOSITE: Record<Element, Element> = { Fire: 'Water', Water: 'Fire', Air: 'Earth', Earth: 'Air' };

export type Reading = {
  /** Uses two or more parts share, most shared first. */
  shared: { use: string; names: string[] }[];
  /** Where parts pull against each other. */
  pulls: { why: string; a: string[]; b: string[] }[];
  elements: { key: Element; count: number }[];
  planets: { key: Planet; count: number }[];
  /** One line on the elements: what leads, what's missing, what's opposed. */
  balance: string;
  /** The day of the planet it leans to, to make or use it. */
  day: string | null;
  /** How well it fits the intent: the parts whose uses mention it. */
  forIntent: string[];
};

export function readBlend(blend: Pick<Blend, 'parts' | 'intent'>, entries?: LibraryEntry[] | null): Reading {
  const read = blend.parts.map((p) => {
    const entry = entryByName(p.name, entries, 'herb') ?? entryByName(p.name, entries);
    return { name: p.name, c: correspondenceOf(entry, p.name) };
  });
  const byUse = new Map<string, string[]>();
  for (const { name, c } of read) for (const use of c.uses) byUse.set(use, [...(byUse.get(use) ?? []), name]);
  const shared = [...byUse.entries()]
    .filter(([, names]) => names.length > 1)
    .map(([use, names]) => ({ use, names }))
    .sort((x, y) => y.names.length - x.names.length || x.use.localeCompare(y.use))
    .slice(0, 8);
  const pulls: Reading['pulls'] = [];
  for (const pull of PULLS) {
    const a = read.filter(({ c }) => c.uses.some((u) => pull.a.test(u))).map((r) => r.name);
    const b = read.filter(({ c }) => c.uses.some((u) => pull.b.test(u))).map((r) => r.name);
    const onlyA = a.filter((n) => !b.includes(n));
    const onlyB = b.filter((n) => !a.includes(n));
    if (onlyA.length && onlyB.length) pulls.push({ why: pull.why, a: onlyA, b: onlyB });
  }
  const elements = tally(read.map((r) => (r.c.element && r.c.element !== 'Spirit' ? (r.c.element as Element) : null)));
  const planets = tally(read.map((r) => r.c.planet));
  const intent = blend.intent.trim().toLowerCase();
  const stem = intent.replace(/(ing|s)$/, '');
  const forIntent = intent ? read.filter(({ c }) => c.uses.some((u) => u.includes(stem) || stem.includes(u))).map((r) => r.name) : [];
  return { shared, pulls, elements, planets, balance: balanceLine(elements), day: planets[0] ? `${WEEKDAY_NAMES[PLANET_DAY[planets[0].key]]}, ${planetPossessive(planets[0].key)} day` : null, forIntent };
}

function balanceLine(elements: { key: Element; count: number }[]): string {
  if (!elements.length) return 'No elements read yet: the Library holds them for its herbs.';
  const lead = elements[0];
  const tie = elements.filter((e) => e.count === lead.count).map((e) => e.key);
  const missing = ELEMENTS.filter((e) => !elements.some((x) => x.key === e));
  const opposed = elements.filter((e) => e.key < OPPOSITE[e.key] && elements.some((x) => x.key === OPPOSITE[e.key]));
  const parts = [tie.length > 1 ? `Even between ${listing(tie)}` : `Leans to ${lead.key}`];
  if (missing.length && missing.length < 4) parts.push(`no ${listing(missing, 'or')}`);
  if (opposed.length) parts.push(`${listing(opposed.map((e) => `${e.key} and ${OPPOSITE[e.key]}`))} sit opposite each other, which some read as balance and others as a blend at odds with itself`);
  return `${parts.join('; ')}.`;
}

function listing(items: string[], joiner = 'and'): string {
  if (items.length < 2) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} ${joiner} ${items[items.length - 1]}`;
}

// ─── Building and keeping ─────────────────────────────────────────────────

export function addPart(blend: Blend, part: BlendPart): Blend {
  const name = part.name.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  if (!name || blend.parts.length >= PARTS_MAX) return blend;
  if (blend.parts.some((p) => p.name.toLowerCase() === name.toLowerCase() && p.as === part.as)) return blend;
  return { ...blend, parts: [...blend.parts, { ...part, name, parts: Math.max(1, Math.min(20, Math.round(part.parts) || 1)) }] };
}

export const removePart = (blend: Blend, index: number): Blend => ({ ...blend, parts: blend.parts.filter((_, i) => i !== index) });

export function setParts(blend: Blend, index: number, parts: number): Blend {
  return { ...blend, parts: blend.parts.map((p, i) => (i === index ? { ...p, parts: Math.max(1, Math.min(20, Math.round(parts) || 1)) } : p)) };
}

/** What a part is by default for a form: resins as resin, oils for an oil blend, herbs otherwise. */
export function defaultAs(name: string, form: BlendForm): PartAs {
  if (RESIN_WORDS.test(name.toLowerCase().replace(/[’']/g, ''))) return form === 'oil' ? 'oil' : 'resin';
  if (/\boil\b/i.test(name)) return 'oil';
  return form === 'oil' ? 'oil' : 'herb';
}

export function blendProblem(blend: Pick<Blend, 'parts' | 'form'>): string | null {
  if (!blend.parts.length) return 'Add at least one herb, resin or oil.';
  if (blendSafety(blend).some((n) => n.level === 'stop')) return 'Take out what’s marked “stop” before keeping this blend.';
  return null;
}

export function blendName(blend: Pick<Blend, 'name' | 'form' | 'intent'>): string {
  const own = blend.name.trim();
  if (own) return own.slice(0, NAME_MAX);
  const form = FORMS.find((f) => f.key === blend.form)?.label ?? 'Blend';
  return blend.intent.trim() ? `${blend.intent.trim()} ${form.toLowerCase()}` : form;
}

export function normaliseBlend(raw: unknown): Blend {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Partial<Blend>;
  const form = FORMS.some((f) => f.key === b.form) ? (b.form as BlendForm) : 'incense';
  const parts = Array.isArray(b.parts)
    ? b.parts
        .filter((p) => p && typeof p.name === 'string' && p.name.trim())
        .slice(0, PARTS_MAX)
        .map((p) => ({ name: String(p.name).slice(0, NAME_MAX), as: (['herb', 'resin', 'oil'] as const).includes(p.as as PartAs) ? (p.as as PartAs) : 'herb', parts: Math.max(1, Math.min(20, Number(p.parts) || 1)), ...(p.entryId ? { entryId: String(p.entryId) } : {}), ...(p.shelfId ? { shelfId: String(p.shelfId) } : {}) }))
    : [];
  return {
    name: String(b.name ?? '').slice(0, NAME_MAX),
    form,
    intent: String(b.intent ?? '').slice(0, 80),
    parts,
    carrier: String(b.carrier ?? 'Jojoba').slice(0, 40) || 'Jojoba',
    carrierMl: Math.max(1, Math.min(250, Number(b.carrierMl) || 10)),
    strength: STRENGTHS.some((s) => s.value === b.strength) ? (b.strength as number) : 2,
    notes: String(b.notes ?? '').slice(0, 2000),
    madeAt: typeof b.madeAt === 'string' ? b.madeAt : '',
  };
}

export const blendRef = (id: string) => `kitchen-blend:${id}`;
export const BLEND_SECTION = 'Blends';

const html = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The method for each form, step by step. */
export function blendMethod(blend: Pick<Blend, 'form' | 'carrier' | 'carrierMl'>): string[] {
  switch (blend.form) {
    case 'incense':
      return ['Grind the resins coarse and the herbs fine, each on its own.', 'Mix them by parts in a bowl, stirring sunwise as you speak the intent.', 'Let it rest a day or more in a lidded jar so the scents marry.', 'Burn a pinch at a time on a lit charcoal disc set on sand, with a window open.'];
    case 'oil':
      return [`Pour ${blend.carrierMl} ml of ${blend.carrier.toLowerCase()} oil into a clean dark-glass bottle.`, 'Add the essential oils drop by drop, counting aloud, or the dried herbs to infuse.', 'Cap it, roll it between your palms and say what it is for.', 'Label it with the date and what’s in it. Infusions rest two to four weeks before straining.'];
    case 'powder':
      return ['Dry everything well first: damp powder moulds.', 'Grind each part fine in a mortar kept for craft, then sift.', 'Mix by parts, stating the intent as you stir.', 'Keep it in a sealed, labelled jar, out of reach of children and pets.'];
    case 'tea':
      return ['Measure a heaped teaspoon of the dried mix per cup.', 'Pour on water just off the boil, cover, and steep five to ten minutes.', 'Strain well and drink it slowly, holding the intent.'];
  }
}

/** A blend as Grimoire blocks (the website's block shapes: text as HTML, lists one per line). */
export function blendBlocks(blend: Blend, entries?: LibraryEntry[] | null): { type: string; content: string }[] {
  const form = FORMS.find((f) => f.key === blend.form)?.label ?? 'Blend';
  const reading = readBlend(blend, entries);
  const drops = dilution(blend);
  const blocks: { type: string; content: string }[] = [{ type: 'callout', content: html([form, blend.intent.trim() ? `For ${blend.intent.trim().toLowerCase()}` : '', reading.day ? `Best made on ${reading.day}` : ''].filter(Boolean).join(' · ')) }];
  blocks.push({ type: 'heading', content: 'What goes in' });
  blocks.push({ type: 'bulleted_list', content: blend.parts.map((p) => html(`${p.parts} part${p.parts === 1 ? '' : 's'} ${p.name} (${AS_LABEL[p.as].toLowerCase()})${drops?.parts.find((d) => d.name === p.name) ? `: ${drops.parts.find((d) => d.name === p.name)!.drops} drops` : ''}`)).join('\n') });
  if (drops) blocks.push({ type: 'text', content: html(drops.line) });
  blocks.push({ type: 'heading', content: 'Method' });
  blocks.push({ type: 'numbered_list', content: blendMethod(blend).map(html).join('\n') });
  const together = [reading.balance, reading.shared.length ? `Shared: ${reading.shared.map((s) => `${s.use} (${s.names.join(', ')})`).join('; ')}.` : '', ...reading.pulls.map((p) => `Pulling between ${p.why}: ${p.a.join(', ')} against ${p.b.join(', ')}.`)].filter(Boolean);
  blocks.push({ type: 'heading', content: 'Correspondences' });
  blocks.push({ type: 'text', content: html(together.join(' ')) });
  const safety = blendSafety(blend).filter((n) => n.level !== 'info');
  if (safety.length) {
    blocks.push({ type: 'heading', content: 'Safety' });
    blocks.push({ type: 'bulleted_list', content: safety.map((n) => html(`${n.title}. ${n.text}`)).join('\n') });
  }
  if (blend.notes.trim()) blocks.push({ type: 'heading', content: 'Notes' }, { type: 'text', content: html(blend.notes.trim()) });
  return blocks;
}

export function findBlendPage<P extends { id: string; metadata: Record<string, unknown> | null }>(pages: P[], id: string): P | null {
  return pages.find((p) => (p.metadata as { holyRef?: string } | null)?.holyRef === blendRef(id)) ?? null;
}
