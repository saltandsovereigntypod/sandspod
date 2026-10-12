import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { RichText, Tags } from '../more/ui';
import { burnHistory, careHistory, companionSettings, livingStateDisplay, stateRows, traditionalSplit } from '../../lib/altar/companion';
import { eventHistory, lifecycleRows, type InstanceEvent, type ObjectInstance } from '../../lib/altar/instances';
import type { SavedObject } from '../../lib/altar/types';
import { altarLibraryHref, altarPracticeHref, correspondences, type LibraryEntry } from '../../lib/library';
import { layerFields, visibleLayers } from '../../lib/library/model';
import type { LibraryField } from '../../lib/library/types';
import { LAYER_LABELS } from '../../lib/settings/defaults';
import { useMySettings } from '../../lib/settings/store';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  object: SavedObject | null;
  label: string;
  entry: LibraryEntry | null;
  onClose: () => void;
  /** The object's tracked instance, when it has one (signed in): lifecycle rows and its events. */
  instance?: ObjectInstance | null;
  instanceEvents?: InstanceEvent[];
};

/**
 * The altar's Companion panel for a phone: the key correspondences and the
 * object's own state up front, everything else folded under "More", and the
 * full Living Library page one tap away.
 */
export function AboutSheet({ visible, object, label, entry, onClose, instance, instanceEvents }: Props) {
  const { settings: saved } = useMySettings();
  // Settings → Companion panel: the Living Library page settings, or its own when "Copy" is off.
  const settings = companionSettings(saved);
  const [more, setMore] = useState(false);
  // Never unmount a presented Modal on iOS (it can leave a layer that swallows taps): close it instead.
  if (!object) return <Sheet visible={false} title={label} onClose={onClose}>{null}</Sheet>;

  const layers = visibleLayers(settings);
  const showTraditional = !!entry?.traditional && layers.includes('traditional');
  const facts = entry && showTraditional && settings?.library_traditional_correspondences !== false ? correspondences(entry) : [];
  const traditional = entry && showTraditional ? traditionalSplit(entry, settings) : { lead: [], warnings: [], rest: [] };
  const mine = entry && layers.includes('myPractice') ? layerFields(entry.myPractice, 'myPractice', settings, entry.layout) : [];
  const community = entry && layers.includes('community') ? layerFields(entry.community, 'community', settings, entry.layout) : [];
  // With an instance, its dates and amount are the ones that count (the Companion's lifecycle block).
  const lifecycle = lifecycleRows(instance, new Date());
  const own = stateRows(object, new Date(), saved);
  const state = lifecycle.length ? [...lifecycle, ...own.filter((row) => !['Next tending', 'Review by', 'Remaining'].includes(row.label))] : own;
  const burns = livingStateDisplay(saved).recentActivity
    ? [...burnHistory(object, new Date()), ...careHistory(object, new Date()), ...eventHistory(instanceEvents ?? [], new Date())]
    : [];
  const hasMore = traditional.rest.length > 0 || community.length > 0 || burns.length > 5;
  const nothing = !facts.length && !traditional.lead.length && !traditional.warnings.length && !mine.length && !state.length;

  const close = () => {
    setMore(false);
    onClose();
  };

  return (
    <Sheet visible={visible} size="half" eyebrow={entry?.category ?? 'On your altar'} title={label} onClose={close}>
      {facts.length > 0 && (
        <View style={styles.facts}>
          {facts.map((fact) => (
            <View key={fact.label} style={styles.fact} accessible accessibilityLabel={`${fact.label}: ${fact.value}`}>
              <Text style={styles.factLabel}>{fact.label}</Text>
              <Text style={styles.factValue}>{fact.value}</Text>
            </View>
          ))}
        </View>
      )}

      {state.length > 0 && (
        <Block title="On this altar">
          {state.map((row, index) => (
            <View key={`${row.label}-${index}`} style={styles.row} accessible accessibilityLabel={`${row.label}: ${row.value}`}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </Block>
      )}

      {burns.length > 0 && (
        <Block title="History">
          {burns.slice(0, more ? burns.length : 5).map((burn, index) => (
            <View key={`${burn.detail}-${index}`} style={styles.row} accessible accessibilityLabel={`${burn.label}, ${burn.detail}`}>
              <Text style={styles.rowLabel}>{burn.label}</Text>
              <Text style={styles.rowValue}>{burn.detail}</Text>
            </View>
          ))}
          {!more && burns.length > 5 && <Text style={type.caption}>{`${burns.length - 5} earlier under More`}</Text>}
        </Block>
      )}

      {mine.length > 0 && (
        <Block title={LAYER_LABELS.myPractice} gold>
          <Fields fields={mine} />
        </Block>
      )}

      {(traditional.lead.length > 0 || traditional.warnings.length > 0) && (
        <Block title={LAYER_LABELS.traditional}>
          <Fields fields={[...traditional.lead, ...traditional.warnings]} />
        </Block>
      )}

      {nothing && (
        <Text style={type.body}>
          {entry
            ? 'Nothing to show here with your current Living Library settings.'
            : 'This object isn’t in the Living Library, so there are no correspondences to show yet.'}
        </Text>
      )}

      {hasMore &&
        (more ? (
          <>
            {traditional.rest.length > 0 && (
              <Block title={`More ${LAYER_LABELS.traditional.toLowerCase()}`}>
                <Fields fields={traditional.rest} />
              </Block>
            )}
            {community.length > 0 && (
              <Block title={LAYER_LABELS.community}>
                <Fields fields={community} />
              </Block>
            )}
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Show more about this object"
            onPress={() => setMore(true)}
            style={({ pressed }) => [styles.more, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.moreText}>More: pairings, how to use, notes ▾</Text>
          </Pressable>
        ))}

      {entry && (
        <Button
          label="Open in Living Library"
          variant="outline"
          onPress={() => {
            close();
            router.push(altarLibraryHref(entry));
          }}
        />
      )}
      {entry && (
        <Button
          label="Edit My Practice"
          variant="text"
          accessibilityHint="Opens your own notes for this in the Living Library"
          onPress={() => {
            close();
            router.push(altarPracticeHref(entry));
          }}
        />
      )}
    </Sheet>
  );
}

function Block({ title, gold, children }: { title: string; gold?: boolean; children: ReactNode }) {
  return (
    <View style={[styles.block, gold && styles.blockGold]}>
      <Text style={type.eyebrow}>{title}</Text>
      {children}
    </View>
  );
}

function Fields({ fields }: { fields: LibraryField[] }) {
  return (
    <>
      {fields.map((field) => (
        <View key={field.key} style={styles.field}>
          <Text style={styles.fieldLabel}>{field.label}</Text>
          {field.chips ? <Tags items={field.chips} /> : <RichText text={field.text} />}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fact: {
    flexGrow: 1,
    minWidth: 96,
    backgroundColor: colors.ground,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  factLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.gold },
  factValue: { fontFamily: fonts.display, fontSize: 18, color: colors.cream },
  block: { gap: 10, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline, padding: 14 },
  blockGold: { borderColor: colors.goldLine },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  rowLabel: { fontFamily: fonts.body, fontSize: 15, color: colors.parchment },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
  field: { gap: 6 },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  more: { minHeight: touch, justifyContent: 'center' },
  moreText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
});
