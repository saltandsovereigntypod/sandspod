// An altar's intention: set or change the one line saying what it's for, and
// see how each piece on it supports that. Saved in the craft store,
// `altar.intentions` (one per altar).

import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../Button';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../lib/craft/store';
import { coherence, INTENTION_MAX, intentionEntry, intentionFor, INTENTIONS_COLLECTION, scoreAltar, type IntentionEntry } from '../../../lib/altar/reading/intention';
import { useLibrary } from '../../../lib/library';
import { type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { Field, Label, nowIso, sheetStyles, type AltarContext } from './common';

/** This altar's intention, live, and a way to set or clear it. */
export function useAltarIntention(altarId: string) {
  const { entries, ready } = useCraft<IntentionEntry>(INTENTIONS_COLLECTION);
  const current = intentionFor(entries, altarId);
  const save = async (text: string) => {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) {
      if (current) await removeEntry(INTENTIONS_COLLECTION, current.id);
      return;
    }
    const data = intentionEntry(altarId, clean, nowIso());
    if (current) await updateEntry(INTENTIONS_COLLECTION, current.id, data);
    else await addEntry(INTENTIONS_COLLECTION, data);
  };
  return { text: current?.data.text ?? '', ready, save };
}

type Props = { visible: boolean; altar: AltarContext; onClose: () => void };

const SUGGESTIONS = ['Protection for my home', 'Steady money and good work', 'Self-love', 'Calm and good sleep', 'Clear sight', 'Honouring my ancestors'];

export function IntentionSheet({ visible, altar, onClose }: Props) {
  const { text, save, ready } = useAltarIntention(altar.id);
  return (
    <Sheet visible={visible} eyebrow="This altar’s intention" title={text || 'What is this altar for?'} onClose={onClose}>
      {visible && ready && <IntentionForm key={text} initial={text} altar={altar} onSave={save} />}
    </Sheet>
  );
}

function IntentionForm({ initial, altar, onSave }: { initial: string; altar: AltarContext; onSave: (text: string) => Promise<void> }) {
  const { entries } = useLibrary();
  const [draft, setDraft] = useState(initial);
  const supports = scoreAltar(altar.objects, initial, entries);
  return (
    <View style={sheetStyles.section}>
      <Field label="The altar’s intention" value={draft} onChangeText={setDraft} placeholder="In a few words" maxLength={INTENTION_MAX} />
      {!initial && (
        <ChipRow>
          {SUGGESTIONS.map((s) => (
            <Chip key={s} label={s} onPress={() => setDraft(s)} />
          ))}
        </ChipRow>
      )}
      <View style={sheetStyles.row}>
        <Button label={initial ? 'Change it' : 'Set it'} onPress={() => void onSave(draft)} disabled={!draft.trim() || draft.trim() === initial} />
        {!!initial && <Button label="Clear" variant="outline" onPress={() => void onSave('')} />}
      </View>
      {initial && supports.length > 0 && (
        <View style={sheetStyles.section}>
          <Label>{`How the altar holds it · ${Math.round(coherence(supports) * 100)}%`}</Label>
          {supports.map((s) => (
            <View key={`${s.index}-${s.uid}`} style={sheetStyles.card}>
              <View style={sheetStyles.between}>
                <Text style={sheetStyles.value}>{s.label}</Text>
                <Text style={type.caption} accessibilityLabel={`Support ${Math.round(s.score * 100)} percent`}>
                  {s.score >= 0.7 ? 'Strong' : s.score > 0 ? 'Some' : 'Quiet'}
                </Text>
              </View>
              <Text style={type.caption}>{s.note}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
