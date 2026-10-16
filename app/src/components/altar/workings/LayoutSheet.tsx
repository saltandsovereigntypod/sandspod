// Layouts with meaning: the four directions, a triangle, a pentacle, a
// crystal grid, God & Goddess. Pick one to see what goes where, then arrange
// the altar (the screen applies the moves). With an object selected, also a
// line on where tradition puts it.

import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../Button';
import { LAYOUTS, layoutPlan, placementWisdom, type LayoutKind, type LayoutPlan } from '../../../lib/altar/reading/layouts';
import type { SavedObject } from '../../../lib/altar/types';
import { shortLabel } from '../../../lib/altar/cabinet';
import { useLibrary } from '../../../lib/library';
import { type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { Label, sheetStyles, type AltarContext } from './common';

type Props = {
  visible: boolean;
  altar: AltarContext;
  /** The selected object, for its placement wisdom. */
  selected?: SavedObject | null;
  onClose: () => void;
  /** Arrange: apply plan.moves (applyMoves(doc.objects, plan.moves)). */
  onApply: (plan: LayoutPlan) => void;
};

export function LayoutSheet({ visible, altar, selected, onClose, onApply }: Props) {
  const { entries } = useLibrary();
  const [kind, setKind] = useState<LayoutKind | null>(null);
  const plan = visible && kind ? layoutPlan(kind, altar.objects, altar.background, entries) : null;
  const wisdom = visible && selected ? placementWisdom(selected, entries) : '';

  return (
    <Sheet visible={visible} size="half" eyebrow="Layouts with meaning" title="Arrange the altar" onClose={onClose}>
      {wisdom ? (
        <View style={sheetStyles.card}>
          <Label>{shortLabel(selected?.label)}</Label>
          <Text style={type.body}>{wisdom}</Text>
        </View>
      ) : null}
      <ChipRow>
        {LAYOUTS.map((l) => (
          <Chip key={l.id} label={l.title} active={kind === l.id} onPress={() => setKind(l.id)} />
        ))}
      </ChipRow>
      {plan ? (
        <View style={sheetStyles.section}>
          <Text style={type.body}>{plan.note}</Text>
          {plan.moves.length ? (
            <>
              {plan.moves.map((m) => (
                <Text key={`${m.index}-${m.role}`} style={type.caption}>
                  {m.role}: {shortLabel(m.label)}
                </Text>
              ))}
              <Button label={`Arrange as ${plan.title.toLowerCase()}`} onPress={() => onApply(plan)} />
              <Text style={type.caption}>Locked pieces and cloths stay where they are. Anything else without a place in it stays put too.</Text>
            </>
          ) : (
            <Text style={type.caption}>Nothing on the altar fits this layout yet.</Text>
          )}
        </View>
      ) : (
        <Text style={type.caption}>Choose a layout to see where each piece would go.</Text>
      )}
    </Sheet>
  );
}
