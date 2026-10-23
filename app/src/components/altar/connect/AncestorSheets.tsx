// The ancestor shrine: set one of your dead from Hedge → Ancestors on the
// altar as a memorial candle, and the panel section that shows them when
// their candle is chosen: their days, what they loved, a memory, and a
// candle lit for them.

import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../Button';
import { ANCESTORS, normalizeAncestor, type Ancestor, type AncestorEntry } from '../../../lib/craft/hedge/ancestors';
import { useCraft } from '../../../lib/craft/store';
import { ancestorOf, ancestorPanel, ancestorRite, MEMORIAL_COLORS, MEMORIAL_FORMS, memorialObject, shrineChoices } from '../../../lib/altar/connect/ancestor';
import { isCandle, isLit } from '../../../lib/altar/livingState';
import type { SavedObject } from '../../../lib/altar/types';
import type { TemplateDraft } from '../../../lib/rituals/types';
import { type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { connectStyles, Eyebrow, nowIso, PanelSection, Row, type AltarRef } from './common';

type SheetProps = {
  visible: boolean;
  altar: AltarRef;
  onClose: () => void;
  /** Add the memorial candle to the altar (editor addObject). */
  onPlace: (object: SavedObject) => void;
};

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Choose an ancestor and a candle for them. */
export function AncestorShrineSheet({ visible, altar, onClose, onPlace }: SheetProps) {
  const { entries, ready } = useCraft<Ancestor>(ANCESTORS);
  const choices = useMemo(() => shrineChoices(entries as AncestorEntry[], altar.objects), [entries, altar.objects]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [color, setColor] = useState('white');
  const [form, setForm] = useState('tea-light');
  const picked = choices.find((c) => c.entry.id === chosen)?.entry ?? null;

  const place = () => {
    if (!picked) return;
    onPlace(memorialObject(picked, altar.objects, nowIso(), { color, form }));
    setChosen(null);
    onClose();
  };

  return (
    <Sheet visible={visible} eyebrow="Ancestor shrine" title="A candle for one of your dead" onClose={onClose}>
      {ready && choices.length === 0 ? (
        <View style={connectStyles.gap}>
          <Text style={connectStyles.body}>Add the people you remember in Hedge → Ancestors, with their days and what they loved. Then you can set a candle for them here.</Text>
          <Button
            label="Open Ancestors"
            variant="outline"
            onPress={() => {
              onClose();
              router.push('/rituals/craft/hedge/ancestors' as Href);
            }}
          />
        </View>
      ) : (
        <View style={connectStyles.gap}>
          <Eyebrow>Who</Eyebrow>
          {choices.map(({ entry, placed }) => {
            const a = normalizeAncestor(entry.data);
            const detail = [a.relation, placed ? 'already on this altar' : ''].filter(Boolean).join(' · ');
            return <Row key={entry.id} title={a.name || 'Unnamed'} detail={detail || undefined} selected={chosen === entry.id} onPress={() => setChosen(entry.id)} />;
          })}
        </View>
      )}
      {picked && (
        <>
          <View style={connectStyles.gap}>
            <Eyebrow>The candle</Eyebrow>
            <ChipRow>
              {MEMORIAL_FORMS.map((f) => (
                <Chip key={f.form} label={f.label} active={form === f.form} accessibilityLabel={`${f.label}. ${f.hint}`} onPress={() => setForm(f.form)} />
              ))}
            </ChipRow>
            <Text style={type.caption}>{MEMORIAL_FORMS.find((f) => f.form === form)?.hint}</Text>
          </View>
          <View style={connectStyles.gap}>
            <Eyebrow>Its colour</Eyebrow>
            <ChipRow>
              {MEMORIAL_COLORS.map((c) => (
                <Chip key={c} label={capital(c)} active={color === c} onPress={() => setColor(c)} />
              ))}
            </ChipRow>
            <Text style={type.caption}>White suits anyone; or choose a colour they loved.</Text>
          </View>
          <Button label={`Set a candle for ${normalizeAncestor(picked.data).name || 'them'}`} onPress={place} />
        </>
      )}
    </Sheet>
  );
}

type PanelProps = {
  /** The chosen object; the section shows only for a memorial candle. */
  object: SavedObject;
  /** Light this candle (toggleLight on its index). */
  onLight: () => void;
  /** Begin the Hedge candle rite for them, linked to this altar (startRitual({ kind: 'draft', draft })). */
  onBeginRite?: (draft: TemplateDraft) => void;
  altarId: string | null;
};

/** The object panel section for a memorial candle, or an ancestor frame linked to someone. */
export function AncestorPanelSection({ object, onLight, onBeginRite, altarId }: PanelProps) {
  const link = ancestorOf(object);
  const { entries } = useCraft<Ancestor>(ANCESTORS);
  const entry = link ? (entries.find((e) => e.id === link.id) as AncestorEntry | undefined) : undefined;
  const panel = useMemo(() => (entry ? ancestorPanel(entry, new Date()) : null), [entry]);
  if (!link) return null;
  if (!panel || !entry) {
    return (
      <PanelSection title="In memory">
        <Text style={connectStyles.body}>{`${isCandle(object) ? 'A candle' : 'Kept here'} for ${link.name || 'one remembered'}. Their page in Ancestors isn’t on this phone, or it has been removed.`}</Text>
      </PanelSection>
    );
  }
  const lit = isLit(object);
  return (
    <PanelSection title="In memory">
      <Text style={connectStyles.value}>{[panel.name, panel.relation].filter(Boolean).join(', ')}</Text>
      {(panel.born || panel.died) && <Text style={type.caption}>{[panel.born && `Born ${panel.born}`, panel.died && `died ${panel.died}`].filter(Boolean).join(', ')}</Text>}
      {panel.today && <Text style={connectStyles.value}>{`Today: ${panel.today.words.toLowerCase()}.`}</Text>}
      {panel.days
        .filter((d) => d.inDays > 0)
        .map((d) => (
          <Text key={d.kind} style={type.caption}>{`${d.when}: ${d.words.charAt(0).toLowerCase()}${d.words.slice(1)}`}</Text>
        ))}
      {!!panel.loved && <Text style={connectStyles.body}>{`They loved ${panel.loved}.`}</Text>}
      {!!panel.memory && <Text style={connectStyles.quote}>{panel.memory}</Text>}
      <ChipRow>
        {/* An ancestor frame is linked to them too, but only a candle is lit. */}
        {isCandle(object) && <Chip label={lit ? 'Their candle is lit' : 'Light a candle for them'} symbol="🜂" disabled={lit} onPress={onLight} />}
        {onBeginRite && <Chip label="Begin the candle rite" symbol="❦" onPress={() => onBeginRite(ancestorRite(entry, altarId))} />}
        <Chip label="Their page" onPress={() => router.push(`/rituals/craft/hedge/ancestors/${entry.id}` as Href)} />
      </ChipRow>
    </PanelSection>
  );
}
