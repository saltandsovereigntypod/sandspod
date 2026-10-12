import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AboutSheet } from '../../../components/altar/AboutSheet';
import { AltarStage, clampViewport, type Viewport } from '../../../components/altar/AltarStage';
import { CabinetSheet } from '../../../components/altar/CabinetSheet';
import { CarveSheet } from '../../../components/altar/CarveSheet';
import { GroupGrimoireSheet, GroupSheet, RenameSheet } from '../../../components/altar/ArrangeSheets';
import { PracticeSheet } from '../../../components/altar/PracticeSheet';
import { CrystalSheet, DeitySheet, type CrystalMode, type DeityMode } from '../../../components/altar/DevotionSheets';
import { careForCrystal, dedicateCrystal, recordOffering, setPresenceReason, updateOffering } from '../../../lib/altar/devotion';
import { CustomItemSheet } from '../../../components/altar/CustomItemSheet';
import { ApothecaryEditor, ApothecarySheet, type ApothecaryTarget, type SavedWorking } from '../../../components/altar/Apothecary';
import { TendSheet } from '../../../components/altar/TendSheet';
import { useWorkshop } from '../../../lib/altar/workshop';
import { Chip, ChipRow } from '../../../components/altar/Chip';
import { BackgroundSheet, DressSheet, LayersSheet, SaveSheet } from '../../../components/altar/OptionSheets';
import { Button } from '../../../components/Button';
import { burnDuration, burnedSoFar, dressingNames, glanceLine, resolveAltarEntry } from '../../../lib/altar/companion';
import { builtInCabinet, defaultAltarBackground, objectFromForm, shortLabel } from '../../../lib/altar/cabinet';
import {
  addObject,
  placeApothecary,
  refreshApothecary,
  removeApothecary,
  replaceWithApothecary,
  tendApothecary,
  carveObject,
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
  updateObjects,
  clearAltar,
  groupName,
  groupObjects,
  lightAll,
  renameObject,
  snuffAll,
  ungroup,
  toggleLock,
  uncarveObject,
  undressObject,
} from '../../../lib/altar/editor';
import { displayBox, STAGE_ASPECT } from '../../../lib/altar/geometry';
import { stackOrder } from '../../../lib/altar/layers';
import { apothecaryStateOf, carvingsOf, dressingsOf, isCandle, isLit, type ApothecaryState } from '../../../lib/altar/livingState';
import { addObjectInstanceEvent, getObjectInstance, updateObjectInstance, useObjectInstance } from '../../../lib/altar/instanceStore';
import {
  ACTIVITY_TYPES,
  activityRecord,
  instanceTendState,
  instanceTendUpdates,
  isCrafted,
  tendChoices,
  tendRecord,
  type PracticeActivity,
  type TendInput,
} from '../../../lib/altar/instances';
import { altarRitualItem, groupAltarItems } from '../../../lib/grimoire/altarImport';
import { useGrimoire } from '../../../lib/grimoire/store';
import { altarSummary, documentFromAltar, emptyDocument, type AltarDocument } from '../../../lib/altar/snapshot';
import { useAltars } from '../../../lib/altar/store';
import type { CabinetForm, CabinetItem } from '../../../lib/altar/types';
import { useLibrary } from '../../../lib/library';
import { useMySettings } from '../../../lib/settings/store';
import { tonightAltar } from '../../../lib/altar/tonight';
import { holidayChoice, holidaysToday } from '../../../lib/holidays';
import { moonState } from '../../../lib/moon';
import { colors, fonts, space, touch, type } from '../../../theme';

type SheetName =
  | 'about'
  | 'carve'
  | 'rename'
  | 'group'
  | 'apothecary'
  | 'tend'
  | 'practice'
  | 'grimoire'
  | 'cabinet'
  | 'background'
  | 'layers'
  | 'dress'
  | 'save'
  | null;

const nowIso = () => new Date().toISOString();

// iOS won't present one sheet while another is still sliding away, so the next waits for it.
const afterSheetCloses = (open: () => void) => setTimeout(open, Platform.OS === 'ios' ? 450 : 0);
const MAX_STAGE_WIDTH = 960;

export default function AltarEditor() {
  const { altarId, from } = useLocalSearchParams<{ altarId: string; from?: string }>();
  const store = useAltars();
  const { settings } = useMySettings();
  const { altars, draft, draftSourceId, status, backgrounds, overrides, signedIn } = store;

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
  const [confirmClear, setConfirmClear] = useState(false);
  const [crystalMode, setCrystalMode] = useState<CrystalMode | null>(null);
  const [deityMode, setDeityMode] = useState<DeityMode | null>(null);
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
    if (altarId === 'new') {
      // Settings → Default altar background, as the website sets the stage on a fresh altar page.
      if (!settings) return;
      const preset = defaultAltarBackground(settings.default_altar_background, backgrounds);
      const fresh = emptyDocument();
      return start(preset ? setBackground(fresh, preset.background, preset.name) : fresh, null, 'My Altar');
    }
    if (altarId === 'tonight') {
      const night = new Date();
      const tonight = tonightAltar(night, holidaysToday(night, holidayChoice(settings)), moonState(night).name);
      // Not marked unsaved, so a working draft you already have isn't replaced until you change something here.
      start(tonight.doc, null, 'Tonight’s Altar');
      setNotice(`Set for ${tonight.reason}. Move, swap or add anything, then Save to keep it.`);
      return;
    }
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
  }, [altarId, altars, backgrounds, draft, draftSourceId, status, settings]);

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
    const { id, outcome } = await store.save({ id: asNew ? null : sourceId, name: altarName, doc });
    await store.clearDraft();
    setBaseline(doc);
    setSourceId(id);
    setName(altarName.trim() || 'My Altar');
    loadedFor.current = id;
    router.setParams({ altarId: id });
    setSheet(null);
    if (!signedIn) setNotice('Saved on this device.');
    else if (outcome === 'saved') setNotice('Saved to your Sanctuary.');
    else if (outcome === 'pending') setNotice('Saved on this device. It will reach your Sanctuary when you’re back online.');
    else setNotice('Saved on this device, but your account didn’t accept it. See your altar list to try again.');
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

  // Your own items come from the workshop store, so the spell builder and apothecary see the same list.
  const workshop = useWorkshop();
  const allItems = useMemo(() => [...workshop.customItems, ...builtInCabinet], [workshop.customItems]);
  const [ownItem, setOwnItem] = useState<{ category: string; item: CabinetItem | null } | null>(null);
  const [working, setWorking] = useState<ApothecaryTarget | null>(null);

  const workingSaved = ({ item, isNew, fromAltar, replace }: SavedWorking) => {
    setWorking(null);
    if (replace) {
      commit((d) => replaceWithApothecary(d, fromAltar, item, nowIso()));
      setSelected(null);
      setNotice(`${item.name} is on your altar, in place of what went into it.`);
    } else if (isNew) {
      commit((d) => placeApothecary(d, item, nowIso()));
      setNotice(`${item.name} is saved to My Apothecary and on your altar.`);
    } else {
      commit((d) => refreshApothecary(d, item));
      setNotice(`${item.name} is updated.`);
    }
  };
  const selectedObject = doc && selected != null ? doc.objects[selected] ?? null : null;
  const selectedRecipe = selectedObject?.apothecaryItemId ? workshop.apothecary.find((a) => a.id === selectedObject.apothecaryItemId) ?? null : null;
  const { entries: libraryEntries } = useLibrary();
  const selectedEntry = useMemo(
    () => (selectedObject ? resolveAltarEntry(libraryEntries, selectedObject) : null),
    [libraryEntries, selectedObject],
  );

  // A made thing's tracked instance (signed in): its own, or its recipe's, as the Companion finds it.
  const selectedInstanceId = (signedIn && (selectedObject?.instanceId || selectedRecipe?.instanceId)) || '';
  const { instance: selectedInstance, events: instanceEvents, reload: reloadInstance } = useObjectInstance(workshop.userId, selectedInstanceId);
  const practiceChoices = useMemo(() => tendChoices(builtInCabinet, workshop.apothecary), [workshop.apothecary]);
  const crafted = isCrafted(selectedObject);
  const tendState = selectedObject && crafted ? (selectedInstance ? instanceTendState(apothecaryStateOf(selectedObject), selectedInstance) : apothecaryStateOf(selectedObject)) : null;

  /**
   * Activation, Remaining and Review (object-actions.js openCraftedAction):
   * with an instance, what's left and the dates are written to it; activation,
   * and everything for an object without one, stays in the object's own state.
   */
  const saveTending = async (change: Partial<ApothecaryState>) => {
    const index = selected;
    if (index == null) return;
    const userId = workshop.userId;
    const updates = selectedInstance && userId ? instanceTendUpdates(change) : null;
    const own: Partial<ApothecaryState> = updates ? ('activationState' in change ? { activationState: change.activationState } : {}) : change;
    if (Object.keys(own).length) commit((d) => tendApothecary(d, index, own, nowIso()));
    if (updates && selectedInstance && userId) {
      const updated = await updateObjectInstance(userId, selectedInstance.id, updates);
      if (!updated) setNotice('Couldn’t update this object’s tending dates. Please try again.');
      reloadInstance();
    }
  };

  /** Today's Tending (submitLivingStateTendForm): a "tended" event and the next tending date. */
  const recordTending = async (input: TendInput) => {
    const userId = workshop.userId;
    const current = userId && selectedInstanceId ? await getObjectInstance(userId, selectedInstanceId) : null;
    if (!userId || !current) {
      setNotice('Living State could not be loaded.');
      return false;
    }
    const { event, updates } = tendRecord(current, input, new Date());
    const saved = await addObjectInstanceEvent(userId, current, event);
    await updateObjectInstance(userId, current.id, updates);
    reloadInstance();
    setNotice(saved ? 'Living State updated.' : 'Couldn’t record that tending. Please try again.');
    return !!saved;
  };

  /** Charge, Perform Ritual or Journal (submitLivingStateActivityForm). */
  const recordActivity = async (kind: Exclude<PracticeActivity, 'tend'>, options: string[], notes: string) => {
    const userId = workshop.userId;
    const saved = userId && selectedInstanceId ? await addObjectInstanceEvent(userId, selectedInstanceId, activityRecord(kind, options, notes)) : null;
    reloadInstance();
    setNotice(saved ? `${ACTIVITY_TYPES[kind].title} saved.` : 'Couldn’t save that. Please try again.');
    return !!saved;
  };

  // Send a group to the Grimoire as a ritual page (groups.js sendCurrentGroupToGrimoire).
  const grimoire = useGrimoire();
  const groupItems = useMemo(
    () =>
      doc && selectedObject?.groupId
        ? doc.objects.filter((o) => o.groupId === selectedObject.groupId).map((o) => altarRitualItem(o, dressingsOf(o)))
        : [],
    [doc, selectedObject],
  );
  const createRitualPage = (purpose: string) => {
    if (!doc || !groupItems.length) return;
    const pageId = grimoire.actions.createRitualFromAltar({ title: groupName(doc, selectedObject), purpose, items: groupItems });
    setSheet(null);
    if (!pageId) {
      setNotice('Your Grimoire hasn’t loaded yet. Open it once while online, then try again.');
      return;
    }
    router.push({ pathname: '/grimoire/edit/[pageId]', params: { pageId } });
  };

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
          onPress={() => (from === 'today' ? router.navigate('/today') : router.canGoBack() ? router.back() : router.replace('/altar'))}
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
            objectLabel={shortLabel(selectedObject.label)}
            object={selectedObject}
            glance={selectedEntry ? glanceLine(selectedEntry, settings) : ''}
            group={groupName(doc, selectedObject)}
            crafted={crafted}
            canPractice={!!selectedInstanceId}
            onAbout={() => setSheet('about')}
            onDone={() => setSelected(null)}
            act={{
              light: () => commit((d) => toggleLight(d, selected, nowIso())),
              rename: () => setSheet('rename'),
              crystal: (mode) => setCrystalMode(mode),
              deity: (mode) => setDeityMode(mode),
              ungroup: () => {
                if (selectedObject.groupId) commit((d) => ungroup(d, selectedObject.groupId!));
              },
              dress: () => setSheet('dress'),
              carve: () => setSheet('carve'),
              tend: () => setSheet('tend'),
              practice: () => setSheet('practice'),
              grimoire: () => setSheet('grimoire'),
              recipe: () => setWorking(selectedRecipe ? { item: selectedRecipe } : null),
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
              <Chip label="Apothecary" symbol="⚗" accessibilityLabel="My Apothecary" onPress={() => setSheet('apothecary')} />
              <Chip label="Undo" symbol="↶" onPress={() => stepHistory(undo, redo)} disabled={undo.current.length === 0} />
              <Chip label="Redo" symbol="↷" onPress={() => stepHistory(redo, undo)} disabled={redo.current.length === 0} />
              <Chip label="Zoom in" symbol="+" onPress={() => zoomBy(1.5)} disabled={viewport.zoom >= 4} />
              <Chip label="Zoom out" symbol="−" onPress={() => zoomBy(1 / 1.5)} disabled={viewport.zoom <= 1} />
            </ChipRow>
            {(doc.objects.some(isCandle) || doc.objects.length > 1) && (
              <ChipRow>
                {doc.objects.some((o) => isCandle(o) && !isLit(o)) && (
                  <Chip label="Light all candles" symbol="✺" onPress={() => commit((d) => lightAll(d, nowIso()))} />
                )}
                {doc.objects.some(isLit) && <Chip label="Snuff all" symbol="◌" onPress={() => commit((d) => snuffAll(d, nowIso()))} />}
                {doc.objects.length > 1 && <Chip label="Group" symbol="⊕" onPress={() => setSheet('group')} />}
              </ChipRow>
            )}
            <Text style={type.caption}>
              {altarSummary(doc)}. Tap something on the altar to tend it. Drag to move it, pinch to resize and twist to
              turn it.{viewport.zoom > 1 ? ' Drag an empty spot to look around.' : ''}
            </Text>
            {doc.objects.length > 0 && (
              <ChipRow>
                {confirmClear ? (
                  <>
                    <Chip
                      label="Take everything off"
                      tone="danger"
                      onPress={() => {
                        commit((d) => clearAltar(d));
                        setConfirmClear(false);
                      }}
                    />
                    <Chip label="Keep it" onPress={() => setConfirmClear(false)} />
                  </>
                ) : (
                  <Chip label="Clear altar" tone="danger" onPress={() => setConfirmClear(true)} />
                )}
              </ChipRow>
            )}
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
          <AboutSheet
            visible={sheet === 'about'}
            object={selectedObject}
            label={shortLabel(selectedObject?.label)}
            entry={selectedEntry}
            instance={selectedInstance}
            instanceEvents={instanceEvents}
            onClose={() => setSheet(null)}
          />
          <ApothecarySheet
            visible={sheet === 'apothecary'}
            onClose={() => setSheet(null)}
            onMake={() => {
              setSheet(null);
              afterSheetCloses(() => setWorking({ item: null }));
            }}
            onEdit={(item) => {
              setSheet(null);
              afterSheetCloses(() => setWorking({ item }));
            }}
            onPlace={(item) => {
              commit((d) => placeApothecary(d, item, nowIso()));
              setSheet(null);
            }}
          />
          <ApothecaryEditor
            target={working}
            altarObjects={doc.objects}
            onClose={() => setWorking(null)}
            onSaved={workingSaved}
            onDeleted={(item) => {
              setWorking(null);
              setSelected(null);
              commit((d) => removeApothecary(d, item.id));
              setNotice(`${item.name} is deleted from My Apothecary.`);
            }}
          />
          <TendSheet
            visible={sheet === 'tend'}
            name={shortLabel(selectedObject?.label, 'Working')}
            state={tendState}
            intervalDays={Number(selectedInstance?.tending_interval_days) || selectedRecipe?.livingState.tending_interval_days || 30}
            onClose={() => setSheet(null)}
            onSave={(change) => void saveTending(change)}
          />
          <PracticeSheet
            visible={sheet === 'practice' && !!selectedInstanceId}
            name={shortLabel(selectedObject?.label, 'Manifestation')}
            choices={practiceChoices}
            onClose={() => setSheet(null)}
            onTend={recordTending}
            onActivity={recordActivity}
          />
          <GroupGrimoireSheet
            visible={sheet === 'grimoire' && groupItems.length > 0}
            name={groupName(doc, selectedObject)}
            items={groupAltarItems(groupItems)}
            signedIn={signedIn}
            onClose={() => setSheet(null)}
            onCreate={createRitualPage}
          />
          <CustomItemSheet
            target={ownItem}
            onClose={() => {
              setOwnItem(null);
              afterSheetCloses(() => setSheet('cabinet'));
            }}
          />
          <CrystalSheet
            mode={crystalMode}
            index={selected}
            objects={doc.objects}
            onClose={() => setCrystalMode(null)}
            onCare={(indices, kind, input) => {
              commit((d) => updateObjects(d, indices, (o) => careForCrystal(o, kind, input, nowIso())));
              setCrystalMode(null);
              setNotice(`${kind === 'cleanse' ? 'Cleansed' : 'Charged'}${indices.length > 1 ? ` ${indices.length} crystals` : ''}.`);
            }}
            onDedicate={(index, input) => {
              commit((d) => updateObjects(d, [index], (o) => dedicateCrystal(o, input, nowIso())));
              setCrystalMode(null);
              setNotice('Dedication saved.');
            }}
          />
          <DeitySheet
            mode={deityMode}
            index={selected}
            objects={doc.objects}
            onClose={() => setDeityMode(null)}
            onOffer={(index, input) => {
              commit((d) => updateObjects(d, [index], (o) => recordOffering(o, input, nowIso())));
              setDeityMode(null);
              setNotice('Offering recorded.');
            }}
            onUpdate={(index, id, input) => {
              commit((d) => updateObjects(d, [index], (o) => updateOffering(o, id, input, nowIso())));
              setDeityMode(null);
              setNotice('Offering updated.');
            }}
            onReason={(index, reason, notes) => {
              commit((d) => updateObjects(d, [index], (o) => setPresenceReason(o, reason, notes, nowIso())));
              setDeityMode(null);
            }}
          />
          <RenameSheet
            visible={sheet === 'rename'}
            label={shortLabel(selectedObject?.label)}
            onClose={() => setSheet(null)}
            onRename={(label) => {
              if (selected != null) commit((d) => renameObject(d, selected, label));
              setSheet(null);
            }}
          />
          <GroupSheet
            visible={sheet === 'group'}
            objects={doc.objects}
            onClose={() => setSheet(null)}
            onGroup={(indices, name) => {
              commit((d) => groupObjects(d, indices, name, nowIso()));
              setSheet(null);
              setNotice('Grouped. They move together now.');
            }}
          />
          <CarveSheet
            visible={sheet === 'carve'}
            candle={shortLabel(selectedObject?.label, 'Candle')}
            carvings={selectedObject ? carvingsOf(selectedObject) : []}
            onClose={() => setSheet(null)}
            onCarve={(text) => {
              if (selected != null) commit((d) => carveObject(d, selected, text, nowIso()));
            }}
            onSmooth={(index) => {
              if (selected != null) commit((d) => uncarveObject(d, selected, nowIso(), index));
            }}
          />
          <CabinetSheet
            visible={sheet === 'cabinet'}
            items={allItems}
            overrides={overrides}
            library={libraryEntries}
            onMakeOwn={(category) => {
              setSheet(null);
              afterSheetCloses(() => setOwnItem({ category, item: null }));
            }}
            onEditOwn={(item) => {
              setSheet(null);
              afterSheetCloses(() => setOwnItem({ category: item.category, item }));
            }}
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
  rename: () => void;
  ungroup: () => void;
  crystal: (mode: CrystalMode) => void;
  deity: (mode: DeityMode) => void;
  dress: () => void;
  carve: () => void;
  tend: () => void;
  practice: () => void;
  grimoire: () => void;
  recipe: () => void;
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
  glance,
  group,
  crafted,
  canPractice,
  act,
  onAbout,
  onDone,
}: {
  group: string;
  crafted: boolean;
  canPractice: boolean;
  object: import('../../../lib/altar/types').SavedObject;
  objectLabel: string;
  glance: string;
  act: Actions;
  onAbout: () => void;
  onDone: () => void;
}) {
  const candle = isCandle(object);
  const lit = isLit(object);
  const locked = object.locked === 'true';
  const glowing = object.glowing === 'true';
  const dressings = candle ? dressingsOf(object) : [];
  const carvings = candle ? carvingsOf(object) : [];
  const [now, setNow] = useState(() => new Date());
  // A lit candle's burning time counts up, as on the website.
  useEffect(() => {
    if (!lit) return;
    const timer = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(timer);
  }, [lit]);
  const burned = candle ? burnedSoFar(object, now) : 0;
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <View style={styles.section}>
      <View style={styles.objectHead}>
        <View style={{ flex: 1 }}>
          <Text style={type.eyebrow}>{locked ? 'Locked in place' : lit ? 'Burning' : 'Selected'}</Text>
          <Text style={type.cardTitle}>{objectLabel}</Text>
          {!!glance && <Text style={styles.glance}>{glance}</Text>}
          {!!group && <Text style={type.caption}>{`In the group “${group}”`}</Text>}
          {candle && (burned > 0 || lit || dressings.length > 0 || carvings.length > 0) && (
            <Text style={type.caption}>
              {[
                lit ? `Burning time ${burnDuration(burned)}` : burned > 0 ? `Burned ${burnDuration(burned)} in all` : null,
                dressings.length ? `Dressed with ${dressingNames(dressings).join(', ')}` : null,
                carvings.length ? `Carved with ${carvings.map((c) => `“${c.text}”`).join(', ')}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          )}
        </View>
        <Button label="Done" variant="text" onPress={onDone} accessibilityHint="Deselects this object" />
      </View>

      <ChipRow>
        <Chip label="About" symbol="☽" accessibilityLabel={`About ${objectLabel}`} onPress={onAbout} />
        {crafted && <Chip label="Tend" symbol="✓" accessibilityLabel={`Tend ${objectLabel}`} onPress={act.tend} />}
        {canPractice && <Chip label="Begin Practice" symbol="✧" accessibilityLabel={`Begin today’s practice with ${objectLabel}`} onPress={act.practice} />}
        {object.type === 'apothecary' && !!object.apothecaryItemId && (
          <Chip label="Recipe" symbol="✎" accessibilityLabel={`Open the recipe for ${objectLabel}`} onPress={act.recipe} />
        )}
      </ChipRow>

      {object.type === 'crystal' && (
        <ChipRow>
          <Chip label="Cleanse" symbol="☾" onPress={() => act.crystal('cleanse')} />
          <Chip label="Charge" symbol="✦" onPress={() => act.crystal('charge')} />
          <Chip label="Dedicate" symbol="♡" onPress={() => act.crystal('dedicate')} />
        </ChipRow>
      )}
      {object.type === 'deity' && (
        <ChipRow>
          <Chip label="Offering" symbol="❀" onPress={() => act.deity('offering')} />
          <Chip label="Reason for presence" symbol="☉" onPress={() => act.deity('reason')} />
        </ChipRow>
      )}

      {candle && (
        <>
          <Button label={lit ? 'Snuff the candle' : 'Light the candle'} onPress={act.light} />
          <ChipRow>
            <Chip label="Dress" symbol="❦" onPress={act.dress} />
            <Chip label="Carve" symbol="✎" onPress={act.carve} />
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
        <Chip label="Rename" symbol="✎" onPress={act.rename} />
        {!!group && <Chip label="Send group to Grimoire" symbol="❧" onPress={act.grimoire} />}
        {!!group && <Chip label="Ungroup" symbol="⊘" onPress={act.ungroup} />}
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
  glance: { fontFamily: fonts.displayItalic, fontSize: 17, lineHeight: 22, color: colors.parchment },
  notice: { color: colors.gold, textAlign: 'center' },
  danger: { marginTop: 8 },
  centered: { flex: 1, justifyContent: 'center', padding: space.gutter, gap: 14 },
});
