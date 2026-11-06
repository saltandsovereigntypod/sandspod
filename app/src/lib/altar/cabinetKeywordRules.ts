// Rules for cabinet keywords (magical uses only); used by tests/cabinet-keywords.test.ts.
export const COLOURS = ['red', 'white', 'black', 'green', 'purple', 'orange', 'yellow', 'blue', 'brown', 'pink', 'gold', 'silver', 'grey', 'gray', 'indigo', 'rainbow', 'magenta', 'violet', 'clear', 'golden', 'turquoise'];
export const BANNED = ['candle', 'herb', 'crystal', 'tool', 'magic', 'energy', 'fire', 'water', 'earth', 'air', 'element', 'sprig', 'tumbled', 'oil', 'planet', 'sun', 'moon', 'mars', 'venus', 'jupiter', 'saturn', 'mercury', 'stone', 'altar', 'statue', 'vessel', 'bottle', 'object', 'item', 'lore', 'history', 'folklore', 'symbolism', 'toxic', 'ingest', 'general', 'all-purpose'];

const GROUPS: string[][] = [
  ['protect', 'ward', 'shield', 'defen', 'guard', 'safeguard', 'boundar', 'security'],
  ['love', 'romanc', 'attract', 'passion', 'desire', 'affection'],
  ['money', 'wealth', 'prosper', 'abundan', 'riches', 'fortune', 'financ'],
  ['cleans', 'purif', 'clearing', 'clear', 'purity', 'sweeping'],
  ['banish', 'expel', 'exorcis', 'repel', 'removing', 'release'],
  ['heal', 'health', 'wellbeing', 'recover', 'restor'],
  ['peace', 'calm', 'tranquil', 'serenity', 'relax', 'stillness'],
  ['divin', 'oracle', 'scrying', 'fortune telling', 'prophe', 'foresight', 'seership'],
  ['dream', 'sleep', 'rest'],
  ['intuit', 'psychic', 'inner sight', 'clairvoy', 'insight'],
  ['courage', 'bravery', 'strength', 'confidence', 'fortitude'],
  ['luck', 'fortunate', 'good fortune'],
  ['ancest', 'the dead', 'death', 'mourn', 'grief', 'remembrance'],
  ['ground', 'stabilit', 'centring', 'centering'],
  ['bless', 'consecrat', 'hallow', 'sanctif'],
  ['wisdom', 'knowledge', 'learning', 'study'],
  ['joy', 'happiness', 'cheer', 'delight'],
  ['transform', 'change', 'renewal', 'new beginnings', 'rebirth'],
  ['creativ', 'inspir', 'imagination'],
  ['communicat', 'eloquence', 'speech', 'speaking'],
  ['success', 'victory', 'triumph', 'achievement'],
  ['fertil', 'growth', 'fecund'],
  ['spirit work', 'spirit communication', 'spirit messages', 'spirit contact'],
  ['offering', 'devotion', 'gratitude'],
  ['binding', 'bind'],
];

const groupOf = (kw: string): number[] => {
  const k = kw.toLowerCase();
  const hit: number[] = [];
  GROUPS.forEach((g, i) => {
    if (g.some((stem) => k.includes(stem))) hit.push(i);
  });
  return hit;
};

const words = (s: string) => s.toLowerCase().split(/[^a-z']+/).filter(Boolean);


export function keywordProblems(id: string, itemName: string, kws: readonly string[]): string[] {
  const problems: string[] = [];
  const name = itemName.toLowerCase();
  const nameWords = words(itemName).filter((w) => w.length > 3 && !['statue', 'candle', 'with', 'and', 'the'].includes(w));
  if (kws.length < 4) problems.push(`${id}: only ${kws.length} keywords`);
  const seen = new Map<number, string>();
  for (const kw of kws) {
    const k = kw.toLowerCase();
    const w = words(k);
    if (!k.trim()) problems.push(`${id}: empty keyword`);
    if (k === name || k.includes(name) || name.includes(k)) problems.push(`${id}: "${kw}" is the item name`);
    if (nameWords.some((n) => w.includes(n) || w.includes(n.replace(/s$/, '')))) problems.push(`${id}: "${kw}" uses a word of the name`);
    if (w.some((x) => COLOURS.includes(x))) problems.push(`${id}: "${kw}" is a colour`);
    if (w.some((x) => BANNED.includes(x)) || BANNED.includes(k)) problems.push(`${id}: "${kw}" is generic or a category word`);
    for (const g of groupOf(k)) {
      const prev = seen.get(g);
      if (prev && prev !== kw) problems.push(`${id}: "${prev}" and "${kw}" are near-synonyms`);
      else seen.set(g, kw);
    }
  }
  if (new Set(kws.map((x) => x.toLowerCase())).size !== kws.length) problems.push(`${id}: duplicate keyword`);
  return problems;
}
