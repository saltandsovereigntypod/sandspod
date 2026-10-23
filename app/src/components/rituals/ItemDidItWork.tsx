// "Did it work?" for a spell jar, sachet, poppet, oil or anything else made in
// My Apothecary: the same card as a journal entry's (DidItWork), saved into
// the item's own metadata.lookBack (lib/altar/apothecaryLookBack.ts).

import { useMemo } from 'react';

import { DidItWork, LookBackPicker, type LookBackPick } from './DidItWork';
import { apothecaryWorking, itemFromWorking } from '../../lib/altar/apothecaryLookBack';
import type { ApothecaryItem } from '../../lib/altar/apothecary';
import { saveApothecaryMetadata, useWorkshop } from '../../lib/altar/workshop';

export function ItemDidItWork({ item, compact }: { item: ApothecaryItem; compact?: boolean }) {
  const { userId } = useWorkshop();
  const working = useMemo(() => apothecaryWorking(item), [item]);
  return <DidItWork key={item.id} entry={working} compact={compact} onSave={(next) => saveApothecaryMetadata(userId, itemFromWorking(item, next))} />;
}

/** "Did it work?" for something placed on the altar, by its My Apothecary item (nothing while that isn't loaded). */
export function PlacedDidItWork({ apothecaryItemId }: { apothecaryItemId: string | null | undefined }) {
  const { apothecary } = useWorkshop();
  const item = apothecaryItemId ? apothecary.find((a) => a.id === apothecaryItemId) : null;
  return item ? <ItemDidItWork item={item} /> : null;
}

/** Choose when to ask "Did it work?" as it's made, the day that suits its intention first. */
export function ItemLookBackPicker({
  item,
  value,
  custom,
  onChange,
}: {
  item: Pick<ApothecaryItem, 'id' | 'name' | 'intention' | 'createdAt'>;
  value: LookBackPick;
  custom: string;
  onChange: (value: LookBackPick, custom: string) => void;
}) {
  const working = apothecaryWorking({ ...item, ingredients: [] });
  return <LookBackPicker entry={working} value={value} custom={custom} onChange={onChange} />;
}
