// Bath safety, worked out from what is in the mix. A table of ingredients
// that need a word (skin irritants, phototoxic citrus oils, plants not to be
// used in pregnancy, poisonous plants) is matched against every ingredient's
// name, so any mix (premade or your own) shows the warnings that apply with
// nothing to remember. Stones are checked against Stone care. Pure.
//
// The notes are cautions as commonly given by aromatherapy and herbal
// safety guides, not medical advice; anyone pregnant, unwell or on
// medication is pointed to a midwife, doctor or pharmacist.

import { findCare } from '../crystal/care.ts';

export type BathKind = 'salt' | 'herb' | 'flower' | 'oil' | 'carrier' | 'crystal' | 'other';

export type BathIngredient = {
  name: string;
  amount: string;
  kind: BathKind;
  /** The Living Library page, "traditional/herb/lavender". */
  ref?: string;
  optional?: boolean;
};

export type SafetyLevel = 'avoid' | 'care';
export type SafetyGroup = 'skin' | 'pregnancy' | 'poison' | 'oil' | 'allergy' | 'sun' | 'stone';

export type SafetyNote = { level: SafetyLevel; group: SafetyGroup; title: string; text: string; ingredient?: string };

type Rule = { id: string; level: SafetyLevel; group: SafetyGroup; match: RegExp; oilOnly?: boolean; title: string; text: string };

const PREGNANCY = 'Traditionally advised against in pregnancy. If you are pregnant or may be, leave it out or ask your midwife or doctor first.';

export const SAFETY_RULES: Rule[] = [
  { id: 'cinnamon', level: 'care', group: 'skin', match: /\b(cinnamon|cassia)\b/, title: 'Cinnamon can burn skin', text: 'Cinnamon is a known skin irritant, and the oil is far stronger than the bark. Infuse the bark in a tea and strain it well; never use the oil, and leave it out for sensitive skin or children.' },
  { id: 'clove', level: 'care', group: 'skin', match: /\bcloves?\b/, title: 'Clove can irritate skin', text: 'Clove is a skin irritant. Use whole cloves in a strained infusion only, never the oil, and keep it away from children.' },
  { id: 'chilli', level: 'care', group: 'skin', match: /\b(cayenne|chil+i|chili|capsicum|paprika)\b/, title: 'Chilli burns skin and eyes', text: 'Cayenne and chilli sting skin and burn eyes and anywhere tender. Put a pinch in the infusion jar if you must, strain it very well, and wash your hands before you touch your face.' },
  { id: 'pepper', level: 'care', group: 'skin', match: /\bblack pepper\b/, title: 'Black pepper can irritate', text: 'Pepper can sting skin and eyes. Keep it to a pinch in a strained infusion, and rinse well.' },
  { id: 'wintergreen', level: 'care', group: 'skin', match: /\b(wintergreen|methyl salicylate)\b/, title: 'Wintergreen is a strong irritant', text: 'Wintergreen oil is almost pure methyl salicylate: very irritating to skin, harmful to children, and unsafe with blood-thinning medicines. Best left out of the bath.' },
  { id: 'oregano-thyme', level: 'care', group: 'skin', match: /\b(oregano|thyme)\b/, oilOnly: true, title: 'Oregano and thyme oils irritate skin', text: 'These oils are rich in phenols, which burn skin even well diluted. Use the dried herb in a sachet instead.' },
  { id: 'mint-oil', level: 'care', group: 'skin', match: /\b(peppermint|spearmint|mint|eucalyptus)\b/, oilOnly: true, title: 'Mint and eucalyptus oils are strong', text: 'They can sting skin and are not for young children or near the face; eucalyptus oil is also harmful to cats and dogs. The dried leaf in a sachet is gentler.' },
  { id: 'citrus-oil', level: 'care', group: 'sun', match: /\b(lemon|lime|bergamot|grapefruit|orange|mandarin|tangerine)\b/, oilOnly: true, title: 'Citrus oils react to sunlight', text: 'Cold-pressed citrus oils (bergamot especially) can make skin burn or blotch in sunlight or under sunbeds for up to a day. Keep out of the sun afterwards, choose a steam-distilled kind, or use dried peel in a sachet.' },
  { id: 'st-johns-wort', level: 'care', group: 'sun', match: /\bst\.? john'?s wort\b/, title: 'St John’s wort and sunlight', text: 'It can make skin more sensitive to sun. Keep out of strong sun afterwards, and leave it out if you take any regular medicine.' },
  { id: 'rue', level: 'care', group: 'skin', match: /\brue\b/, title: 'Rue can blister skin', text: 'The fresh sap of rue can cause burns and blisters in sunlight. Handle it in gloves, or leave it out.' },
  { id: 'preg-herbs', level: 'care', group: 'pregnancy', match: /\b(mugwort|rue|wormwood|juniper|hyssop|angelica|yarrow|tansy|southernwood)\b/, title: 'Not for pregnancy', text: PREGNANCY },
  { id: 'preg-oils', level: 'care', group: 'pregnancy', match: /\b(sage|rosemary|clary sage|thyme|cinnamon|cypress|fennel|basil|clove)\b/, oilOnly: true, title: 'These oils and pregnancy', text: 'These essential oils are commonly advised against in pregnancy, and rosemary oil in quantity is a caution for anyone with high blood pressure or epilepsy. Leave them out, or ask your midwife first. The dried herb in a sachet is far milder.' },
  { id: 'pennyroyal', level: 'avoid', group: 'poison', match: /\bpennyroyal\b/, title: 'Never use pennyroyal', text: 'Pennyroyal is toxic (the oil has caused deaths) and can cause miscarriage. It does not belong in a bath at all.' },
  { id: 'poison', level: 'avoid', group: 'poison', match: /\b(belladonna|nightshade|foxglove|yew|hemlock|henbane|datura|aconite|monkshood|oleander|mandrake|lily of the valley|laburnum)\b/, title: 'A poisonous plant', text: 'This plant is poisonous and can pass through skin and steam. It does not belong in a bath; the Library names safe stand-ins.' },
  { id: 'daisy-family', level: 'care', group: 'allergy', match: /\b(chamomile|calendula|yarrow|mugwort|tansy|marigold)\b/, title: 'Daisy-family plants and allergy', text: 'If hayfever or ragweed allergy runs in you, these plants can bring on a rash or wheezing. Do the patch test first.' },
  { id: 'meadowsweet', level: 'care', group: 'allergy', match: /\bmeadowsweet\b/, title: 'Meadowsweet holds salicylates', text: 'It contains salicylates, related to aspirin: skip it if you are allergic to aspirin.' },
  { id: 'nuts', level: 'care', group: 'allergy', match: /\b(almond|sesame|walnut|peanut)\b/, title: 'Nut and seed oils', text: 'Nut and seed carrier oils can set off allergies. Choose one you know you tolerate, such as jojoba.' },
  { id: 'milk', level: 'care', group: 'allergy', match: /\b(milk|cream|yoghurt|yogurt)\b/, title: 'Milk and dairy allergy', text: 'Leave milk out if anyone bathing is allergic to dairy; oat milk or powdered oats serve instead.' },
];

/** An essential oil, by kind or by name. */
export const isEssentialOil = (i: Pick<BathIngredient, 'name' | 'kind'>) => i.kind === 'oil' || /\b(essential oil|absolute)\b/.test(i.name.toLowerCase());
const isOilName = (i: Pick<BathIngredient, 'name' | 'kind'>) => isEssentialOil(i) || /\boil\b/.test(i.name.toLowerCase());

/** What a stone can bear, from Stone care. 'unknown' for a stone not in the table. */
export type StoneWater = { status: 'safe' | 'brief' | 'out' | 'unknown'; label: string; text: string };

export function stoneWater(name: string, key?: string): StoneWater {
  const c = findCare(key ?? null, name);
  if (!c) return { status: 'unknown', label: 'Check first', text: `Not sure of ${name}: keep it beside the bath, out of the water, until you know.` };
  if (c.handling === 'toxic') return { status: 'out', label: 'Keep out of the water', text: `${c.name} is toxic or gives off harmful dust: keep it beside the bath, never in the water.` };
  if (c.water === 'no') return { status: 'out', label: 'Keep out of the water', text: `${c.name} can dissolve, cloud, rust or crumble in water: keep it beside the bath, never in it.` };
  if (c.water === 'brief') return { status: 'brief', label: 'Beside the bath', text: `${c.name} takes only a quick rinse: keep it beside the bath, out of long soaks and salt.` };
  return { status: 'safe', label: 'Water-safe', text: `${c.name} is safe in water${c.salt === 'yes' ? '' : ', but not in salt'}.` };
}

/** The cautions that apply to these ingredients, most serious first. */
export function bathSafety(ingredients: readonly BathIngredient[]): SafetyNote[] {
  const out: SafetyNote[] = [];
  const seen = new Set<string>();
  const add = (n: SafetyNote) => {
    const k = `${n.title}|${n.ingredient ?? ''}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push(n);
  };
  for (const i of ingredients) {
    const name = i.name.toLowerCase();
    for (const r of SAFETY_RULES) {
      if (r.oilOnly && !isOilName(i)) continue;
      if (r.match.test(name)) add({ level: r.level, group: r.group, title: r.title, text: r.text, ingredient: i.name });
    }
    if (isEssentialOil(i)) {
      add({ level: 'care', group: 'oil', title: 'Dilute essential oils first', text: 'Essential oil floats on the water and sits undiluted on your skin. Mix it first into a spoonful of carrier oil, a little milk or the bath salts (a few drops to a tablespoon), then stir that in. Keep the total to a few drops, and keep oils away from children, cats and dogs.', ingredient: i.name });
    }
    if (i.kind === 'crystal') {
      const w = stoneWater(i.name, i.ref?.split('/').pop());
      if (w.status !== 'safe') add({ level: 'care', group: 'stone', title: w.label, text: w.text, ingredient: i.name });
    }
  }
  return out.sort((a, b) => Number(b.level === 'avoid') - Number(a.level === 'avoid'));
}

export type Always = { id: string; text: string };

/** Notes every bath carries; the rest depend on what is in it. */
export function alwaysNotes(ingredients: readonly BathIngredient[], method: string): Always[] {
  const notes: Always[] = [
    { id: 'patch', text: 'Patch test anything new: a little of the strained water on the inside of your arm for a day first, and stop if skin reddens or itches.' },
    { id: 'slip', text: 'Tubs get slippery, more so with oil, milk or salts. Use a mat, stand up slowly, and keep candles on a stable surface, well away from towels and curtains, never left alone.' },
    { id: 'hot', text: 'Keep the water comfortably warm, not hot. If you are pregnant, unwell, faint easily or take regular medicine, check a long warm bath suits you.' },
    { id: 'family', text: 'Children are never left alone in a bath, and pets stay out of the room: many herbs and oils harm them if they drink or lick the water.' },
  ];
  if (method === 'loose') notes.push({ id: 'drain', text: 'Loose herbs will clog the plug-hole: lay a strainer or fine mesh over it, and lift the herbs out with a sieve before the water goes.' });
  if (ingredients.some((i) => i.kind === 'crystal')) notes.push({ id: 'stones', text: 'Stones beside the bath go on a dry, steady shelf, not the rim: they can slip into the water or down the plug-hole.' });
  return notes;
}
