import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AltarStage, clampViewport, type Viewport } from '../../../components/altar/AltarStage';
import { CabinetSheet } from '../../../components/altar/CabinetSheet';
import { Chip, ChipRow } from '../../../components/altar/Chip';
import { BackgroundSheet, DressSheet, LayersSheet, SaveSheet } from '../../../components/altar/OptionSheets';
import { Button } from '../../../components/Button';
import { builtInCabinet, objectFromForm } from '../../../lib/altar/cabinet';
import {
  addObject,
  changeLayer,
  dressObject,
  duplicateObject,
  flipObject,
  moveObject,
  prepareDocument,
  removeObject,
  resizeObject,
  rotateObject,
  setBackground,
  setObjectSize,
  setRotation,
  toggleGlow,
  toggleLight,
  toggleLock,
  undressObject,
} from '../../../lib/altar/editor';
import { displayBox, STAGE_ASPECT } from '../../../lib/altar/geometry';
import { stackOrder } from '../../../lib/altar/layers';
import { dressingsOf, isCandle, isLit, readLivingState } from '../../../lib/altar/livingState';
import { altarSummary, documentFromAltar, emptyDocument, type AltarDocument } from '../../../lib/altar/snapshot';
import { useAltars } from '../../../lib/altar/store';
import type { CabinetForm, CabinetItem } from '../../../lib/altar/types';
import { colors, fonts, space, touch, type } from '../../../theme';

type SheetName = 'cabinet' | 'background' | 'layers' | 'dress' | 'save' | null;

const nowIso = () => new Date().toISOString();
const MAX_STAGE_WIDTH = 960;

function burnTime(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

export default function AltarEditor() {
  const { altarId } = useLocalSearchParams<{ altarId: string }>();
  const store = useAltars();
  const { altars, draft, draftSourceId, status, customItems, backgrounds, overrides, signedIn } = store;

  const [doc, setDoc] = useState<AltarDocument | null>(null);
  const [baseline, setBaseline] = useState<AltarDocument | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [name, setName] = useState('My Altar');
  const [missing, setMissing] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [sheet, setSheet] = useState<SheetName>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewport, setViewport] = useState<Viewport>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const undo = useRef<AltarDocument[]>([]);
  const redo = useRef<AltarDocument[]>([]);
  const loadedFor = useRef<string | null>(null);

  // Open the requested altar once its data is available.
  useEffect(() => {
    if (!altarId || loadedFor.current === altarId) return;
    const start = (source: AltarDocument, id: string | null, altarName: string) => {
      const prepared = prepareDocument(source, nowIso());
      loadedFor.current = altarId;
      setDoc(prepared);
      setBaseline(prepared);
      setSourceId(id);
      setName(altarName);
      setSelected(null);
      setMissing(false);
      undo.current = [];
      redo.current = [];
    };
    if (altarId === 'new') return start(emptyDocument(), null, 'My Altar');
    if (altarId === 'draft') {
      if (!draft) return;
      const source = draftSourceId ? altars.find((a) => a.id === draftSourceId) : null;
      const opened = documentFromAltar(draft);
      start(opened, source?.id ?? null, source?.name ?? 'My Altar');
      // The draft differs from what was saved; keep it marked as unsaved.
      setBaseline(null);
      return;
    }
    const altar = altars.find((a) => a.id === altarId);
    if (altar) return start(documentFromAltar(altar), altar.id, altar.name || 'My Altar');
    if (status === 'ready' || status === 'offline' || status === 'error') setMissing(true);
  }, [altarId, altars, draft, draftSourceId, status]);

  const dirty = !!doc && doc !== baseline;

  // Keep a working draft like the website, so nothing is lost if you leave.
  const { saveDraft } = store;
  useEffect(() => {
    if (doc && dirty) saveDraft(doc, sourceId);
  }, [doc, dirty, sourceId, saveDraft]);

  const stageWidth = Math.min(containerWidth, MAX_STAGE_WIDTH);

  // Edits go through a ref so several in one gesture frame build on each other.
  const docRef = useRef<AltarDocument | null>(null);
  docRef.current = doc;

  const commit = useCallback((next: (d: AltarDocument) => AltarDocument, recordUndo = true) => {
    const current = docRef.current;
    if (!current) return;
    const result = next(current);
    if (result === current) return;
    if (recordUndo) {
      undo.current = [...undo.current.slice(-59), current];
      redo.current = [];
    }
    docRef.current = result;
    setDoc(result);
  }, []);

  const pushUndo = useCallback(() => {
    if (!docRef.current) return;
    undo.current = [...undo.current.slice(-59), docRef.current];
    redo.current = [];
  }, []);

  const stepHistory = (from: typeof undo, to: typeof redo) => {
    const current = docRef.current;
    const previous = from.current[from.current.length - 1];
    if (!current || !previous) return;
    from.current = from.current.slice(0, -1);
    to.current = [...to.current, current];
    docRef.current = previous;
    setDoc(previous);
    setSelected(null);
  };

  const place = (item: CabinetItem, form: CabinetForm) => {
    if (!doc) return;
    const zoomedWidth = stageWidth * viewport.zoom;
    const center = zoomedWidth
      ? {
          cx: (viewport.offsetX + stageWidth / 2) / zoomedWidth,
          cy: (viewport.offsetY + stageWidth / STAGE_ASPECT / 2) / (zoomedWidth / STAGE_ASPECT),
        }
      : { cx: 0.5, cy: 0.5 };
    const object = objectFromForm(item, form, doc.objects, nowIso(), overrides, center);
    commit((d) => {
      const added = addObject(d, object);
      const index = added.objects.length - 1;
      const box = displayBox(object);
      return moveObject(added, index, box.cx, box.cy); // keeps it inside the stage
    });
    setSelected(doc.objects.length);
    setSheet(null);
  };

  const save = async (altarName: string, asNew: boolean) => {
    if (!doc) return;
    const id = await store.save({ id: asNew ? null : sourceId, name: altarName, doc });
    await store.clearDraft();
    setBaseline(doc);
    setSourceId(id);
    setName(altarName.trim() || 'My Altar');
    loadedFor.current = id;
    router.setParams({ altarId: id });
    setSheet(null);
    setNotice(signedIn ? 'Saved to your Sanctuary.' : 'Saved on this device.');
  };

  const removeAltar = async () => {
    if (!sourceId) return;
    try {
      await store.remove(sourceId);
      await store.clearDraft();
      router.back();
    } catch (e) {
      setNotice(`Couldn't delete: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const onLayout = (e: LayoutChangeEvent) => setContainerWidth(Math.max(0, Math.round(e.nativeEvent.layout.width) - 24));
  const zoomBy = (factor: number) =>
    setViewport((v) => {
      const zoom = Math.max(1, Math.min(4, v.zoom * factor));
      // Zoom about the middle of what's visible.
      const cx = (v.offsetX + stageWidth / 2) / v.zoom;
      const cy = (v.offsetY + stageWidth / STAGE_ASPECT / 2) / v.zoom;
      return clampViewport(
        { zoom, offsetX: cx * zoom - stageWidth / 2, offsetY: cy * zoom - stageWidth / STAGE_ASPECT / 2 },
        stageWidth,
      );
    });

  const allItems = useMemo(() => [...customItems, ...builtInCabinet], [customItems]);
  const selectedObject = doc && selected != null ? doc.objects[selected] ?? null : null;

  if (missing) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.centered}>
          <Text style={type.cardTitle}>This altar isn't here</Text>
          <Text style={type.body}>It may have been deleted, or it's saved to another account.</Text>
          <Button label="Back to your altars" variant="outline" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/altar'))}
          accessibilityRole="button"
          accessibilityLabel="Back to your altars"
          style={styles.headerButton}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={type.eyebrow} numberOfLines={1}>
            {dirty ? 'Unsaved changes' : doc?.backgroundName || 'Altar'}
          </Text>
          <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
            {name}
          </Text>
        </View>
        <Button label="Save" variant={dirty ? 'primary' : 'outline'} onPress={() => setSheet('save')} disabled={!doc} />
      </View>

      <View style={styles.stageWrap} onLayout={onLayout}>
        {doc && stageWidth > 0 ? (
          <AltarStage
            doc={doc}
            width={stageWidth}
            viewport={viewport}
            selected={selected}
            onSelect={setSelected}
            onGestureStart={pushUndo}
            onMove={(i, cx, cy) => commit((d) => moveObject(d, i, cx, cy), false)}
            onResize={(i, size) => commit((d) => setObjectSize(d, i, size), false)}
            onRotate={(i, deg) => commit((d) => setRotation(d, i, deg), false)}
            onGestureEnd={() => {}}
            onViewportChange={setViewport}
          />
        ) : (
          <View style={{ height: (containerWidth || 320) / STAGE_ASPECT, justifyContent: 'center' }}>
            <ActivityIndicator color={colors.gold} />
          </View>
        )}
      </View>

      <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent} alwaysBounceHorizontal={false}>
        {notice && (
          <Text style={[type.caption, styles.notice]} accessibilityLiveRegion="polite" onPress={() => setNotice(null)}>
            {notice}
          </Text>
        )}

        {doc && selectedObject && selected != null ? (
          <ObjectPanel
            key={selected}
            objectLabel={selectedObject.label || 'Object'}
            object={selectedObject}
            onDone={() => setSelected(null)}
            act={{
              light: () => commit((d) => toggleLight(d, selected, nowIso())),
              dress: () => setSheet('dress'),
              undress: () => commit((d) => undressObject(d, selected, nowIso())),
              rotate: (deg) => commit((d) => rotateObject(d, selected, deg)),
              resize: (f) => commit((d) => resizeObject(d, selected, f)),
              flip: () => commit((d) => flipObject(d, selected)),
              layer: (move) => {
                const before = stackOrder(doc.objects);
                commit((d) => changeLayer(d, selected, move));
                if (before.length < 2) setNotice('Add more to the altar to layer things.');
              },
              lock: () => commit((d) => toggleLock(d, selected)),
              glow: () => commit((d) => toggleGlow(d, selected)),
              duplicate: () => {
                commit((d) => duplicateObject(d, selected, nowIso()));
                setSelected(doc.objects.length);
              },
              remove: () => {
                commit((d) => removeObject(d, selected));
                setSelected(null);
              },
            }}
          />
        ) : doc ? (
          <View style={styles.section}>
            <Button label="Open the cabinet" onPress={() => setSheet('cabinet')} />
            <ChipRow>
              <Chip label="Background" symbol="❖" onPress={() => setSheet('background')} />
              <Chip label="Layers" symbol="☰" onPress={() => setSheet('layers')} disabled={doc.objects.length === 0} />
              <Chip label="Undo" symbol="↶" onPress={() => stepHistory(undo, redo)} disabled={undo.current.length === 0} />
              <Chip label="Redo" symbol="↷" onPress={() => stepHistory(redo, undo)} disabled={redo.current.length === 0} />
              <Chip label="Zoom in" symbol="+" onPress={() => zoomBy(1.5)} disabled={viewport.zoom >= 4} />
              <Chip label="Zoom out" symbol="−" onPress={() => zoomBy(1 / 1.5)} disabled={viewport.zoom <= 1} />
            </ChipRow>
            <Text style={type.caption}>
              {altarSummary(doc)}. Tap something on the altar to tend it. Drag to move it, pinch to resize and twist to
              turn it.{viewport.zoom > 1 ? ' Drag an empty spot to look around.' : ''}
            </Text>
            {sourceId && (
              <View style={styles.danger}>
                {confirmDelete ? (
                  <ChipRow>
                    <Chip label="Delete this altar for good" tone="danger" onPress={removeAltar} />
                    <Chip label="Keep it" onPress={() => setConfirmDelete(false)} />
                  </ChipRow>
                ) : (
                  <Chip label="Delete altar" tone="danger" onPress={() => setConfirmDelete(true)} />
                )}
              </View>
            )}
          </View>
        ) : (
          <ActivityIndicator color={colors.gold} />
        )}
      </ScrollView>

      {doc && (
        <>
          <CabinetSheet
            visible={sheet === 'cabinet'}
            items={allItems}
            overrides={overrides}
            onClose={() => setSheet(null)}
            onPlace={place}
          />
          <BackgroundSheet
            visible={sheet === 'background'}
            current={doc.background}
            custom={backgrounds}
            onClose={() => setSheet(null)}
            onChoose={(bg) => {
              commit((d) => setBackground(d, bg.background, bg.name));
              setSheet(null);
            }}
          />
          <LayersSheet
            visible={sheet === 'layers'}
            doc={doc}
            selected={selected}
            onClose={() => setSheet(null)}
            onSelect={(i) => {
              setSelected(i);
              setSheet(null);
            }}
            onMove={(i, move) => commit((d) => changeLayer(d, i, move))}
          />
          <DressSheet
            visible={sheet === 'dress'}
            doc={doc}
            candle={selected}
            onClose={() => setSheet(null)}
            onDress={(ingredient) => {
              if (selected != null) commit((d) => dressObject(d, selected, ingredient, nowIso()));
              setSheet(null);
            }}
          />
          <SaveSheet
            visible={sheet === 'save'}
            initialName={name}
            hasSource={!!sourceId}
            signedIn={signedIn}
            onClose={() => setSheet(null)}
            onSave={save}
          />
        </>
      )}
    </SafeAreaView>
  );
}

type Actions = {
  light: () => void;
  dress: () => void;
  undress: () => void;
  rotate: (degrees: number) => void;
  resize: (factor: number) => void;
  flip: () => void;
  layer: (move: 'front' | 'forward' | 'backward' | 'back') => void;
  lock: () => void;
  glow: () => void;
  duplicate: () => void;
  remove: () => void;
};

function ObjectPanel({
  object,
  objectLabel,
  act,
  onDone,
}: {
  object: import('../../../lib/altar/types').SavedObject;
  objectLabel: string;
  act: Actions;
  onDone: () => void;
}) {
  const candle = isCandle(object);
  const lit = isLit(object);
  const locked = object.locked === 'true';
  const glowing = object.glowing === 'true';
  const dressings = candle ? dressingsOf(object) : [];
  const burned = candle ? Number(readLivingState(object, nowIso()).candle?.totalBurnMs) || 0 : 0;
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <View style={styles.section}>
      <View style={styles.objectHead}>
        <View style={{ flex: 1 }}>
          <Text style={type.eyebrow}>{locked ? 'Locked in place' : lit ? 'Burning' : 'Selected'}</Text>
          <Text style={type.cardTitle}>{objectLabel}</Text>
          {candle && (burned > 0 || dressings.length > 0) && (
            <Text style={type.caption}>
              {[
                burned > 0 ? `Burned ${burnTime(burned)} in all` : null,
                dressings.length ? `Dressed with ${dressings.map((d) => d.label).join(', ')}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          )}
        </View>
        <Button label="Done" variant="text" onPress={onDone} accessibilityHint="Deselects this object" />
      </View>

      {candle && (
        <>
          <Button label={lit ? 'Snuff the candle' : 'Light the candle'} onPress={act.light} />
          <ChipRow>
            <Chip label="Dress" symbol="❦" onPress={act.dress} />
            {dressings.length > 0 && <Chip label="Undress" symbol="⌫" onPress={act.undress} />}
          </ChipRow>
        </>
      )}

      <Text style={type.eyebrow}>Arrange</Text>
      <ChipRow>
        <Chip label="Turn left" symbol="↺" accessibilityLabel="Turn left 15 degrees" onPress={() => act.rotate(-15)} disabled={locked} />
        <Chip label="Turn right" symbol="↻" accessibilityLabel="Turn right 15 degrees" onPress={() => act.rotate(15)} disabled={locked} />
        <Chip label="Smaller" symbol="−" onPress={() => act.resize(1 / 1.12)} disabled={locked} />
        <Chip label="Larger" symbol="+" onPress={() => act.resize(1.12)} disabled={locked} />
        <Chip label="Flip" symbol="⇋" onPress={act.flip} disabled={locked} />
      </ChipRow>

      <Text style={type.eyebrow}>Layer</Text>
      <ChipRow>
        <Chip label="To front" symbol="⤒" onPress={() => act.layer('front')} />
        <Chip label="Forward" symbol="↑" onPress={() => act.layer('forward')} />
        <Chip label="Backward" symbol="↓" onPress={() => act.layer('backward')} />
        <Chip label="To back" symbol="⤓" onPress={() => act.layer('back')} />
      </ChipRow>

      <Text style={type.eyebrow}>More</Text>
      <ChipRow>
        <Chip label={locked ? 'Unlock' : 'Lock'} symbol="⚿" onPress={act.lock} active={locked} />
        <Chip label="Glow" symbol="✦" onPress={act.glow} active={glowing} />
        <Chip label="Duplicate" symbol="⧉" onPress={act.duplicate} />
        {confirmRemove ? (
          <>
            <Chip label="Remove from altar" tone="danger" onPress={act.remove} />
            <Chip label="Keep" onPress={() => setConfirmRemove(false)} />
          </>
        ) : (
          <Chip label="Remove" tone="danger" onPress={() => setConfirmRemove(true)} />
        )}
      </ChipRow>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },
  headerButton: { width: touch, height: touch, alignItems: 'center', justifyContent: 'center' },
  back: { color: colors.gold, fontSize: 34, lineHeight: 36, fontFamily: fonts.display },
  headerText: { flex: 1 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28, color: colors.cream },
  stageWrap: { paddingHorizontal: 12, alignItems: 'center' },
  panel: { flex: 1 },
  panelContent: { paddingHorizontal: space.gutter, paddingTop: 16, paddingBottom: 32, gap: 14 },
  section: { gap: 14 },
  objectHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  notice: { color: colors.gold, textAlign: 'center' },
  danger: { marginTop: 8 },
  centered: { flex: 1, justifyContent: 'center', padding: space.gutter, gap: 14 },
});
