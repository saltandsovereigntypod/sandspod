// Build a spell jar in layers: choose what it's for, add ingredients one at a
// time (each with a line spoken as it goes in), then seal it with wax. The jar
// is saved to My Apothecary and handed back to be placed on the altar. And,
// for a placed jar, "shake to renew".

import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../Button';
import type { ApothecaryItem } from '../../../lib/altar/apothecary';
import { ALTAR_ARTWORK } from '../../../lib/altar/artworkData';
import { shortLabel } from '../../../lib/altar/cabinet';
import type { SavedObject } from '../../../lib/altar/types';
import { startItemLookBack } from '../../../lib/altar/apothecaryLookBack';
import { saveApothecary, useWorkshop } from '../../../lib/altar/workshop';
import type { LookBackPick } from '../../rituals/DidItWork';
import { ItemLookBackPicker, PlacedDidItWork } from '../../rituals/ItemDidItWork';
import {
  addLayer,
  daysSinceRenewal,
  dripCandles,
  emptyJar,
  JAR_LAYER_MAX,
  jarItem,
  jarLayer,
  jarObject,
  jarProblem,
  jarStateOf,
  layerBands,
  removeLayer,
  sealHex,
  sealJar,
  sealLine,
  shakeToRenew,
  SPOKEN_MAX,
  unsealJar,
  type JarDraft,
} from '../../../lib/altar/workings/spellJar';
import { useLibrary } from '../../../lib/library';
import { type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { Field, IngredientPicker, Label, nowIso, sheetStyles, type AltarContext, type Picked } from './common';
import { JarVisual } from './JarVisual';

export const JAR_INTENTIONS = ['Money', 'Love', 'Protection', 'Healing', 'Calm', 'Clarity', 'Courage', 'Cleansing', 'A sweeter home'];

export type PlacedWorking = { object: SavedObject; item: ApothecaryItem };

type Props = {
  visible: boolean;
  altar: AltarContext;
  onClose: () => void;
  /** The finished jar, saved to My Apothecary: add `object` to the altar. */
  onPlace: (result: PlacedWorking) => void;
  /** Where it should stand (stage fractions); the middle front by default. */
  center?: { cx: number; cy: number };
};

type Step = 'intention' | 'layers' | 'seal';

export function SpellJarSheet(props: Props) {
  return (
    <Sheet visible={props.visible} eyebrow="Spell jar" title="Build a jar in layers" onClose={props.onClose}>
      {props.visible && <JarBuilder {...props} />}
    </Sheet>
  );
}

function JarBuilder({ altar, onPlace, center }: Props) {
  const { entries } = useLibrary();
  const { userId } = useWorkshop();
  const [jar, setJar] = useState<JarDraft>(() => emptyJar());
  const [step, setStep] = useState<Step>('intention');
  const [spoken, setSpoken] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  // "Did it work?": the day that suits its intention, unless another is chosen.
  const [lookBack, setLookBack] = useState<{ pick: LookBackPick; custom: string }>({ pick: 'suggested', custom: '' });
  const bands = layerBands(jar.layers);
  const drips = dripCandles(altar.objects);

  const add = (p: Picked) => {
    setJar((j) => addLayer(j, jarLayer({ label: p.label, source: p.source, herb: p.herb, crystal: p.crystal, type: p.type, apothecaryItemId: p.apothecaryItemId, spoken }, nowIso(), entries)));
    setSpoken('');
  };

  const finish = async () => {
    const why = jarProblem(jar);
    if (why) return setProblem(why);
    setBusy(true);
    const now = nowIso();
    let item = startItemLookBack(jarItem(jar, now), lookBack.pick, new Date(now), lookBack.custom);
    try {
      item = await saveApothecary(userId, item, null);
    } catch {
      // Kept on the altar even if My Apothecary can't be reached; it saves with the altar.
    }
    const result = jarObject(jar, altar.objects, now, center, item);
    setBusy(false);
    onPlace(result);
  };

  return (
    <View style={sheetStyles.section}>
      <JarVisual bands={bands} seal={sealHex(jar.seal)} size={120} />

      {step === 'intention' && (
        <View style={sheetStyles.section}>
          <Label>What is it for?</Label>
          <ChipRow>
            {JAR_INTENTIONS.map((i) => (
              <Chip key={i} label={i} active={jar.intention === i} onPress={() => setJar((j) => ({ ...j, intention: i }))} />
            ))}
          </ChipRow>
          <Field label="The jar’s intention, in your words" value={jar.intention} onChangeText={(intention) => setJar((j) => ({ ...j, intention }))} placeholder="Or in your own words" maxLength={120} />
          <Button label="Begin the layers" onPress={() => setStep('layers')} disabled={!jar.intention.trim()} />
        </View>
      )}

      {step === 'layers' && (
        <View style={sheetStyles.section}>
          <Text style={type.caption}>
            For {jar.intention.trim().toLowerCase()}. Add each thing one at a time, bottom first. Say a line as it goes in, if you like.
          </Text>
          <Field label="Words to say as it goes in" value={spoken} onChangeText={setSpoken} placeholder="As this goes in, I ask…" maxLength={SPOKEN_MAX} />
          {jar.layers.length < JAR_LAYER_MAX ? (
            <IngredientPicker onPick={add} suggestFor={jar.intention} chosen={jar.layers.map((l) => l.label)} />
          ) : (
            <Text style={type.caption}>The jar is full to its neck.</Text>
          )}
          {jar.layers.length > 0 && (
            <View style={sheetStyles.section}>
              <Label>In the jar, top first</Label>
              <ChipRow>
                {[...jar.layers].reverse().map((layer, r) => {
                  const index = jar.layers.length - 1 - r;
                  return (
                    <Chip
                      key={`${layer.label}-${index}`}
                      label={`${layer.label}  ×`}
                      accessibilityLabel={`Take out ${layer.label}${layer.spoken ? `, spoken: ${layer.spoken}` : ''}`}
                      onPress={() => setJar((j) => removeLayer(j, index))}
                    />
                  );
                })}
              </ChipRow>
            </View>
          )}
          <View style={sheetStyles.row}>
            <Button label="Back" variant="outline" onPress={() => setStep('intention')} />
            <Button label="Seal it" onPress={() => setStep('seal')} disabled={!jar.layers.length} />
          </View>
        </View>
      )}

      {step === 'seal' && (
        <View style={sheetStyles.section}>
          <Label>Seal with wax</Label>
          <ChipRow>
            {ALTAR_ARTWORK.candleColors.map((color) => (
              <Chip
                key={color}
                label={color.charAt(0).toUpperCase() + color.slice(1)}
                active={!jar.seal?.dripFromUid && jar.seal?.color === color}
                onPress={() => setJar((j) => sealJar(j, color, nowIso()))}
              />
            ))}
          </ChipRow>
          {drips.length > 0 && (
            <View style={sheetStyles.section}>
              <Label>Or drip from a lit candle on the altar</Label>
              <ChipRow>
                {drips.map((candle) => (
                  <Chip
                    key={String(candle.altarObjectId)}
                    label={shortLabel(candle.label)}
                    symbol="✦"
                    accessibilityLabel={`Drip wax from ${shortLabel(candle.label)}`}
                    active={!!jar.seal?.dripFromUid && jar.seal.dripFromUid === candle.altarObjectId}
                    onPress={() => setJar((j) => sealJar(j, String(candle.color || 'white'), nowIso(), candle))}
                  />
                ))}
              </ChipRow>
            </View>
          )}
          <Text style={type.caption}>{sealLine(jar.seal)}.</Text>
          <Field label="Name the jar" value={jar.name} onChangeText={(name) => setJar((j) => ({ ...j, name }))} placeholder={`${jar.intention.trim() || 'Intention'} jar`} maxLength={60} />
          <ItemLookBackPicker
            item={{ id: '', name: jar.name || `${jar.intention.trim()} jar`, intention: jar.intention, createdAt: '' }}
            value={lookBack.pick}
            custom={lookBack.custom}
            onChange={(pick, custom) => setLookBack({ pick, custom })}
          />
          {problem && <Text style={sheetStyles.problem}>{problem}</Text>}
          <View style={sheetStyles.row}>
            <Button
              label="Back"
              variant="outline"
              onPress={() => {
                setJar(unsealJar);
                setStep('layers');
              }}
            />
            <Button label={busy ? 'Placing…' : 'Place on the altar'} onPress={finish} disabled={busy || !jar.seal} />
          </View>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------- renewing a placed jar

type RenewProps = {
  visible: boolean;
  /** A placed jar (jarStateOf(object) is not null). */
  object: SavedObject | null;
  onClose: () => void;
  /** The jar with the renewal logged: replace the object on the altar. */
  onUpdate: (object: SavedObject) => void;
};

/** A placed jar's layers and its renewals, with "shake to renew". */
export function JarRenewSheet({ visible, object, onClose, onUpdate }: RenewProps) {
  const jar = object ? jarStateOf(object) : null;
  const [note, setNote] = useState('');
  const [shakes, setShakes] = useState(0);
  const renew = () => {
    if (!object) return;
    setShakes((n) => n + 1);
    onUpdate(shakeToRenew(object, nowIso(), note));
    setNote('');
  };
  return (
    <Sheet visible={visible && !!jar} size="half" eyebrow="Spell jar" title={shortLabel(object?.label, 'Spell jar')} onClose={onClose}>
      {jar && (
        <View style={sheetStyles.section}>
          <JarVisual bands={layerBands(jar.layers)} seal={sealHex(jar.seal)} size={96} shakeKey={shakes} />
          <Text style={type.caption}>
            For {jar.intention.toLowerCase() || 'its intention'}. {sealLine(jar.seal)}.{' '}
            {jar.renewals.length ? `Last renewed ${daysSinceRenewal(jar) === 0 ? 'today' : `${daysSinceRenewal(jar)} days ago`}.` : 'Not renewed yet.'}
          </Text>
          <Field label="A word as you shake it" value={note} onChangeText={setNote} placeholder="Still growing…" maxLength={SPOKEN_MAX} />
          <Button label="Shake to renew" onPress={renew} />
          <PlacedDidItWork apothecaryItemId={object?.apothecaryItemId} />
          {jar.layers.some((l) => l.spoken) && (
            <View style={sheetStyles.section}>
              <Label>What was said</Label>
              {jar.layers
                .filter((l) => l.spoken)
                .map((l, i) => (
                  <Text key={`${l.label}-${i}`} style={type.body}>
                    {l.label}: “{l.spoken}”
                  </Text>
                ))}
            </View>
          )}
        </View>
      )}
    </Sheet>
  );
}
