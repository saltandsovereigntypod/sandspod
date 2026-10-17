// "Tonight's altar", explained: why each piece is there, and what could
// stand in for it with the same correspondence, your own things first.

import { useState } from 'react';
import { Text, View } from 'react-native';

import { explainTonight, swapsFor } from '../../../lib/altar/reading/tonightExplained';
import type { TonightAltar } from '../../../lib/altar/tonight';
import type { SavedObject } from '../../../lib/altar/types';
import { useWorkshop } from '../../../lib/altar/workshop';
import { useLibrary } from '../../../lib/library';
import { type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { nowIso, sheetStyles } from './common';

type Props = {
  visible: boolean;
  /** tonightAltar()'s result, as placed (its doc.objects are the altar's objects, same order). */
  tonight: TonightAltar | null;
  /** The date it was set for. */
  date: Date;
  onClose: () => void;
  /** Swap the piece at `index` for `object` (already standing on the same spot). */
  onSwap: (index: number, object: SavedObject) => void;
};

export function TonightExplainedSheet({ visible, tonight, date, onClose, onSwap }: Props) {
  const { entries } = useLibrary();
  const { customItems } = useWorkshop();
  const [open, setOpen] = useState<number | null>(null);
  const pieces = visible && tonight ? explainTonight(tonight, date, entries) : [];

  return (
    <Sheet visible={visible && !!tonight} eyebrow="Tonight’s altar" title={tonight ? tonight.reason.charAt(0).toUpperCase() + tonight.reason.slice(1) : ''} onClose={onClose}>
      {pieces.map((piece) => {
        const object = tonight!.doc.objects[piece.index];
        const swaps = open === piece.index ? swapsFor(object, { entries, cabinet: customItems, others: tonight!.doc.objects, now: nowIso() }) : [];
        return (
          <View key={piece.index} style={sheetStyles.card}>
            <Text style={type.body}>{piece.why}</Text>
            <ChipRow>
              <Chip label={open === piece.index ? 'Hide swaps' : 'Swap'} symbol="⇄" accessibilityLabel={`Swaps for ${piece.label}`} onPress={() => setOpen(open === piece.index ? null : piece.index)} />
            </ChipRow>
            {open === piece.index &&
              (swaps.length ? (
                <View style={sheetStyles.section}>
                  {swaps.map((s) => (
                    <View key={s.itemId} style={sheetStyles.section}>
                      <Text style={type.caption}>{s.why}</Text>
                      <ChipRow>
                        <Chip
                          label={`Use ${s.label}`}
                          symbol={s.owned ? '★' : undefined}
                          onPress={() => {
                            onSwap(piece.index, s.object);
                            setOpen(null);
                          }}
                        />
                      </ChipRow>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={type.caption}>Nothing in the cabinet shares its correspondence closely enough.</Text>
              ))}
          </View>
        );
      })}
    </Sheet>
  );
}
