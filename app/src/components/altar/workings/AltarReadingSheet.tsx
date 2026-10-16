// Reading the altar: its balance of elements and planets, what it speaks of,
// how it holds its intention, and one thing that would round it out.

import { Text, View } from 'react-native';

import { Button } from '../../Button';
import { builtInCabinet, objectFromForm } from '../../../lib/altar/cabinet';
import { ELEMENTS } from '../../../lib/altar/reading/correspondence';
import { readAltar } from '../../../lib/altar/reading/reading';
import type { CabinetItem, SavedObject } from '../../../lib/altar/types';
import type { LibraryEntry } from '../../../lib/library/types';
import { useWorkshop } from '../../../lib/altar/workshop';
import { useLibrary } from '../../../lib/library';
import { colors, type } from '../../../theme';
import { Sheet } from '../Sheet';
import { Label, nowIso, sheetStyles, type AltarContext } from './common';
import { useAltarIntention } from './IntentionSheet';

type Props = {
  visible: boolean;
  altar: AltarContext;
  onClose: () => void;
  /** Place the suggested piece: add `object` to the altar. Leave out to hide the button. */
  onPlaceSuggestion?: (object: SavedObject) => void;
  /** Open the intention sheet. */
  onEditIntention?: () => void;
};

const ELEMENT_COLORS: Record<string, string> = { Fire: '#c2603a', Water: '#4f7f9f', Air: '#d8c88a', Earth: '#7a6a45' };

export function AltarReadingSheet({ visible, altar, onClose, onPlaceSuggestion, onEditIntention }: Props) {
  const { entries } = useLibrary();
  const { customItems, apothecary } = useWorkshop();
  const { text } = useAltarIntention(altar.id);
  return (
    <Sheet visible={visible} eyebrow="Reading the altar" title={altar.name || 'This altar'} onClose={onClose}>
      {visible && <ReadingBody altar={altar} intention={text} onPlaceSuggestion={onPlaceSuggestion} onEditIntention={onEditIntention} entries={entries} customItems={customItems} owned={apothecary.flatMap((a) => a.ingredients.map((i) => i.label))} />}
    </Sheet>
  );
}

function ReadingBody({
  altar,
  intention: text,
  entries,
  customItems,
  owned,
  onPlaceSuggestion,
  onEditIntention,
}: Pick<Props, 'altar' | 'onPlaceSuggestion' | 'onEditIntention'> & { intention: string; entries: LibraryEntry[]; customItems: CabinetItem[]; owned: string[] }) {
  const reading = readAltar({
    objects: altar.objects,
    entries,
    intention: text,
    cabinet: customItems,
    ownedNames: owned,
  });
  const most = Math.max(1, ...ELEMENTS.map((e) => reading.elements[e]));
  const s = reading.suggestion;
  const place = () => {
    if (!s?.cabinetItemId || !onPlaceSuggestion) return;
    const item = [...customItems, ...builtInCabinet].find((i) => i.id === s.cabinetItemId);
    const form = item?.forms.find((f) => f.label === s.formLabel) ?? item?.forms[0];
    if (item && form) onPlaceSuggestion(objectFromForm(item, form, altar.objects, nowIso(), {}, { cx: 0.5, cy: 0.62 }));
  };

  return (
    <View style={sheetStyles.section}>
      {reading.pieces > 0 && (
        <View style={sheetStyles.section} accessible accessibilityLabel={`Elements: ${ELEMENTS.map((e) => `${e} ${reading.elements[e]}`).join(', ')}`}>
          {ELEMENTS.map((e) => (
            <View key={e} style={sheetStyles.row}>
              <Text style={[type.caption, { width: 52 }]}>{e}</Text>
              <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surfaceRaised }}>
                <View style={{ width: `${(reading.elements[e] / most) * 100}%`, height: 8, borderRadius: 4, backgroundColor: ELEMENT_COLORS[e] }} />
              </View>
              <Text style={[type.caption, { width: 20, textAlign: 'right' }]}>{reading.elements[e]}</Text>
            </View>
          ))}
        </View>
      )}
      {reading.sentences.map((line, i) => (
        <Text key={i} style={type.body}>
          {line}
        </Text>
      ))}
      {!text && onEditIntention && reading.pieces > 0 && (
        <View style={sheetStyles.card}>
          <Label>No intention set</Label>
          <Text style={type.caption}>Give the altar an intention and the reading will say how well it holds it.</Text>
          <Button label="Set an intention" variant="outline" onPress={onEditIntention} />
        </View>
      )}
      {s?.cabinetItemId && onPlaceSuggestion && <Button label={`Place ${s.name}`} onPress={place} />}
    </View>
  );
}
