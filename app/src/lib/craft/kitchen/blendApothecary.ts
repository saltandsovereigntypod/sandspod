// A blend kept in the Blending lab is also a thing in My Apothecary, so it can
// be placed on an altar, labelled and tended like anything else made there:
// incense stays incense, an oil is an oil, a powder or tea a herb mix. The
// item names its blend (metadata.blendId), so keeping the blend again changes
// the same item, and the apothecary editor can open it back in the lab. Its
// safety notes go with it. Bath mixes are kept apart (Bath & body), linked
// both ways. Pure.

import { apothecaryType, DEFAULT_LIVING, type ApothecaryItem, type ApothecaryTypeId } from '../../altar/apothecary.ts';
import { blendName, blendSafety, type Blend, type BlendForm } from './blend.ts';

export const BLEND_TO_APOTHECARY: Record<BlendForm, ApothecaryTypeId> = { incense: 'incense', oil: 'oil-tincture', powder: 'herb-mix', tea: 'herb-mix' };

/** The types the Blending lab can check. */
export const LAB_TYPES: ApothecaryTypeId[] = ['incense', 'oil-tincture', 'herb-mix'];

export const blendIdOf = (item: Pick<ApothecaryItem, 'metadata'>) => (typeof item.metadata?.blendId === 'string' ? item.metadata.blendId : '');

/** The blend as a My Apothecary item: new, or the one already made from it (its id, picture and everything else kept). */
export function apothecaryFromBlend(blend: Blend, blendId: string, now: string, existing?: ApothecaryItem | null): ApothecaryItem {
  const type = apothecaryType(BLEND_TO_APOTHECARY[blend.form] ?? 'herb-mix');
  const safety = blendSafety(blend).map((n) => `${n.part ? `${n.part}: ` : ''}${n.title}. ${n.text}`);
  const carrier = blend.form === 'oil' && blend.carrier ? [`In ${blend.carrierMl} ml ${blend.carrier.toLowerCase()} at ${blend.strength}%.`] : [];
  const notes = [blend.notes.trim(), ...carrier, ...(safety.length ? ['Safety (from the Blending lab):', ...safety] : [])].filter(Boolean).join('\n');
  const ingredients = blend.parts.map((p) => ({ label: p.name, type: p.as === 'oil' ? 'oil' : 'herb', amount: `${p.parts} part${p.parts === 1 ? '' : 's'}`, ...(p.entryId ? { entityId: p.entryId } : {}) }));
  const base: ApothecaryItem = existing ?? {
    id: '',
    name: '',
    type: type.id,
    typeLabel: type.label,
    imagePath: type.image,
    intention: '',
    notes: '',
    details: {},
    ingredients: [],
    livingState: { ...DEFAULT_LIVING },
    logToGrimoire: false,
    grimoireStatus: '',
    grimoireEntryId: '',
    entityId: '',
    instanceId: '',
    createdAt: now,
    updatedAt: now,
  };
  return {
    ...base,
    name: blendName(blend),
    type: type.id,
    typeLabel: type.label,
    intention: blend.intent.trim() || base.intention,
    notes,
    ingredients,
    updatedAt: now,
    metadata: { ...(base.metadata ?? {}), blendId, blendForm: blend.form },
  };
}

/** The item already made from this blend, if any. */
export const itemForBlend = (items: ApothecaryItem[], blendId: string) => items.find((i) => blendIdOf(i) === blendId) ?? null;
