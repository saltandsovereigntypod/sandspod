/**
 * Keywords for cabinet items whose artwork data carries fewer than four (or
 * runs words together). Most important first. Applied by cabinet.ts.
 */
const candle = (colour: string, ...rest: string[]) => [colour, ...rest];

export const KEYWORD_OVERRIDES: Record<string, string[]> = {
  'candles:white-candle': candle('white', 'purity', 'peace', 'cleansing', 'all-purpose'),
  'candles:black-candle': candle('black', 'banishing', 'protection', 'binding', 'absorbing negativity'),
  'candles:green-candle': candle('green', 'prosperity', 'growth', 'abundance', 'healing'),
  'candles:purple-candle': candle('purple', 'spiritual power', 'intuition', 'psychic work', 'wisdom'),
  'candles:red-candle': candle('red', 'passion', 'courage', 'strength', 'vitality'),
  'candles:orange-candle': candle('orange', 'creativity', 'confidence', 'attraction', 'success'),
  'candles:yellow-candle': candle('yellow', 'clarity', 'communication', 'study', 'joy'),
  'candles:blue-candle': candle('blue', 'calm', 'truth', 'healing', 'peaceful sleep'),
  'candles:brown-candle': candle('brown', 'grounding', 'home', 'stability', 'animals'),
  'candles:pink-candle': candle('pink', 'love', 'friendship', 'self-love', 'gentleness'),
  'candles:gold-candle': candle('gold', 'abundance', 'solar power', 'success', 'confidence'),
  'candles:silver-candle': candle('silver', 'moon', 'intuition', 'dreams', 'reflection'),
  'candles:grey-candle': candle('grey', 'neutrality', 'stillness', 'hidden things', 'peace'),
  'candles:indigo-candle': candle('indigo', 'insight', 'meditation', 'inner sight', 'balance'),
  'candles:rainbow-candle': candle('rainbow', 'joy', 'celebration', 'wholeness', 'hope'),
  'candles:magenta-candle': candle('magenta', 'swift change', 'ambition', 'spiritual drive', 'transformation'),
  'herbs:foxglove': ['fairy lore', 'garden protection', 'boundaries', 'toxic, never ingest'],
  'tools:key': ['thresholds', 'unlocking', 'Hekate', 'opportunity', 'secrets'],
  'tools:athame': ['cutting', 'will', 'boundary', 'directing energy', 'ritual circle'],
  'tools:raven-skull': ['death', 'messages', 'mystery', 'ancestors', 'transformation'],
  'tools:black-salt': ['protection', 'banishing', 'warding', 'boundary', 'cleansing'],
  'tools:graveyard-dirt': ['ancestors', 'protection', 'binding', 'the dead', 'rootwork'],
  'tools:salt-circle': ['protection', 'banishing', 'warding', 'boundary', 'cleansing'],
  'deities:hekate-statue': ['crossroads', 'torches', 'keys', 'witchcraft', 'thresholds'],
  'deities:lilith-statue': ['independence', 'night', 'sovereignty', 'shadow work', 'defiance'],
  'deities:eros-statue': ['love and desire', 'attraction', 'creative longing', 'passion'],
  'deities:lares-and-penates-statue': ['ancestors', 'safe homecoming', 'household', 'hearth', 'protection'],
  'tools:bell': ['clearing', 'signalling', 'blessing', 'sound', 'ritual opening'],
  'tools:besom': ['sweeping', 'cleansing', 'protection', 'threshold', 'clearing space'],
  'tools:boline': ['harvesting herbs', 'cutting', 'carving', 'cords', 'practical magic'],
  'tools:book-of-shadows': ['record', 'spells', 'correspondences', 'personal practice', 'learning'],
  'tools:chalice': ['emotion', 'blessing', 'water', 'offering', 'receiving'],
  'tools:incense-burner': ['offering', 'atmosphere', 'spirit communication', 'cleansing', 'smoke'],
  'tools:mortar-and-pestle': ['grinding', 'blending', 'herbs', 'incense making', 'intention'],
  'tools:oracle-deck': ['intuitive guidance', 'reflection', 'spiritual messages', 'divination'],
  'tools:pendulum': ['divination', 'yes-or-no questions', 'dowsing', 'intuition', 'sensing'],
  'tools:pentacle': ['protection', 'grounding', 'consecration', 'earth', 'five elements'],
  'vessels:cauldron': ['transformation', 'fire', 'spellwork', 'brewing', 'burning'],
  'vessels:spell-jar': ['container', 'spell', 'intention', 'sealing', 'long-term spells'],
  'vessels:dish': ['food offerings', 'deity devotion', 'crystals', 'holding', 'altar'],
  'vessels:incense-bowl': ['frankincense', 'myrrh', 'herbal incense', 'ash catching', 'cleansing'],
  'vessels:offering-bowl': ['daily devotion', 'ancestor work', 'deity offerings', 'gratitude'],
  'vessels:oil-bottle': ['anointing oils', 'essential oils', 'spell oils', 'candle dressing'],
  'vessels:spray-bottle': ['space cleansing', 'aura sprays', 'blessing rituals', 'moon water'],
  'vessels:vial': ['travel altars', 'jewellery', 'pocket charms', 'small spells'],
  'vessels:witch-bottle': ['home wards', 'protection rituals', 'threshold magic', 'warding off harm'],
};

/** "Protection · Love · Sleep · Dreams": the one small line on a cabinet tile. */
export function keywordLine(keywords: readonly string[] | undefined, max = 4): string {
  const title = (word: string) => word.trim().replace(/(^|[\s-])([a-z])/g, (_m, pre: string, ch: string) => pre + ch.toUpperCase());
  const seen = new Set<string>();
  const out: string[] = [];
  for (const word of keywords ?? []) {
    const t = title(word);
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
    if (out.length >= max) break;
  }
  return out.join(' · ');
}
