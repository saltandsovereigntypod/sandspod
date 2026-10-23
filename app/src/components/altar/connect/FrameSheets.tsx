// The ancestor frame: the panel section that shows when a frame is chosen
// (its photo, an old sepia look, the name and dates beneath it), and the
// sheet for naming it, by hand or from one of your Ancestors in Hedge.

import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '../../Button';
import { captionFromAncestor, frameArtOf, frameOf, isFrame, type FrameCaption } from '../../../lib/altar/frame';
import { appStateOf } from '../../../lib/altar/livingState';
import type { SavedObject } from '../../../lib/altar/types';
import { ANCESTORS, normalizeAncestor, type Ancestor, type AncestorEntry } from '../../../lib/craft/hedge/ancestors';
import { useCraft } from '../../../lib/craft/store';
import { colors, type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { connectStyles, Eyebrow, Field, PanelSection, Row } from './common';

type PanelProps = {
  object: SavedObject;
  /** Choosing and saving a photo is under way. */
  busy?: boolean;
  onChoosePhoto: () => void;
  onRemovePhoto: () => void;
  onAged: (aged: boolean) => void;
  onName: () => void;
};

/** The object panel section for an ancestor frame. */
export function FramePanelSection({ object, busy, onChoosePhoto, onRemovePhoto, onAged, onName }: PanelProps) {
  if (!isFrame(object)) return null;
  const frame = frameOf(object);
  const known = !!frameArtOf(object)?.opening;
  return (
    <PanelSection title="The photo">
      <Text style={type.caption}>
        {frame.photo
          ? frame.name
            ? `In memory of ${frame.name}${frame.dates ? `, ${frame.dates}` : ''}.`
            : 'Add a name and dates to show beneath it.'
          : 'Choose a photo of your own to set in the frame. It is cropped to fill the opening.'}
      </Text>
      {!known && <Text style={type.caption}>This frame’s picture has no opening the altar knows of, so the photo shows only in the close-up.</Text>}
      {busy ? (
        <ActivityIndicator color={colors.gold} accessibilityLabel="Saving the photo" />
      ) : (
        <ChipRow>
          <Chip label={frame.photo ? 'Change the photo' : 'Choose a photo'} symbol="▣" onPress={onChoosePhoto} />
          {!!frame.photo && (
            <Chip label="Old sepia" symbol="☙" active={frame.aged} accessibilityLabel={frame.aged ? 'Show the photo as it is' : 'Give the photo an old sepia look'} onPress={() => onAged(!frame.aged)} />
          )}
          <Chip label={frame.name ? 'Name and dates' : 'Add a name'} symbol="✎" onPress={onName} />
          {!!frame.photo && <Chip label="Take the photo out" symbol="⌫" onPress={onRemovePhoto} />}
        </ChipRow>
      )}
    </PanelSection>
  );
}

type SheetProps = {
  visible: boolean;
  object: SavedObject | null;
  onClose: () => void;
  onSave: (caption: FrameCaption) => void;
};

/** Name the frame and give its dates, or take both from one of your Ancestors. */
export function FrameNameSheet({ visible, object, onClose, onSave }: SheetProps) {
  const { entries } = useCraft<Ancestor>(ANCESTORS);
  const people = useMemo(
    () => [...(entries as AncestorEntry[])].sort((a, b) => normalizeAncestor(a.data).name.localeCompare(normalizeAncestor(b.data).name)),
    [entries],
  );
  const [name, setName] = useState('');
  const [dates, setDates] = useState('');
  const [linked, setLinked] = useState<{ id: string; name: string } | null>(null);
  useEffect(() => {
    if (!visible || !object) return;
    const frame = frameOf(object);
    const link = appStateOf(object).ancestor as { id?: string; name?: string } | null | undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start from what the frame says each time it opens
    setName(frame.name);
    setDates(frame.dates);
    setLinked(link?.id ? { id: link.id, name: String(link.name || '') } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when it opens
  }, [visible]);

  const choose = (entry: AncestorEntry) => {
    const caption = captionFromAncestor(entry);
    setName(caption.name);
    setDates(caption.dates);
    setLinked(caption.ancestor ?? null);
  };
  const save = () => {
    // Typing a different name unlinks it from the ancestor it was chosen from.
    const ancestor = linked && linked.name === name.trim() ? linked : null;
    onSave({ name, dates, ancestor });
  };

  return (
    <Sheet visible={visible} eyebrow="Ancestor frame" title="In memory of" onClose={onClose} size="half">
      <View style={connectStyles.gap}>
        <Field label="Their name" value={name} onChangeText={setName} placeholder="Their name" maxLength={80} />
        <Field label="Their dates" value={dates} onChangeText={setDates} placeholder="Their dates (optional): 1932–2019" maxLength={60} />
        <Text style={type.caption}>Shown beneath the photo when you look closer.</Text>
      </View>
      {people.length > 0 && (
        <View style={connectStyles.gap}>
          <Eyebrow>From your Ancestors</Eyebrow>
          {people.map((entry) => {
            const caption = captionFromAncestor(entry);
            const a = normalizeAncestor(entry.data);
            return (
              <Row
                key={entry.id}
                title={caption.name || 'Unnamed'}
                detail={[a.relation, caption.dates].filter(Boolean).join(' · ') || undefined}
                selected={linked?.id === entry.id}
                onPress={() => choose(entry)}
              />
            );
          })}
        </View>
      )}
      <Button label="Save" onPress={save} />
    </Sheet>
  );
}
