// An altar item as a coven ritual step keeps it (coven_ritual_steps.items),
// and the candle a step lights. Kept apart from itemIndex.ts so the coven
// pages can use it without the whole cabinet. Pure, so it can be tested.

/** An item as a ritual step keeps it (coven_ritual_steps.items): enough to show its chip and set it on the altar. */
export type StepItem = { key: string; name: string; image: string; category: string; color?: string; form?: string };

/** The candle forms the coven tables take (coven_ritual_steps.altar_form). */
const STEP_FORMS: Record<string, string> = { vigil: 'vigil', taper: 'taper', pillar: 'pillar', 'tea-light': 'tea-light', 'chime-spell': 'chime', chime: 'chime', votive: 'votive' };

/** A step's saved items, cleaned (unknown shapes dropped, at most 24). */
export function cleanStepItems(list: unknown): StepItem[] {
  if (!Array.isArray(list)) return [];
  const out: StepItem[] = [];
  for (const raw of list) {
    const it = raw as Partial<StepItem> | null;
    if (!it || typeof it.key !== 'string' || typeof it.name !== 'string') continue;
    if (out.some((o) => o.key === it.key)) continue;
    const item: StepItem = { key: it.key.slice(0, 200), name: it.name.slice(0, 120), image: typeof it.image === 'string' ? it.image : '', category: typeof it.category === 'string' ? it.category : '' };
    if (typeof it.color === 'string') item.color = it.color;
    if (typeof it.form === 'string') item.form = it.form;
    out.push(item);
  }
  return out.slice(0, 24);
}

/** The candle a step lights: the first candle among its items, as the coven tables take it (white votive when none). */
export function stepCandle(items: StepItem[], fallback: { color?: string | null; form?: string | null } = {}): { color: string; form: string } {
  const candle = items.find((i) => i.category === 'candles' && i.color);
  if (candle) return { color: candle.color!, form: STEP_FORMS[candle.form ?? ''] ?? 'vigil' };
  return { color: fallback.color || 'white', form: STEP_FORMS[fallback.form ?? ''] ?? 'votive' };
}
