import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AboutSheet } from '../../../components/altar/AboutSheet';
import { AltarStage, clampViewport, type AgingLooks, type ChargeGlows, type StageMoment, type StageSky, type Viewport } from '../../../components/altar/AltarStage';
import { MoreSheet, type MoreAction } from '../../../components/altar/MoreSheet';
import { AltarHistorySheet, useAltarSnapshots } from '../../../components/altar/connect/AltarHistorySheet';
import { AltarRitualOverlay } from '../../../components/altar/connect/AltarRitualOverlay';
import { AncestorPanelSection, AncestorShrineSheet } from '../../../components/altar/connect/AncestorSheets';
import { RitualPickerSheet, useBeginOnAltar } from '../../../components/altar/connect/BeginOnAltar';
import type { AltarRef } from '../../../components/altar/connect/common';
import { GrimoireLinkSheet, GrimoirePageLink } from '../../../components/altar/connect/GrimoireLink';
import { PlantPanelSection, PlantSheet, ReadingPanelSection, ReadingSheet, StonePanelSection, StoneSheet } from '../../../components/altar/connect/PracticeSheets';
import { ShareAltarSheet } from '../../../components/altar/connect/ShareAltarSheet';
import { withoutPageLink, withPageLink } from '../../../lib/altar/connect/grimoire';
import { stoneIdOf } from '../../../lib/altar/connect/practice';
import { applyAltarEffect, type AltarEffect } from '../../../lib/altar/connect/ritual';
import { lastAltarCareOf, ritualOrigin, runsOnAltar, withDraftClosing, type RitualSource } from '../../../lib/altar/connect/ritualStart';
import type { TemplateDraft } from '../../../lib/rituals/types';
import { AltarReadingSheet } from '../../../components/altar/workings/AltarReadingSheet';
import type { AltarContext } from '../../../components/altar/workings/common';
import { DressingSheet } from '../../../components/altar/workings/DressingSheet';
import { GratitudeSheet } from '../../../components/altar/workings/GratitudeSheet';
import { IntentionSheet, useAltarIntention } from '../../../components/altar/workings/IntentionSheet';
import { LayoutSheet } from '../../../components/altar/workings/LayoutSheet';
import { SachetFeedSheet, SachetSheet } from '../../../components/altar/workings/SachetSheet';
import { ScryingScreen } from '../../../components/altar/workings/ScryingScreen';
import { JarRenewSheet, SpellJarSheet, type PlacedWorking } from '../../../components/altar/workings/SpellJarSheet';
import { SpellTimerSheet } from '../../../components/altar/workings/SpellTimerSheet';
import { TonightExplainedSheet } from '../../../components/altar/workings/TonightExplainedSheet';
import { mirrorPair, mirrorPartner, snapToMeaning, type Snap } from '../../../lib/altar/arrange';
import { attunementOf } from '../../../lib/altar/attunement';
import { chargeDetail, chargeLine, chargeOf, MOMENT_MS, MOMENT_WORDS, momentFor, recordCharge, recordCleanse } from '../../../lib/altar/charge';
import { applyMoves, placementWisdom } from '../../../lib/altar/reading/layouts';
import { tonightTheme, whyThisPiece } from '../../../lib/altar/reading/tonightExplained';
import { deityRelationship } from '../../../lib/altar/relationship';
import type { TonightAltar } from '../../../lib/altar/tonight';
import { nightCandle, waxLook } from '../../../lib/altar/wax';
import { feedingDue, feedingLine, sachetStateOf } from '../../../lib/altar/workings/sachet';
import { daysSinceRenewal, jarStateOf } from '../../../lib/altar/workings/spellJar';
import { SPELLS_COLLECTION, spellToday, tickSpell, type SpellEntry } from '../../../lib/altar/workings/spells';
import { AltarOptionsSheet, FlameReadingSheet, IncenseSheet, OfferingSheet } from '../../../components/altar/LivingSheets';
import { PetitionBoxSheet, WritePetitionSheet } from '../../../components/altar/PetitionSheets';
import { ALTAR_OPTIONS, altarOptionsFor, defaultAltarOptions, type AltarOptions } from '../../../lib/altar/altarOptions';
import { ambientAt, moonMirrored, nextAmbientCheck } from '../../../lib/altar/ambient';
import { burnToRead, lastBurn, linkReadingJournal, readingsOf, readingText, recordReading, remnantOf, setRemnant, type ReadingInput } from '../../../lib/altar/ceromancy';
import { clearAsh, incenseFormOf, incenseLife, isIncense, lightIncense, putOutIncense, setIncenseForm, setIncenseLength } from '../../../lib/altar/incense';
import { moonChargesOf } from '../../../lib/altar/moonCharge';
import {
  agingDeityOffering,
  agingLook,
  canHoldOffering,
  endOffering,
  FRESHNESS_WORDS,
  freshnessLine,
  holdsOfferings,
  offeringFreshness,
  offeringKind,
  offeringOf,
  refreshOffering,
  setOffering,
  type OfferingEnd,
} from '../../../lib/altar/offerings';
import {
  finishPetition,
  isPetitionPaper,
  newPetition,
  petitionBox,
  petitionEntryOf,
  petitionObject,
  PETITIONS,
  releaseNights,
  schedulePetition,
  type Petition,
  type PetitionEnd,
} from '../../../lib/altar/petitions';
import { storyLines, storySummary } from '../../../lib/altar/story';
import { logAppEvent } from '../../../lib/altar/livingState';
import { addEntry, updateEntry, useCraft, type CraftEntry } from '../../../lib/craft/store';
import { usePlace } from '../../../lib/location';
import { blankAnswers } from '../../../lib/rituals/lifecycle';
import { saveJournal, startRitual, updateActive, useRituals } from '../../../lib/rituals/store';
import { CabinetSheet } from '../../../components/altar/CabinetSheet';
import { CarveSheet } from '../../../components/altar/CarveSheet';
import { CloseUpSheet } from '../../../components/altar/CloseUpSheet';
import { GroupGrimoireSheet, GroupSheet, RenameSheet } from '../../../components/altar/ArrangeSheets';
import { PracticeSheet } from '../../../components/altar/PracticeSheet';
import { CrystalSheet, DeitySheet, type CrystalMode, type DeityMode } from '../../../components/altar/DevotionSheets';
import { careForCrystal, dedicateCrystal, humanize, offeringsOf, recordOffering, setDefaultCleansing, setDefaultOffering, setPresenceReason, updateOffering } from '../../../lib/altar/devotion';
import { CustomItemSheet } from '../../../components/altar/CustomItemSheet';
import { ApothecaryEditor, ApothecarySheet, type ApothecaryTarget, type SavedWorking } from '../../../components/altar/Apothecary';
import { TendSheet } from '../../../components/altar/TendSheet';
import { saveTendingBlend, useWorkshop } from '../../../lib/altar/workshop';
import { newId } from '../../../lib/altar/uid';
import { Chip, ChipRow } from '../../../components/altar/Chip';
import { WidgetSheet } from '../../../components/altar/WidgetSheet';
import { BackgroundSheet, DressSheet, LayersSheet, SaveSheet } from '../../../components/altar/OptionSheets';
import { Button } from '../../../components/Button';
import { burnDuration, burnedSoFar, dressingNames, glanceLine, lifeDuration, resolveAltarEntry } from '../../../lib/altar/companion';
import { CandleLifeSheet } from '../../../components/altar/CandleLifeSheet';
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
  freshCandleAt,
  nextBurnout,
  setCandleLifeAt,
  settleAltar,
  settleCandles,
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
import { apothecaryStateOf, CANDLE_LIFE, candleLife, carvingsOf, dressingsOf, isCandle, isLit, type ApothecaryState } from '../../../lib/altar/livingState';
import { addObjectInstanceEvent, getObjectInstance, updateObjectInstance, useObjectInstance } from '../../../lib/altar/instanceStore';
import {
  ACTIVITY_TYPES,
  activityRecord,
  instanceTendState,
  instanceTendUpdates,
  isCrafted,
  tendChoices,
  tendingBlendItem,
  tendRecord,
  type PracticeActivity,
  type TendInput,
} from '../../../lib/altar/instances';
import { altarRitualItem, groupAltarItems, type WorkingDetails } from '../../../lib/grimoire/altarImport';
import { useGrimoire } from '../../../lib/grimoire/store';
import { altarSummary, documentFromAltar, emptyDocument, ritualAltarSnapshot, type AltarDocument } from '../../../lib/altar/snapshot';
import { useAltars } from '../../../lib/altar/store';
import type { CabinetForm, CabinetItem } from '../../../lib/altar/types';
import { useLibrary } from '../../../lib/library';
import { setAltarFullScreen } from '../../../lib/altarFullScreen';
import { canTurnScreen, turnScreen } from '../../../lib/screenOrientation';
import { useMySettings } from '../../../lib/settings/store';
import { shrineAltar, tonightAltar } from '../../../lib/altar/tonight';
import { TRADITIONAL_LIBRARY } from '../../../lib/library/traditionalData';
import { holidayChoice, holidaysToday } from '../../../lib/holidays';
import { moonState } from '../../../lib/moon';
import { colors, fonts, space, touch, type } from '../../../theme';

type SheetName =
  | 'about'
  | 'closer'
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
  | 'widget'
  | 'length'
  | 'reading'
  | 'offering'
  | 'incense'
  | 'petition'
  | 'petitions'
  | 'options'
  | 'more-workings'
  | 'more-reading'
  | 'jar'
  | 'renew'
  | 'sachet'
  | 'feed'
  | 'anoint'
  | 'spell'
  | 'scry'
  | 'gratitude'
  | 'altarReading'
  | 'intention'
  | 'layouts'
  | 'tonight'
  | 'ritual'
  | 'ancestor'
  | 'stone'
  | 'plant'
  | 'drawn'
  | 'page'
  | 'share'
  | 'history'
  | null;

const nowIso = () => new Date().toISOString();
const newMoonFor = (entries: CraftEntry<AltarOptions>[], id: string | null) => (id ? altarOptionsFor(entries, id).options.newMoonCharging : false);

// iOS won't present one sheet while another is still sliding away, so the next waits for it.
const afterSheetCloses = (open: () => void) => setTimeout(open, Platform.OS === 'ios' ? 450 : 0);
const MAX_STAGE_WIDTH = 960;

export default function AltarEditor() {
  const { altarId, from, deity } = useLocalSearchParams<{ altarId: string; from?: string; deity?: string }>();
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
  const [justSaved, setJustSaved] = useState(false);
  // The altar set by "Tonight's altar", while it's open: why each piece is there, and swaps.
  const [tonight, setTonight] = useState<{ altar: TonightAltar; date: Date } | null>(null);
  // The spell timer opened from one object.
  const [spellWith, setSpellWith] = useState<{ uid: string; label: string } | null>(null);
  // A cleansing or charge playing out on the stage, and where a dragged object is settling.
  const [moment, setMoment] = useState<StageMoment | null>(null);
  const [guide, setGuide] = useState<Snap | null>(null);
  const guideRef = useRef<Snap | null>(null);
  // Full screen: the altar turned sideways to fill the phone, its tools in a drawer.
  const [full, setFull] = useState(false);
  const [tools, setTools] = useState(false);
  const win = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const undo = useRef<AltarDocument[]>([]);
  const redo = useRef<AltarDocument[]>([]);
  const loadedFor = useRef<string | null>(null);

  // This altar's own options (sky, moon window, New Moon charging), kept per altar in the craft store.
  const { entries: optionEntries } = useCraft<AltarOptions>(ALTAR_OPTIONS);
  const [unsavedOptions, setUnsavedOptions] = useState<AltarOptions>(() => defaultAltarOptions(''));

  // Open the requested altar once its data is available.
  useEffect(() => {
    if (!altarId || loadedFor.current === altarId) return;
    const start = (source: AltarDocument, id: string | null, altarName: string) => {
      // Candles and incense that burned down while the altar was closed are out when it opens,
      // and crystals that sat through a Full Moon are charged under it.
      const prepared = settleAltar(prepareDocument(source, nowIso()), nowIso(), { newMoon: newMoonFor(optionEntries, id) });
      loadedFor.current = altarId;
      setDoc(prepared);
      setBaseline(prepared);
      setSourceId(id);
      setName(altarName);
      setSelected(null);
      setMissing(false);
      setTonight(null);
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
      setTonight({ altar: tonight, date: night });
      setNotice(`Set for ${tonight.reason}. Move, swap or add anything, then Save to keep it.`);
      return;
    }
    if (altarId === 'shrine' && deity) {
      // A starter shrine from the deity's Living Library entry.
      const record = ((TRADITIONAL_LIBRARY as Record<string, Record<string, unknown>>).deity?.[deity] ?? null) as Record<string, unknown> | null;
      const name = String(record?.DisplayName ?? deity);
      const shrine = shrineAltar(deity, name, record, new Date());
      start(shrine.doc, null, `${name}’s Shrine`);
      setNotice(`A shrine for ${name}, from their Living Library entry: their colours, plants and stones. Move, swap or add anything, then Save to keep it.`);
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
  }, [altarId, deity, altars, backgrounds, draft, draftSourceId, status, settings, optionEntries]);

  const dirty = !!doc && doc !== baseline;

  // Candles lit and offerings made from the home screen widget reach an open
  // altar that has no unsaved changes of its own.
  const saved = sourceId && altarId !== 'draft' ? altars.find((a) => a.id === sourceId) : undefined;
  const seenSaved = useRef(saved);
  useEffect(() => {
    if (!saved || saved === seenSaved.current) return;
    seenSaved.current = saved;
    if (dirty) return;
    const fresh = settleAltar(prepareDocument(documentFromAltar(saved), nowIso()), nowIso(), { newMoon: newMoonFor(optionEntries, sourceId) });
    if (JSON.stringify(fresh.objects) === JSON.stringify(doc?.objects)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the saved altar is outside state; this follows it
    setDoc(fresh);
    setBaseline(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the saved altar itself changes
  }, [saved]);

  // Keep a working draft like the website, so nothing is lost if you leave.
  const { saveDraft } = store;
  useEffect(() => {
    if (doc && dirty) saveDraft(doc, sourceId);
  }, [doc, dirty, sourceId, saveDraft]);

  const fullWidth = Math.floor(Math.min(win.width - insets.left - insets.right, win.height * STAGE_ASPECT));
  const stageWidth = full ? fullWidth : Math.min(containerWidth, MAX_STAGE_WIDTH);

  const enterFullScreen = (next: boolean) => {
    setViewport({ zoom: 1, offsetX: 0, offsetY: 0 });
    setTools(false);
    setFull(next);
  };
  useEffect(() => {
    if (!full) return;
    setAltarFullScreen(true);
    void turnScreen(true);
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      enterFullScreen(false);
      return true;
    });
    return () => {
      back.remove();
      setAltarFullScreen(false);
      void turnScreen(false);
    };
  }, [full]);
  // Leaving the altar (another tab, or back) always comes out of full screen.
  useFocusEffect(useCallback(() => () => setFull(false), []));

  // Edits go through a ref so several in one gesture frame build on each other.
  const docRef = useRef<AltarDocument | null>(null);
  docRef.current = doc;

  // A lit candle burns down and goes out on its own while the altar is open.
  const [clock, setClock] = useState(0);
  useEffect(() => {
    if (!doc) return;
    const next = nextBurnout(doc);
    if (next == null) return;
    const timer = setTimeout(
      () => {
        const current = docRef.current;
        if (!current) return;
        const settled = settleCandles(current, nowIso());
        if (settled === current) return setClock((c) => c + 1);
        const out = current.objects.filter((o, i) => isLit(o) && !isLit(settled.objects[i])).map((o) => shortLabel(o.label, 'Candle'));
        const ash = current.objects
          .filter((o, i) => isIncense(o) && incenseLife(o).lit && incenseLife(settled.objects[i]).ash)
          .map((o) => shortLabel(o.label, 'Incense'));
        docRef.current = settled;
        setDoc(settled);
        // Going out isn't an edit of yours: a saved altar stays saved (it's saved for you in the background).
        setBaseline((b) => (b === current ? settled : b));
        setNotice(
          [
            out.length ? `${out.join(' and ')} burned down and went out. Tap ${out.length > 1 ? 'one' : 'it'} to read how it burned.` : '',
            ash.length ? `${ash.join(' and ')} burned down to ash.` : '',
          ]
            .filter(Boolean)
            .join(' '),
        );
      },
      Math.min(Math.max(0, next - Date.now()) + 250, 6 * 60 * 60 * 1000),
    );
    return () => clearTimeout(timer);
  }, [doc, clock]);

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

  /** The middle of what's in view, in stage fractions: where new things are set down. */
  const viewCenter = () => {
    const zoomedWidth = stageWidth * viewport.zoom;
    return zoomedWidth
      ? {
          cx: (viewport.offsetX + stageWidth / 2) / zoomedWidth,
          cy: (viewport.offsetY + stageWidth / STAGE_ASPECT / 2) / (zoomedWidth / STAGE_ASPECT),
        }
      : { cx: 0.5, cy: 0.5 };
  };

  const place = (item: CabinetItem, form: CabinetForm) => {
    if (!doc) return;
    const object = objectFromForm(item, form, doc.objects, nowIso(), overrides, viewCenter());
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
    // The day's picture of the altar is kept once a save has gone through.
    setJustSaved(outcome !== 'failed');
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
    const now = new Date();
    // "Create a reusable blend": saved to My Apothecary first, so the tending can name it.
    const blend = tendingBlendItem(current, input, newId(), now);
    let savedBlend: Awaited<ReturnType<typeof saveTendingBlend>> | null = null;
    let blendFailed = false;
    if (blend) {
      try {
        savedBlend = await saveTendingBlend(userId, blend);
      } catch {
        blendFailed = true;
      }
    }
    const { event, updates } = tendRecord(current, input, now, savedBlend);
    const saved = await addObjectInstanceEvent(userId, current, event);
    await updateObjectInstance(userId, current.id, updates);
    reloadInstance();
    setNotice(
      !saved
        ? 'Couldn’t record that tending. Please try again.'
        : blendFailed
        ? 'Living State updated, but the blend couldn’t be saved to My Apothecary.'
        : savedBlend
        ? `Living State updated. ${savedBlend.name} is in My Apothecary.`
        : 'Living State updated.',
    );
    return !!saved;
  };

  /** Charge, Perform Ritual or Journal (submitLivingStateActivityForm). */
  const recordActivity = async (kind: Exclude<PracticeActivity, 'tend'>, options: string[], notes: string) => {
    const userId = workshop.userId;
    const uid = String(selectedObject?.altarObjectId || '');
    const saved = userId && selectedInstanceId ? await addObjectInstanceEvent(userId, selectedInstanceId, activityRecord(kind, options, notes)) : null;
    reloadInstance();
    setNotice(saved ? `${ACTIVITY_TYPES[kind].title} saved.` : 'Couldn’t save that. Please try again.');
    // The object on the altar remembers it too (its charge, and how often it's worked with), and the moment plays.
    const at = saved && uid ? indexOfId(uid) : -1;
    if (at >= 0) {
      const how = options.join(', ');
      const cleansing = kind === 'ritual' && options.some((o) => /cleans/i.test(o));
      if (kind === 'charge') {
        commit((d) => updateObjects(d, [at], (o) => recordCharge(o, how, nowIso())), false);
        playMoment([uid], options);
      } else if (kind === 'ritual') {
        commit((d) => updateObjects(d, [at], (o) => logAppEvent(cleansing ? recordCleanse(o, how, nowIso()) : o, { kind: 'ritual', text: how ? `Part of a ritual: ${how.toLowerCase()}.` : 'Part of a ritual.' }, nowIso())), false);
        if (cleansing) playMoment([uid], ['Smoke']);
      }
    }
    return !!saved;
  };

  /** Play a cleansing or charge on the stage, by method. */
  const playMoment = (uids: string[], methods: string[]) => {
    const kind = momentFor(methods);
    setMoment((m) => ({ uids: uids.filter(Boolean), kind, key: (m?.key ?? 0) + 1 }));
    return MOMENT_WORDS[kind];
  };
  useEffect(() => {
    if (!moment) return;
    const timer = setTimeout(() => setMoment(null), MOMENT_MS + 200);
    return () => clearTimeout(timer);
  }, [moment]);

  // Record a group, or with nothing selected the whole altar, in the Grimoire
  // as a ritual page (groups.js sendCurrentGroupToGrimoire / sendAltarToGrimoire).
  const grimoire = useGrimoire();
  const groupItems = useMemo(
    () =>
      !doc
        ? []
        : selectedObject?.groupId
          ? doc.objects.filter((o) => o.groupId === selectedObject.groupId).map((o) => altarRitualItem(o, dressingsOf(o)))
          : selectedObject
            ? []
            : doc.objects.map((o) => altarRitualItem(o, dressingsOf(o))),
    [doc, selectedObject],
  );
  const grimoireTitle = doc && selectedObject ? groupName(doc, selectedObject) : name;
  const createRitualPage = (details: WorkingDetails, title: string) => {
    if (!doc || !groupItems.length) return;
    const pageId = grimoire.actions.createRitualFromAltar({ title: title || grimoireTitle, purpose: details, items: groupItems });
    setSheet(null);
    if (!pageId) {
      setNotice('Your Grimoire hasn’t loaded yet. Open it once while online, then try again.');
      return;
    }
    router.push({ pathname: '/grimoire/edit/[pageId]', params: { pageId } });
  };

  // ── The altar that responds ──────────────────────────────────────────
  // A minute clock for offerings that age; the sky looks again around sunrise and sunset.
  const here = usePlace();
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const timer = setTimeout(() => setTick(Date.now()), Math.min(60_000, nextAmbientCheck(new Date(tick), here)));
    return () => clearTimeout(timer);
  }, [tick, here]);
  useFocusEffect(useCallback(() => setTick(Date.now()), []));

  const { options } = sourceId ? altarOptionsFor(optionEntries, sourceId) : { options: unsavedOptions };
  const changeOptions = (change: Partial<AltarOptions>) => {
    if (!sourceId) return setUnsavedOptions((o) => ({ ...o, ...change }));
    const { options: current, entryId } = altarOptionsFor(optionEntries, sourceId);
    const next = { ...current, ...change, altarId: sourceId };
    void (entryId ? updateEntry(ALTAR_OPTIONS, entryId, next) : addEntry(ALTAR_OPTIONS, next));
  };
  const minute = Math.floor(tick / 60_000);
  const sky = useMemo<StageSky | null>(() => {
    if (!options.sky && !options.moonWindow) return null;
    const at = new Date(minute * 60_000);
    const ambient = ambientAt(at, here);
    const moon = moonState(at);
    return {
      tint: options.sky ? ambient.tint : { color: 'transparent', opacity: 0 },
      accent: options.sky ? ambient.accent : { color: 'transparent', opacity: 0 },
      moon: options.moonWindow ? { illumination: moon.illumination, waxing: moon.waxing, mirrored: moonMirrored(here) } : null,
      label: [options.sky ? ambient.label : '', options.moonWindow ? `a ${moon.name.toLowerCase()} in the window` : ''].filter(Boolean).join('; '),
    };
  }, [options.sky, options.moonWindow, here, minute]);
  const aging = useMemo<AgingLooks>(() => {
    const looks: AgingLooks = {};
    for (const object of doc?.objects ?? []) {
      const fresh = offeringFreshness(object, minute * 60_000);
      if (fresh && fresh.level !== 'lasting' && object.altarObjectId) looks[object.altarObjectId] = agingLook(fresh.kind, fresh);
    }
    return looks;
  }, [doc, minute]);

  /** Change the selected object (found again by its id, in case the altar changed underneath). */
  const changeSelected = (change: (o: import('../../../lib/altar/types').SavedObject) => import('../../../lib/altar/types').SavedObject, recordUndo = true) => {
    if (selected == null) return;
    commit((d) => updateObjects(d, [selected], change), recordUndo);
  };
  const indexOfId = (id: string) => (docRef.current?.objects ?? []).findIndex((o) => o.altarObjectId === id);

  // How did it burn? Kept with the burn, and if you like in your ritual journal.
  const saveReading = async (input: ReadingInput, journal: boolean) => {
    if (selected == null || !selectedObject) return;
    const id = String(selectedObject.altarObjectId || '');
    const label = shortLabel(selectedObject.label, 'Candle');
    commit((d) => updateObjects(d, [selected], (o) => recordReading(o, input, nowIso())));
    setSheet(null);
    if (!journal) return setNotice('Reading kept with the candle. You’ll find it in its story.');
    const index = indexOfId(id);
    const reading = index >= 0 ? readingsOf(docRef.current!.objects[index]).slice(-1)[0] : null;
    try {
      const answers = blankAnswers(null, new Date());
      const carvings = carvingsOf(selectedObject).map((c) => c.text);
      const row = await saveJournal({
        session: null,
        answers: {
          ...answers,
          title: `Candle reading: ${label}`,
          intention: carvings.join(', '),
          signs_and_symbols: readingText(input),
          what_happened_during: lastBurn(selectedObject) ? `The candle burned for ${burnDuration(Number(lastBurn(selectedObject)?.durationMs) || 0)}.` : '',
        },
      });
      const at = indexOfId(id);
      if (reading && at >= 0) commit((d) => updateObjects(d, [at], (o) => linkReadingJournal(o, reading.id, row.id, nowIso())), false);
      setNotice('Reading kept with the candle and saved to your journal.');
    } catch {
      setNotice('Reading kept with the candle, but it couldn’t be saved to your journal. Please try again later.');
    }
  };

  // Offerings: refreshed, returned to nature or cleared away, each logged.
  const endSelectedOffering = (how: OfferingEnd) => {
    if (selected == null || !selectedObject) return;
    const contents = offeringOf(selectedObject);
    if (!contents) return;
    const what = contents.label || offeringKind(contents.kind)?.label.toLowerCase() || 'offering';
    if (holdsOfferings(selectedObject)) {
      commit((d) => updateObjects(d, [selected], (o) => endOffering(o, how, nowIso())));
      setNotice(how === 'returned' ? `Returned the ${what} to nature. The vessel is empty now.` : `Cleared away the ${what}.`);
      return;
    }
    // A sprig is the offering itself: it leaves the altar, and the altar's log remembers it.
    const name = shortLabel(selectedObject.label, 'Sprig');
    commit((d) => removeObject(d, selected));
    setSelected(null);
    logAltar(how === 'returned' ? `${name} was returned to nature.` : `${name} was cleared away.`);
    setNotice(how === 'returned' ? `${name} is returned to nature and off the altar.` : `${name} is cleared away.`);
  };
  const logAltar = (text: string) => {
    if (sourceId) void addEntry('altar.history', { altarId: sourceId, text, at: nowIso() });
  };
  const deityOffering = (action: 'refresh' | 'returned' | 'removed') => {
    if (selected == null || !selectedObject) return;
    const current = agingDeityOffering(offeringsOf(selectedObject, nowIso()), Date.now());
    if (!current) return;
    const { offering } = current;
    const status = action === 'refresh' ? 'Completed' : action === 'returned' ? 'Returned to nature' : 'Removed';
    changeSelected((o) => {
      const at = nowIso();
      const done = updateOffering(o, offering.id, {
        status,
        customStatus: '',
        response: offering.perceivedResponse ? humanize(offering.perceivedResponse) : '',
        responseNotes: offering.responseNotes || '',
        followUpNotes: action === 'refresh' ? 'Refreshed with a fresh offering.' : offering.followUpNotes || '',
        completedAt: at,
      }, at);
      if (action !== 'refresh') return done;
      const items = offering.items ?? [];
      return recordOffering(done, {
        types: offering.types ?? [],
        supports: items.filter((i) => !i.custom).map((i) => ({ id: String(i.id || i.label), label: i.label })),
        customItems: items.filter((i) => i.custom).map((i) => i.label).join(', '),
        intention: offering.intention || '',
        message: 'A fresh offering in place of the last.',
        status: 'Present on altar',
        customStatus: '',
        response: '',
        responseNotes: '',
        occurredAt: at,
      }, at);
    });
    setNotice(action === 'refresh' ? 'A fresh offering is set out.' : action === 'returned' ? 'The offering is returned to nature.' : 'The offering is cleared away.');
  };

  // Petitions: the box for this altar, synced with your account.
  const { entries: petitionEntries } = useCraft<Petition>(PETITIONS);
  const box = useMemo(() => petitionBox(petitionEntries, sourceId ?? ''), [petitionEntries, sourceId]);
  const openPetitions = () => {
    if (sourceId) return setSheet('petitions');
    setNotice('Save this altar first; its petition box is kept with it.');
    setSheet('save');
  };
  const writePetition = async (input: import('../../../lib/altar/petitions').PetitionInput, candleId: string | null) => {
    if (!sourceId || !docRef.current) return;
    setSheet(null);
    const now = new Date();
    const candleIndex = candleId ? indexOfId(candleId) : -1;
    const candle = candleIndex >= 0 ? docRef.current.objects[candleIndex] : null;
    const petition: Petition = { ...newPetition(sourceId, input, now), place: candle ? 'candle' : 'box', candleId: candle ? candleId! : '' };
    const entry = await addEntry(PETITIONS, petition, now);
    const paper = petitionObject(petition, entry.id, docRef.current.objects, now.toISOString(), candle);
    commit((d) => {
      const added = addObject(d, paper);
      const at = candle ? d.objects.indexOf(candle) : -1;
      return at >= 0 ? updateObjects(added, [at], (o) => logAppEvent(o, { kind: 'petition', text: `The petition “${petition.title}” was folded beneath it.` }, now.toISOString())) : added;
    });
    await updateEntry(PETITIONS, entry.id, { ...petition, objectId: paper.altarObjectId });
    setNotice(candle ? `“${petition.title}” is folded under ${shortLabel(candle.label, 'the candle')}.` : `“${petition.title}” is on the altar and in the petition box.`);
  };
  const finishPetitionEntry = (entry: CraftEntry<Petition>, how: PetitionEnd) => {
    const now = new Date();
    void updateEntry(PETITIONS, entry.id, finishPetition(entry.data, how, now));
    const words = how === 'burned' ? 'burned' : how === 'buried' ? 'buried' : 'released';
    // The paper leaves the altar; the candle it sat under remembers it.
    commit((d) => {
      let next = d;
      const candleAt = entry.data.candleId ? d.objects.findIndex((o) => o.altarObjectId === entry.data.candleId) : -1;
      if (candleAt >= 0) next = updateObjects(next, [candleAt], (o) => logAppEvent(o, { kind: 'petition', text: `The petition “${entry.data.title}” was ${words}.` }, now.toISOString()));
      const paperAt = next.objects.findIndex((o) => isPetitionPaper(o) && petitionEntryOf(o) === entry.id);
      return paperAt >= 0 ? removeObject(next, paperAt) : next;
    });
    setSelected(null);
    setNotice(`“${entry.data.title}” is ${words}. It stays in the box’s history.`);
  };

  // ── Workings, reading and arranging ──────────────────────────────────
  const altarCtx = useMemo<AltarContext | null>(
    () => (doc ? { id: sourceId ?? '', name, objects: doc.objects, background: doc.background } : null),
    [doc, sourceId, name],
  );
  const intention = useAltarIntention(sourceId ?? '');
  const { entries: spellEntries } = useCraft<SpellEntry>(SPELLS_COLLECTION);
  const selectedUid = String(selectedObject?.altarObjectId || '');
  const selectedSpells = useMemo(
    () => (sourceId && selectedUid ? spellEntries.filter((e) => e.data?.altarId === sourceId && e.data.objectUid === selectedUid && !e.data.closedAt) : []),
    [spellEntries, sourceId, selectedUid],
  );
  /** Open a sheet whose work is kept with the altar, once it's saved. */
  const openSaved = (next: SheetName, what: string) => {
    if (sourceId) return setSheet(next);
    setNotice(`Save this altar first; its ${what} is kept with it.`);
    setSheet('save');
  };
  const fromMore = (action: MoreAction) => {
    setSheet(null);
    afterSheetCloses(() => {
      if (action === 'jar') setSheet('jar');
      else if (action === 'sachet') setSheet('sachet');
      else if (action === 'spell') {
        setSpellWith(null);
        openSaved('spell', 'spell timer');
      } else if (action === 'scry') openSaved('scry', 'scrying');
      else if (action === 'gratitude') openSaved('gratitude', 'gratitude bowl');
      else if (action === 'read') setSheet('altarReading');
      else if (action === 'intention') openSaved('intention', 'intention');
      else if (action === 'layouts') setSheet('layouts');
      else if (action === 'tonight') setSheet('tonight');
      else if (action === 'ritual') openSaved('ritual', 'ritual');
      else if (action === 'ancestor' || action === 'stone' || action === 'plant' || action === 'drawn') setSheet(action);
    });
  };
  const placeWorking = ({ object }: PlacedWorking) => {
    const index = docRef.current?.objects.length ?? 0;
    commit((d) => addObject(d, object));
    setSelected(index);
    setSheet(null);
    setNotice(`${shortLabel(object.label, 'It')} is on your altar and saved to My Apothecary.`);
  };
  /** Tend today's step of a spell worked with an object (lighting its candle counts). */
  const tendSpell = (id: string, spell: SpellEntry, quiet = false) => {
    const now = new Date();
    if (spellToday(spell, now).status !== 'tend') return;
    const next = tickSpell(spell, now);
    if (next === spell) return;
    void updateEntry(SPELLS_COLLECTION, id, next);
    const today = spellToday(next, now);
    setNotice(`${quiet ? 'Lit for tonight. ' : ''}${today.label} of “${spell.title}” is tended.`);
  };
  const charges = useMemo<ChargeGlows>(() => {
    const glows: ChargeGlows = {};
    for (const object of doc?.objects ?? []) {
      const charge = object.altarObjectId ? chargeOf(object, minute * 60_000) : null;
      if (charge && charge.strength > 0) glows[String(object.altarObjectId)] = charge.strength;
    }
    return glows;
  }, [doc, minute]);
  const tonightNow = tonight && doc ? { ...tonight.altar, doc: { ...tonight.altar.doc, objects: doc.objects } } : null;
  const tonightWhy = useMemo(
    () => (tonight && selectedObject ? whyThisPiece(selectedObject, tonightTheme(tonight.altar, tonight.date), libraryEntries) : ''),
    [tonight, selectedObject, libraryEntries],
  );
  const wisdom = useMemo(() => (selectedObject ? placementWisdom(selectedObject, libraryEntries) : ''), [selectedObject, libraryEntries]);
  const canMirror = !!doc && selected != null && mirrorPartner(doc.objects, selected) != null;

  // ── Rituals here, things from your practice, and the altar's history ──
  const altarRef = useMemo<AltarRef | null>(() => (doc ? { id: sourceId, name, objects: doc.objects, background: doc.background } : null), [doc, sourceId, name]);
  // Once a save has gone through, the day's picture of the altar is kept (at most one a day).
  useAltarSnapshots(justSaved && !dirty ? altarRef : null, justSaved && !dirty);
  const rituals = useRituals();
  const ritualHere = runsOnAltar(rituals.active, sourceId) ? rituals.active : null;
  const origin = useMemo(() => (ritualHere ? ritualOrigin(ritualHere, rituals.templates) : null), [ritualHere, rituals.templates]);
  const ritualTitle = origin?.title ?? 'Ritual Session';
  const ritualSnapshot = useCallback(
    () => (docRef.current ? (ritualAltarSnapshot(docRef.current, ritualTitle, nowIso()) as unknown as Record<string, unknown>) : null),
    [ritualTitle],
  );
  /** What a ritual step does to the altar: candles and incense change; an offering opens its sheet. */
  const ritualEffect = (effect: AltarEffect) => {
    if (effect.kind !== 'offering') return commit((d) => applyAltarEffect(d, effect, nowIso()));
    const at = effect.objectIds.length ? indexOfId(effect.objectIds[0]) : -1;
    if (at < 0) {
      setNotice('Set a bowl or dish on the altar to hold the offering; you’ll find them among the cabinet’s vessels.');
      return;
    }
    setSelected(at);
    setSheet('offering');
  };
  const onAltar = useBeginOnAltar();
  const beginHere = async (source: RitualSource) => {
    if (!sourceId) return;
    try {
      await onAltar.begin(source, sourceId, false);
      setSheet(null);
      setSelected(null);
      setTools(false);
      setNotice(null);
    } catch (e) {
      setNotice(`Couldn’t begin: ${e instanceof Error ? e.message : 'please try again.'}`);
    }
  };
  /** A rite from your practice (an ancestor's candle rite), begun on this altar. */
  const beginRite = async (draft: TemplateDraft) => {
    if (!sourceId) {
      setNotice('Save this altar first; a rite begun here is kept with it.');
      setSheet('save');
      return;
    }
    try {
      await startRitual({ kind: 'draft', draft: { ...draft, linked_altar_id: sourceId } });
      await updateActive((s) => withDraftClosing(s, draft));
      setSelected(null);
      setTools(false);
    } catch (e) {
      setNotice(`Couldn’t begin: ${e instanceof Error ? e.message : 'please try again.'}`);
    }
  };
  const placeFromPractice = (object: import('../../../lib/altar/types').SavedObject) => {
    const index = docRef.current?.objects.length ?? 0;
    commit((d) => addObject(d, object));
    setSelected(index);
    setSheet(null);
    setNotice(`${shortLabel(object.label, 'It')} is on your altar.`);
  };
  // The newest cleansing or charge done here on one of your own stones, for its log in Crystal.
  const selectedCare = useMemo(() => (selectedObject && stoneIdOf(selectedObject) ? lastAltarCareOf(selectedObject) : null), [selectedObject]);
  const ritualOverlay =
    ritualHere && altarRef ? (
      <AltarRitualOverlay
        altar={altarRef}
        closing={origin?.closing}
        intentionKey={origin?.intentionKey}
        candleScope={origin?.candleScope ?? 'all'}
        snapshot={ritualSnapshot}
        onEffect={ritualEffect}
        onFinished={(finished, status) => {
          // The candles the ritual lit or snuffed are kept with the altar.
          if (sourceId) void save(name, false);
          if (status === 'completed') router.push({ pathname: '/rituals/journal/new', params: { sessionId: finished.id } });
        }}
      />
    ) : null;

  const stage =
    doc && stageWidth > 0 ? (
          <AltarStage
            doc={doc}
            width={stageWidth}
            viewport={viewport}
            selected={selected}
            onSelect={setSelected}
            onGestureStart={pushUndo}
            onMove={(i, cx, cy) => {
              // Snap to meaning: near a direction or the centre, it settles onto it.
              const current = docRef.current;
              const snap = options.snapToMeaning && current?.objects[i] ? snapToMeaning(current.objects[i], cx, cy, current.background) : null;
              if (snap?.role !== guideRef.current?.role) {
                guideRef.current = snap;
                setGuide(snap);
              }
              commit((d) => moveObject(d, i, snap ? snap.cx : cx, snap ? snap.cy : cy), false);
            }}
            onResize={(i, size) => commit((d) => setObjectSize(d, i, size), false)}
            onRotate={(i, deg) => commit((d) => setRotation(d, i, deg), false)}
            onGestureEnd={() => {
              if (guideRef.current) setNotice(`Set in the ${guideRef.current.role.split(' · ')[0].toLowerCase()}${guideRef.current.role.includes('·') ? `, with ${guideRef.current.role.split(' · ')[1]}` : ''}.`);
              guideRef.current = null;
              setGuide(null);
            }}
            onViewportChange={setViewport}
            sky={sky}
            aging={aging}
            charges={charges}
            moment={moment}
            guide={guide}
            now={minute * 60_000}
          />
    ) : null;

  const panelBody = (
    <>
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
            petition={selectedObject && isPetitionPaper(selectedObject) ? petitionEntries.find((e) => e.id === petitionEntryOf(selectedObject))?.data ?? null : null}
            objects={doc.objects}
            wisdom={wisdom}
            tonightWhy={tonightWhy}
            spells={selectedSpells}
            canMirror={canMirror}
            connect={{
              altarId: sourceId,
              altarName: name,
              lastAltarCare: selectedCare,
              onBeginRite: (draft) => void beginRite(draft),
              onPickPage: () => setSheet('page'),
            }}
            onAbout={() => setSheet('about')}
            onCloser={() => setSheet('closer')}
            onDone={() => setSelected(null)}
            act={{
              light: () => {
                const lighting = isCandle(selectedObject) && !isLit(selectedObject) && !candleLife(selectedObject).spent;
                commit((d) => toggleLight(d, selected, nowIso()));
                // A candle kept over nights: lighting it is tonight's tending of its spell.
                if (lighting) for (const e of selectedSpells) tendSpell(e.id, e.data, true);
              },
              anoint: () => setSheet('anoint'),
              renew: () => setSheet('renew'),
              feed: () => setSheet('feed'),
              spell: () => {
                setSpellWith({ uid: selectedUid, label: shortLabel(selectedObject.label) });
                openSaved('spell', 'spell timer');
              },
              tendSpell: (id) => {
                const e = selectedSpells.find((x) => x.id === id);
                if (e) tendSpell(e.id, e.data);
              },
              layouts: () => setSheet('layouts'),
              tonight: () => setSheet('tonight'),
              mirror: () => {
                const result = mirrorPair(doc.objects, selected);
                if (!result) return;
                commit((d) => ({ ...d, objects: mirrorPair(d.objects, selected)?.objects ?? d.objects }));
                setNotice(`${shortLabel(doc.objects[result.partner].label)} now mirrors it across the altar.`);
              },
              read: () => setSheet('reading'),
              offer: () => setSheet('offering'),
              refreshOffering: () => {
                changeSelected((o) => refreshOffering(o, nowIso()));
                setNotice('Refreshed.');
              },
              endOffering: endSelectedOffering,
              deityOffering,
              incense: () => {
                const life = incenseLife(selectedObject);
                changeSelected((o) => (life.lit ? putOutIncense(o, nowIso()) : life.ash ? clearAsh(o, nowIso()) : lightIncense(o, nowIso())));
                if (life.ash) setNotice('The ash is cleared. Fresh incense is ready to light.');
              },
              incenseKind: () => setSheet('incense'),
              petitions: openPetitions,
              fresh: () => commit((d) => freshCandleAt(d, selected, nowIso())),
              length: () => setSheet('length'),
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
              <Chip
                label={box.open.length ? `Petitions (${box.open.length})` : 'Petitions'}
                symbol="✉"
                accessibilityLabel={`The petition box${box.open.length ? `, ${box.open.length} waiting` : ''}`}
                onPress={openPetitions}
              />
              <Chip label="Sky & season" symbol="☾" accessibilityLabel="Sky and season options for this altar" onPress={() => setSheet('options')} />
              <Chip
                label="Workings"
                symbol="✶"
                accessibilityLabel="Workings: begin a ritual here, spell jar, sachet, spell timer, scrying, the gratitude bowl, and things from your practice"
                onPress={() => setSheet('more-workings')}
              />
              <Chip label="Read & arrange" symbol="☉" accessibilityLabel="Read this altar, its intention and layouts with meaning" onPress={() => setSheet('more-reading')} />
              {tonight && <Chip label="Why these pieces" symbol="✧" accessibilityLabel="Why each piece of tonight’s altar is there, and swaps" onPress={() => setSheet('tonight')} />}
              <Chip label="History" symbol="◷" accessibilityLabel="This altar’s history: what happened here and how it looked" onPress={() => openSaved('history', 'history')} />
              <Chip label="Share" symbol="⇪" accessibilityLabel="Share a picture of this altar" onPress={() => setSheet('share')} disabled={doc.objects.length === 0} />
              <Chip
                label="Record in Grimoire"
                symbol="❧"
                accessibilityLabel="Record this altar in your Grimoire"
                onPress={() => setSheet('grimoire')}
                disabled={doc.objects.length === 0}
              />
              {Platform.OS !== 'web' ? (
                <Chip
                  label="Home screen"
                  symbol="▣"
                  accessibilityLabel="Put this altar on your home screen"
                  onPress={() => {
                    if (sourceId) return setSheet('widget');
                    // Only saved altars can go on the home screen.
                    setNotice('Save this altar first, then tap Home screen again to choose its place on your home screen.');
                    setSheet('save');
                  }}
                />
              ) : null}
              <Chip label="Undo" symbol="↶" onPress={() => stepHistory(undo, redo)} disabled={undo.current.length === 0} />
              <Chip label="Redo" symbol="↷" onPress={() => stepHistory(redo, undo)} disabled={redo.current.length === 0} />
              {canTurnScreen && !full ? <Chip label="Full screen" symbol="⤢" accessibilityLabel="Turn the altar sideways to fill the screen" onPress={() => enterFullScreen(true)} /> : null}
              <Chip label="Zoom in" symbol="+" onPress={() => zoomBy(1.5)} disabled={viewport.zoom >= 4} />
              <Chip label="Zoom out" symbol="−" onPress={() => zoomBy(1 / 1.5)} disabled={viewport.zoom <= 1} />
            </ChipRow>
            {(doc.objects.some(isCandle) || doc.objects.length > 1) && (
              <ChipRow>
                {doc.objects.some((o) => isCandle(o) && !isLit(o) && !candleLife(o).spent) && (
                  <Chip label="Light all candles" symbol="✺" onPress={() => commit((d) => lightAll(d, nowIso()))} />
                )}
                {doc.objects.some(isLit) && <Chip label="Snuff all" symbol="◌" onPress={() => commit((d) => snuffAll(d, nowIso()))} />}
                {doc.objects.length > 1 && <Chip label="Group" symbol="⊕" onPress={() => setSheet('group')} />}
              </ChipRow>
            )}
            {!!intention.text && (
              <Text style={styles.glance} accessibilityLabel={`This altar’s intention: ${intention.text}`} onPress={() => openSaved('intention', 'intention')}>
                {`“${intention.text}”`}
              </Text>
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
    </>
  );

  const sheets = doc ? (
    <>
          {sourceId ? (
            <WidgetSheet visible={sheet === 'widget'} altarId={sourceId} altarName={name} altars={altars} onClose={() => setSheet(null)} />
          ) : null}
          <CloseUpSheet
            visible={sheet === 'closer'}
            object={selectedObject}
            label={shortLabel(selectedObject?.label)}
            background={doc.background}
            agedOpacity={aging[String(selectedObject?.altarObjectId)]?.opacity}
            droop={aging[String(selectedObject?.altarObjectId)]?.droop}
            charge={charges[String(selectedObject?.altarObjectId)]}
            onClose={() => setSheet(null)}
          />
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
            name={grimoireTitle}
            items={groupAltarItems(groupItems)}
            sectionTitle={grimoire.openSection?.title ?? null}
            signedIn={signedIn}
            defaults={workingDefaults()}
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
              const words = playMoment(indices.map((i) => String(doc.objects[i]?.altarObjectId || '')), input.methods);
              setNotice(`${kind === 'cleanse' ? 'Cleansed' : 'Charged'}${indices.length > 1 ? ` ${indices.length} crystals` : ''}. ${words}`);
            }}
            onDedicate={(index, input) => {
              commit((d) => updateObjects(d, [index], (o) => dedicateCrystal(o, input, nowIso())));
              setCrystalMode(null);
              setNotice('Dedication saved.');
            }}
            onDefaultCleansing={(index, value) => {
              commit((d) => updateObjects(d, [index], (o) => setDefaultCleansing(o, value, nowIso())));
              setCrystalMode(null);
              setNotice(value ? 'Widget cleansing saved. Save the altar to use it on your home screen.' : 'Widget cleansing cleared.');
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
            onDefaultOffering={(index, value) => {
              commit((d) => updateObjects(d, [index], (o) => setDefaultOffering(o, value, nowIso())));
              setDeityMode(null);
              setNotice(value ? 'Widget offering saved. Save the altar to use it on your home screen.' : 'Widget offering cleared.');
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
            signedIn={signedIn}
            onSetImage={store.setFormImage}
            onRemoveImage={store.removeFormImage}
            onClose={() => setSheet(null)}
            onPlace={place}
          />
          <BackgroundSheet
            visible={sheet === 'background'}
            current={doc.background}
            custom={backgrounds}
            signedIn={signedIn}
            onUpload={store.addBackground}
            onDelete={store.removeBackground}
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
          <CandleLifeSheet
            visible={sheet === 'length'}
            candle={shortLabel(selectedObject?.label, 'Candle')}
            current={selectedObject ? candleLife(selectedObject).expectedMs : 0}
            usual={selectedObject ? (CANDLE_LIFE[candleLife(selectedObject).form] ?? 0) : 0}
            onClose={() => setSheet(null)}
            onChoose={(ms) => {
              if (selected != null) commit((d) => setCandleLifeAt(d, selected, ms, nowIso()));
              setSheet(null);
            }}
          />
          <FlameReadingSheet
            visible={sheet === 'reading' && !!selectedObject && isCandle(selectedObject)}
            candle={shortLabel(selectedObject?.label, 'Candle')}
            spent={!!selectedObject && isCandle(selectedObject) && candleLife(selectedObject).spent}
            remnant={selectedObject ? remnantOf(selectedObject)?.choice ?? null : null}
            canJournal
            onClose={() => setSheet(null)}
            onSave={(input, journal) => void saveReading(input, journal)}
            onRemnant={(choice) => {
              changeSelected((o) => setRemnant(o, choice, nowIso()));
              setNotice(choice === 'keep' ? 'The remnant is kept.' : choice === 'bury' ? 'The remnant is to be buried.' : 'The remnant is thrown away.');
            }}
          />
          <OfferingSheet
            visible={sheet === 'offering' && !!selectedObject && canHoldOffering(selectedObject)}
            name={shortLabel(selectedObject?.label)}
            current={selectedObject ? offeringOf(selectedObject)?.kind ?? null : null}
            onClose={() => setSheet(null)}
            onChoose={(kind, label) => {
              changeSelected((o) => setOffering(o, kind, label, nowIso()));
              setSheet(null);
            }}
          />
          <IncenseSheet
            visible={sheet === 'incense' && !!selectedObject && isIncense(selectedObject)}
            name={shortLabel(selectedObject?.label, 'Incense')}
            form={selectedObject ? incenseFormOf(selectedObject) : 'stick'}
            burnMs={selectedObject ? incenseLife(selectedObject).burnMs : 0}
            onClose={() => setSheet(null)}
            onForm={(form) => changeSelected((o) => setIncenseForm(o, form, nowIso()))}
            onLength={(ms) => {
              changeSelected((o) => setIncenseLength(o, ms, nowIso()));
              setSheet(null);
            }}
          />
          <AltarOptionsSheet
            visible={sheet === 'options'}
            options={options}
            placeKnown={!!here}
            saved={!!sourceId}
            onClose={() => setSheet(null)}
            onChange={changeOptions}
          />
          <WritePetitionSheet
            visible={sheet === 'petition'}
            candles={doc.objects
              .filter((o) => isCandle(o) && !candleLife(o).spent && o.altarObjectId)
              .map((o) => ({ id: String(o.altarObjectId), label: shortLabel(o.label, 'Candle') }))}
            onClose={() => setSheet(null)}
            onWrite={(input, candleId) => void writePetition(input, candleId)}
          />
          <PetitionBoxSheet
            visible={sheet === 'petitions'}
            open={box.open}
            history={box.history}
            nights={releaseNights(new Date(minute * 60_000), here?.latitude ?? null)}
            onClose={() => setSheet(null)}
            onWrite={() => {
              setSheet(null);
              afterSheetCloses(() => setSheet('petition'));
            }}
            onBurn={(entry) => finishPetitionEntry(entry, 'burned')}
            onBury={(entry) => finishPetitionEntry(entry, 'buried')}
            onRelease={(entry) => finishPetitionEntry(entry, 'released')}
            onSchedule={(entry, night) => {
              void updateEntry(PETITIONS, entry.id, schedulePetition(entry.data, night.date, night.why));
              setNotice(`“${entry.data.title}” will wait for ${night.label.toLowerCase()}.`);
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
          <MoreSheet
            visible={sheet === 'more-workings' || sheet === 'more-reading'}
            section={sheet === 'more-reading' ? 'reading' : 'workings'}
            saved={!!sourceId}
            tonight={!!tonight}
            intention={intention.text}
            snap={options.snapToMeaning}
            onSnap={(on) => {
              changeOptions({ snapToMeaning: on });
              setNotice(on ? 'Snap to meaning is on: drag things near a direction or the centre and they settle there.' : 'Snap to meaning is off.');
            }}
            onPick={fromMore}
            onClose={() => setSheet(null)}
          />
          {altarCtx && (
            <>
              <SpellJarSheet visible={sheet === 'jar'} altar={altarCtx} center={viewCenter()} onClose={() => setSheet(null)} onPlace={placeWorking} />
              <SachetSheet visible={sheet === 'sachet'} altar={altarCtx} center={viewCenter()} onClose={() => setSheet(null)} onPlace={placeWorking} />
              <JarRenewSheet
                visible={sheet === 'renew'}
                object={selectedObject && jarStateOf(selectedObject) ? selectedObject : null}
                onClose={() => setSheet(null)}
                onUpdate={(o) => {
                  changeSelected(() => o);
                  setNotice('Shaken and renewed.');
                }}
              />
              <SachetFeedSheet
                visible={sheet === 'feed'}
                object={selectedObject && sachetStateOf(selectedObject) ? selectedObject : null}
                onClose={() => setSheet(null)}
                onUpdate={(o) => {
                  changeSelected(() => o);
                  setNotice('Fed.');
                }}
              />
              <DressingSheet
                visible={sheet === 'anoint'}
                candle={selectedObject && isCandle(selectedObject) ? selectedObject : null}
                onClose={() => setSheet(null)}
                onDress={(o) => {
                  changeSelected(() => o);
                  setSheet(null);
                  setNotice('Dressed and anointed. The oil and herbs show on the wax.');
                }}
              />
              <SpellTimerSheet
                visible={sheet === 'spell' && !!sourceId}
                altar={altarCtx}
                objectUid={spellWith?.uid}
                objectLabel={spellWith?.label}
                onClose={() => {
                  setSheet(null);
                  setSpellWith(null);
                }}
              />
              <ScryingScreen
                visible={sheet === 'scry' && !!sourceId}
                altar={altarCtx}
                onClose={() => setSheet(null)}
                onSaved={(where) => setNotice(where === 'journal' ? 'What came in the water is in your journal.' : 'What came in the water is kept with this altar.')}
              />
              <GratitudeSheet visible={sheet === 'gratitude' && !!sourceId} altar={altarCtx} onClose={() => setSheet(null)} />
              <AltarReadingSheet
                visible={sheet === 'altarReading'}
                altar={altarCtx}
                onClose={() => setSheet(null)}
                onPlaceSuggestion={(o) => {
                  const index = docRef.current?.objects.length ?? 0;
                  commit((d) => addObject(d, o));
                  setSelected(index);
                  setSheet(null);
                  setNotice(`${shortLabel(o.label)} is on the altar.`);
                }}
                onEditIntention={() => {
                  setSheet(null);
                  afterSheetCloses(() => openSaved('intention', 'intention'));
                }}
              />
              <IntentionSheet visible={sheet === 'intention' && !!sourceId} altar={altarCtx} onClose={() => setSheet(null)} />
              <LayoutSheet
                visible={sheet === 'layouts'}
                altar={altarCtx}
                selected={selectedObject}
                onClose={() => setSheet(null)}
                onApply={(plan) => {
                  commit((d) => ({ ...d, objects: applyMoves(d.objects, plan.moves) }));
                  setSheet(null);
                  setNotice(`Arranged as ${plan.title.toLowerCase()}. Undo puts it back.`);
                }}
              />
            </>
          )}
          {altarRef && (
            <>
              <RitualPickerSheet visible={sheet === 'ritual' && !!sourceId} altar={altarRef} busy={onAltar.busy} onClose={() => setSheet(null)} onBegin={(source) => void beginHere(source)} />
              <AncestorShrineSheet visible={sheet === 'ancestor'} altar={altarRef} onClose={() => setSheet(null)} onPlace={placeFromPractice} />
              <StoneSheet visible={sheet === 'stone'} altar={altarRef} onClose={() => setSheet(null)} onPlace={placeFromPractice} />
              <PlantSheet visible={sheet === 'plant'} altar={altarRef} onClose={() => setSheet(null)} onPlace={placeFromPractice} />
              <ReadingSheet visible={sheet === 'drawn'} altar={altarRef} onClose={() => setSheet(null)} onPlace={placeFromPractice} />
              <ShareAltarSheet visible={sheet === 'share'} altar={altarRef} onClose={() => setSheet(null)} />
              <AltarHistorySheet visible={sheet === 'history' && !!sourceId} altar={altarRef} onClose={() => setSheet(null)} />
            </>
          )}
          <GrimoireLinkSheet
            visible={sheet === 'page' && !!selectedObject}
            object={selectedObject}
            onClose={() => setSheet(null)}
            onLink={(page) => {
              changeSelected((o) => withPageLink(o, page, nowIso()));
              setSheet(null);
              setNotice(`Linked to “${page.title}” in your Book of Shadows.`);
            }}
            onUnlink={() => {
              changeSelected((o) => withoutPageLink(o, nowIso()));
              setSheet(null);
            }}
          />
          <TonightExplainedSheet
            visible={sheet === 'tonight' && !!tonightNow}
            tonight={tonightNow}
            date={tonight?.date ?? new Date()}
            onClose={() => setSheet(null)}
            onSwap={(i, o) => {
              commit((d) => updateObjects(d, [i], () => o));
              setNotice(`${shortLabel(o.label)} stands in its place.`);
            }}
          />
    </>
  ) : null;

  if (full && doc) {
    // The drawer opens only when asked, so tapping things to arrange them keeps the whole altar in view.
    const drawerOpen = tools;
    const drawerWidth = Math.min(380, Math.round(win.width * 0.42)) + insets.right;
    return (
      <View style={styles.full}>
        <StatusBar hidden />
        {stage}
        {ritualOverlay}
        <View style={[styles.fullBar, { left: insets.left + 10, top: Math.max(insets.top, 10) }]}>
          <Chip label="Done" symbol="✕" accessibilityLabel="Leave full screen" onPress={() => enterFullScreen(false)} />
          <Chip label="Undo" symbol="↶" onPress={() => stepHistory(undo, redo)} />
          <Chip label="Redo" symbol="↷" onPress={() => stepHistory(redo, undo)} />
        </View>
        {!drawerOpen ? (
          <View style={[styles.fullBar, { right: insets.right + 10, top: Math.max(insets.top, 10) }]}>
            <Chip label={dirty ? 'Save' : 'Saved'} symbol="✓" onPress={() => setSheet('save')} />
            <Chip label="Cabinet" symbol="❖" accessibilityLabel="Open the cabinet" onPress={() => setSheet('cabinet')} />
            {selectedObject ? (
              <Chip label="Show details" symbol="☰" accessibilityLabel={`Show details for ${shortLabel(selectedObject.label)}`} onPress={() => setTools(true)} />
            ) : (
              <Chip label="Tools" symbol="☰" accessibilityLabel="Show the altar's tools" onPress={() => setTools(true)} />
            )}
          </View>
        ) : (
          <View style={[styles.drawer, { width: drawerWidth, paddingRight: insets.right }]}>
            <View style={styles.drawerHead}>
              <Text style={type.eyebrow} numberOfLines={1}>
                {dirty ? 'Unsaved changes' : name}
              </Text>
              <Pressable
                onPress={() => setTools(false)}
                accessibilityRole="button"
                accessibilityLabel="Hide the tools"
                style={styles.drawerClose}
              >
                <Text style={styles.drawerCloseText}>Close</Text>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.drawerContent}
              alwaysBounceHorizontal={false}
              automaticallyAdjustKeyboardInsets
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
            >
              {panelBody}
            </ScrollView>
          </View>
        )}
        {sheets}
      </View>
    );
  }

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
          onPress={() => {
            if (from === 'today') {
              // Close this altar first, so the Altar tab opens on your altars next time, then go back to Today.
              router.dismissTo('/altar');
              router.navigate('/today');
            } else if (router.canGoBack()) router.back();
            else router.replace('/altar');
          }}
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

      <View style={styles.work}>
      <View style={styles.stageWrap} onLayout={onLayout}>
        {stage ? (
          stage
        ) : (
          <View style={{ height: (containerWidth || 320) / STAGE_ASPECT, justifyContent: 'center' }}>
            <ActivityIndicator color={colors.gold} />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.panel}
        contentContainerStyle={styles.panelContent}
        alwaysBounceHorizontal={false}
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        {panelBody}
      </ScrollView>
      {ritualOverlay}
      </View>

      {sheets}
    </SafeAreaView>
  );
}

type Actions = {
  light: () => void;
  anoint: () => void;
  renew: () => void;
  feed: () => void;
  spell: () => void;
  tendSpell: (entryId: string) => void;
  layouts: () => void;
  tonight: () => void;
  mirror: () => void;
  read: () => void;
  offer: () => void;
  refreshOffering: () => void;
  endOffering: (how: OfferingEnd) => void;
  deityOffering: (action: 'refresh' | 'returned' | 'removed') => void;
  incense: () => void;
  incenseKind: () => void;
  petitions: () => void;
  fresh: () => void;
  length: () => void;
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
  petition,
  objects,
  wisdom,
  tonightWhy,
  spells,
  canMirror,
  connect,
  act,
  onAbout,
  onCloser,
  onDone,
}: {
  /** Links to the rest of your practice: ancestors, stones, the Book of Shadows. */
  connect: {
    altarId: string | null;
    altarName: string;
    lastAltarCare: ReturnType<typeof lastAltarCareOf>;
    onBeginRite: (draft: TemplateDraft) => void;
    onPickPage: () => void;
  };
  petition: Petition | null;
  objects: import('../../../lib/altar/types').SavedObject[];
  /** Where tradition puts it on an altar, or ''. */
  wisdom: string;
  /** Why it's on tonight's altar, when the altar came from there. */
  tonightWhy: string;
  /** Open spells worked with it. */
  spells: CraftEntry<SpellEntry>[];
  canMirror: boolean;
  group: string;
  crafted: boolean;
  canPractice: boolean;
  object: import('../../../lib/altar/types').SavedObject;
  objectLabel: string;
  glance: string;
  act: Actions;
  onAbout: () => void;
  /** Open the close-up of it. */
  onCloser: () => void;
  onDone: () => void;
}) {
  const candle = isCandle(object);
  const lit = isLit(object);
  const locked = object.locked === 'true';
  const glowing = object.glowing === 'true';
  const dressings = candle ? dressingsOf(object) : [];
  const carvings = candle ? carvingsOf(object) : [];
  const [now, setNow] = useState(() => new Date());
  const incense = isIncense(object) ? incenseLife(object, now.getTime()) : null;
  // A lit candle's burning time counts up, as on the website; offerings age by the minute.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), lit || incense?.lit ? 10_000 : 60_000);
    return () => clearInterval(timer);
  }, [lit, incense?.lit]);
  const toRead = candle && !lit ? burnToRead(object, now.getTime()) : null;
  const read = candle && !lit && !!lastBurn(object);
  const offering = canHoldOffering(object) ? offeringFreshness(object, now.getTime()) : null;
  const contents = offering ? offeringOf(object) : null;
  const deityAging = object.type === 'deity' ? agingDeityOffering(offeringsOf(object, now.toISOString()), now.getTime()) : null;
  const moonCharge = object.type === 'crystal' || offering?.kind === 'water' ? moonChargesOf(object)[0] ?? null : null;
  const story = useMemo(() => storyLines(object), [object]);
  const [allStory, setAllStory] = useState(false);
  const summary = storySummary(object, now);
  const burned = candle ? burnedSoFar(object, now) : 0;
  const life = candle ? candleLife(object, now) : null;
  const [confirmRemove, setConfirmRemove] = useState(false);
  const minuteNow = Math.floor(now.getTime() / 60_000) * 60_000;
  const wax = candle ? waxLook(object, minuteNow) : null;
  const nights = candle ? nightCandle(object, minuteNow) : null;
  const charge = chargeOf(object, minuteNow);
  const attunement = useMemo(() => attunementOf(object), [object]);
  const jar = jarStateOf(object);
  const sachet = sachetStateOf(object);
  const relationship = useMemo(() => (object.type === 'deity' ? deityRelationship(object, objects, new Date()) : null), [object, objects]);

  return (
    <View style={styles.section}>
      <View style={styles.objectHead}>
        <View style={{ flex: 1 }}>
          <Text style={type.eyebrow}>{locked ? 'Locked in place' : lit || incense?.lit ? 'Burning' : life?.spent ? 'Spent' : incense?.ash ? 'Ash' : 'Selected'}</Text>
          <Text style={type.cardTitle}>{objectLabel}</Text>
          {!!glance && <Text style={styles.glance}>{glance}</Text>}
          {!!group && <Text style={type.caption}>{`In the group “${group}”`}</Text>}
          {attunement.attuned && (
            <Text style={styles.attuned} accessibilityLabel={attunement.line}>
              {`✦ ${attunement.line}`}
            </Text>
          )}
          {candle && (
            <Text style={type.caption}>
              {[
                lit ? `Burning time ${burnDuration(burned)}` : burned > 0 ? `Burned ${burnDuration(burned)} in all` : null,
                life?.spent
                  ? 'Burned all the way down'
                  : life?.expectedMs
                    ? burned > 0 || lit
                      ? `About ${lifeDuration(life.remainingMs)} left`
                      : `Burns about ${lifeDuration(life.expectedMs)}`
                    : null,
                dressings.length ? `Dressed with ${dressingNames(dressings).join(', ')}` : null,
                carvings.length ? `Carved with ${carvings.map((c) => `“${c.text}”`).join(', ')}` : null,
                nights && !life?.spent ? nights.line : null,
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
        <Chip label="Look closer" symbol="◎" accessibilityLabel={`Look closer at ${objectLabel}: shown large, with every mark on it`} onPress={onCloser} />
        {crafted && <Chip label="Status" symbol="✓" accessibilityLabel={`Status of ${objectLabel}: activation, remaining and review`} onPress={act.tend} />}
        {canPractice && <Chip label="Begin Practice" symbol="✧" accessibilityLabel={`Begin today’s practice with ${objectLabel}`} onPress={act.practice} />}
        {object.type === 'apothecary' && !!object.apothecaryItemId && (
          <Chip label="Recipe" symbol="✎" accessibilityLabel={`Open the recipe for ${objectLabel}`} onPress={act.recipe} />
        )}
      </ChipRow>

      <AncestorPanelSection object={object} altarId={connect.altarId} onLight={act.light} onBeginRite={connect.onBeginRite} />
      <StonePanelSection object={object} altarName={connect.altarName} lastAltarCare={connect.lastAltarCare} />
      <PlantPanelSection object={object} />
      <ReadingPanelSection object={object} />

      {!!tonightWhy && (
        <View style={styles.living}>
          <Text style={type.eyebrow}>Why it’s here tonight</Text>
          <Text style={type.caption}>{tonightWhy}</Text>
          <ChipRow>
            <Chip label="Swap it" symbol="⇄" accessibilityLabel={`Swap ${objectLabel} for something with the same correspondence`} onPress={act.tonight} />
          </ChipRow>
        </View>
      )}

      {charge && (
        <View style={styles.living} accessible accessibilityLabel={`${chargeLine(charge)}. ${chargeDetail(charge)}`}>
          <Text style={[type.eyebrow, charge.level === 'faded' && styles.faded]}>{chargeLine(charge)}</Text>
          <Text style={type.caption}>{chargeDetail(charge)}</Text>
        </View>
      )}

      {spells.map((e) => {
        const today = spellToday(e.data, now);
        return (
          <View key={e.id} style={styles.living}>
            <Text style={type.eyebrow}>{`${e.data.title} · ${today.label}`}</Text>
            <Text style={type.caption}>{[today.instruction, today.waited].filter(Boolean).join(' ')}</Text>
            {today.status === 'tend' && (
              <ChipRow>
                <Chip label="Tended today" symbol="✓" accessibilityLabel={`Mark today’s tending of ${e.data.title} done`} onPress={() => act.tendSpell(e.id)} />
              </ChipRow>
            )}
          </View>
        );
      })}

      {moonCharge && (
        <Text style={type.caption}>{`Charged under the ${moonCharge.moon || 'moon'}, ${new Date(moonCharge.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}, sitting here.`}</Text>
      )}
      {object.type === 'crystal' && (
        <ChipRow>
          <Chip label="Cleanse" symbol="☾" onPress={() => act.crystal('cleanse')} />
          <Chip label="Charge" symbol="✦" onPress={() => act.crystal('charge')} />
          <Chip label="Dedicate" symbol="♡" onPress={() => act.crystal('dedicate')} />
          {Platform.OS !== 'web' && <Chip label="Widget cleansing" symbol="▣" onPress={() => act.crystal('widget')} />}
        </ChipRow>
      )}
      {object.type === 'deity' && (
        <ChipRow>
          <Chip label="Offering" symbol="❀" onPress={() => act.deity('offering')} />
          <Chip label="Reason for presence" symbol="☉" onPress={() => act.deity('reason')} />
          {Platform.OS !== 'web' && <Chip label="Widget offering" symbol="▣" onPress={() => act.deity('widget')} />}
        </ChipRow>
      )}
      {relationship && (
        <View style={styles.living}>
          <Text style={type.eyebrow}>Your relationship</Text>
          <Text style={type.caption}>{relationship.summary}</Text>
          {!!relationship.reason && <Text style={type.caption}>{`Here for ${relationship.reason}.`}</Text>}
          {relationship.feasts.map((f) => (
            <Text key={`${f.name}-${f.date.getTime()}`} style={type.caption}>
              {`${f.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} · ${f.name}${f.tradition ? ` (${f.tradition})` : ''}`}
            </Text>
          ))}
        </View>
      )}
      {deityAging && (
        <View style={styles.living}>
          <Text style={type.eyebrow}>{`Your offering · ${FRESHNESS_WORDS[deityAging.fresh.level]}`}</Text>
          <Text style={type.caption}>{freshnessLine(deityAging.kind, deityAging.fresh)}</Text>
          <ChipRow>
            <Chip label="Refresh" symbol="↻" accessibilityLabel="Refresh the offering with a fresh one" onPress={() => act.deityOffering('refresh')} />
            <Chip label="Return to nature" symbol="❧" onPress={() => act.deityOffering('returned')} />
            <Chip label="Remove" symbol="⌫" accessibilityLabel="Clear the offering away" onPress={() => act.deityOffering('removed')} />
          </ChipRow>
        </View>
      )}

      {offering && contents ? (
        <View style={styles.living}>
          <Text style={type.eyebrow}>{`${contents.label || offeringKind(contents.kind)?.label} · ${FRESHNESS_WORDS[offering.level]}`}</Text>
          <Text style={type.caption}>{freshnessLine(offering.kind, offering)}</Text>
          <ChipRow>
            {offering.level !== 'lasting' && <Chip label="Refresh" symbol="↻" active={offering.level === 'refresh'} onPress={act.refreshOffering} />}
            <Chip label="Return to nature" symbol="❧" onPress={() => act.endOffering('returned')} />
            <Chip label="Remove" symbol="⌫" accessibilityLabel={holdsOfferings(object) ? 'Empty the vessel' : 'Clear it away'} onPress={() => act.endOffering('removed')} />
            <Chip label={holdsOfferings(object) ? 'Something else' : 'What it is'} symbol="✎" onPress={act.offer} />
          </ChipRow>
        </View>
      ) : holdsOfferings(object) ? (
        <Button label="Set out an offering" variant="outline" onPress={act.offer} />
      ) : null}

      {jar && (
        <View style={styles.living}>
          <Text style={type.eyebrow}>{`Spell jar${jar.intention ? ` · for ${jar.intention.toLowerCase()}` : ''}`}</Text>
          <Text style={type.caption}>
            {jar.renewals.length ? `Last shaken ${daysSinceRenewal(jar, now) === 0 ? 'today' : `${daysSinceRenewal(jar, now)} days ago`}.` : 'Not shaken yet. A shake now and then wakes it.'}
          </Text>
          <Button label="Shake to renew" variant="outline" onPress={act.renew} />
        </View>
      )}

      {sachet && (
        <View style={styles.living}>
          <Text style={type.eyebrow}>{sachet.carried ? 'Sachet · carried' : 'Sachet · on the altar'}</Text>
          <Text style={type.caption}>{feedingLine(sachet, now)}</Text>
          <ChipRow>
            <Chip label="Feed it" symbol="❦" active={feedingDue(sachet, now)} accessibilityLabel={`Feed ${objectLabel}${feedingDue(sachet, now) ? ', it’s due' : ''}`} onPress={act.feed} />
          </ChipRow>
        </View>
      )}

      {incense && (
        <View style={styles.living}>
          <Text style={type.caption}>
            {incense.lit
              ? `Burning · about ${lifeDuration(incense.remainingMs)} left`
              : incense.ash
                ? 'Burned down to ash.'
                : incense.burnedMs > 0
                  ? `Partly burned · about ${lifeDuration(incense.remainingMs)} left`
                  : `${incense.form === 'resin' ? 'Resin on charcoal' : incense.form === 'cone' ? 'A cone' : 'A stick'} · burns about ${lifeDuration(incense.burnMs)}`}
          </Text>
          <Button label={incense.lit ? 'Put it out' : incense.ash ? 'Clear the ash' : 'Light the incense'} onPress={act.incense} />
          {incense.adjustable && (
            <ChipRow>
              <Chip label="Stick, cone or resin" symbol="⧗" accessibilityLabel="Choose what kind of incense it is and how long it burns" onPress={act.incenseKind} />
            </ChipRow>
          )}
        </View>
      )}

      {isPetitionPaper(object) && (
        <View style={styles.living}>
          {petition ? (
            <>
              {!!petition.words && <Text style={styles.glance}>{petition.words}</Text>}
              <Text style={type.caption}>
                {[petition.intention ? `For ${petition.intention}` : '', petition.status === 'scheduled' ? `To be released ${new Date(petition.releaseOn).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}` : 'Waiting in the petition box']
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </>
          ) : (
            <Text style={type.caption}>A folded petition. Its words are kept in the petition box.</Text>
          )}
          <Button label="Burn, bury or release it" variant="outline" onPress={act.petitions} />
        </View>
      )}

      {candle && (
        <>
          {life?.spent ? (
            <>
              <Text style={type.caption}>This candle has burned down. Put a fresh one in its place to light it again; this one’s burns stay in its history.</Text>
              <Button label="Put a fresh candle here" onPress={act.fresh} />
            </>
          ) : (
            <Button label={lit ? 'Snuff the candle' : 'Light the candle'} onPress={act.light} />
          )}
          {toRead ? (
            <View style={styles.living}>
              <Text style={type.eyebrow}>How did it burn?</Text>
              <Text style={type.caption}>While it’s fresh in your mind: the flame, the smoke and the wax. Candle-readers have long looked to them.</Text>
              <Button label="Read the candle" variant="outline" onPress={act.read} />
            </View>
          ) : read ? (
            <ChipRow>
              <Chip label={life?.spent ? 'How it burned · its remnant' : 'How it burned'} symbol="✧" onPress={act.read} />
            </ChipRow>
          ) : null}
          {!!wax?.line && <Text style={type.caption}>{wax.line}</Text>}
          <ChipRow>
            {life?.adjustable && <Chip label="How long it burns" symbol="⧗" onPress={act.length} />}
            {!life?.spent && <Chip label="Dress & anoint" symbol="❦" accessibilityLabel={`Dress and anoint ${objectLabel} with oil and herbs`} onPress={act.anoint} />}
            <Chip label="Dress from the altar" symbol="❧" accessibilityLabel="Dress it with a loose herb or oil that’s on the altar" onPress={act.dress} />
            <Chip label="Carve" symbol="✎" onPress={act.carve} />
            {dressings.length > 0 && <Chip label="Undress" symbol="⌫" onPress={act.undress} />}
          </ChipRow>
        </>
      )}

      {(story.length > 0 || !!summary) && (
        <View style={styles.living}>
          <Text style={type.eyebrow}>Its story</Text>
          {!!summary && <Text style={type.caption}>{summary}</Text>}
          {(allStory ? story : story.slice(0, 5)).map((line, i) => (
            <Text key={`${line.at}-${i}`} style={type.caption}>
              {`${new Date(line.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · ${line.text}`}
            </Text>
          ))}
          {story.length > 5 && <Chip label={allStory ? 'Show less' : `Show all ${story.length}`} onPress={() => setAllStory((v) => !v)} />}
        </View>
      )}

      <GrimoirePageLink object={object} onPick={connect.onPickPage} />

      <Text style={type.eyebrow}>Arrange</Text>
      {!!wisdom && <Text style={type.caption}>{wisdom}</Text>}
      <ChipRow>
        <Chip label="Turn left" symbol="↺" accessibilityLabel="Turn left 15 degrees" onPress={() => act.rotate(-15)} disabled={locked} />
        <Chip label="Turn right" symbol="↻" accessibilityLabel="Turn right 15 degrees" onPress={() => act.rotate(15)} disabled={locked} />
        <Chip label="Smaller" symbol="−" onPress={() => act.resize(1 / 1.12)} disabled={locked} />
        <Chip label="Larger" symbol="+" onPress={() => act.resize(1.12)} disabled={locked} />
        <Chip label="Flip" symbol="⇋" onPress={act.flip} disabled={locked} />
        {canMirror && <Chip label="Mirror its pair" symbol="⇆" accessibilityLabel={`Move its twin to mirror ${objectLabel} across the altar`} onPress={act.mirror} disabled={locked} />}
        <Chip label="Layouts" symbol="✣" accessibilityLabel="Layouts with meaning" onPress={act.layouts} />
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
        <Chip label="Spell over days" symbol="◔" accessibilityLabel={`Start a spell timer with ${objectLabel}`} onPress={act.spell} />
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


/** A recorded working starts with tonight's moon phase and the day filled in. */
function workingDefaults(now = new Date()): WorkingDetails {
  return { moonPhase: moonState(now).name, day: now.toLocaleDateString(undefined, { weekday: 'long' }) };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },
  headerButton: { width: touch, height: touch, alignItems: 'center', justifyContent: 'center' },
  back: { color: colors.gold, fontSize: 34, lineHeight: 36, fontFamily: fonts.display },
  headerText: { flex: 1 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28, color: colors.cream },
  work: { flex: 1 },
  stageWrap: { paddingHorizontal: 12, alignItems: 'center' },
  panel: { flex: 1 },
  panelContent: { paddingHorizontal: space.gutter, paddingTop: 16, paddingBottom: 32, gap: 14 },
  section: { gap: 14 },
  objectHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  glance: { fontFamily: fonts.displayItalic, fontSize: 17, lineHeight: 22, color: colors.parchment },
  living: { gap: 8 },
  notice: { color: colors.gold, textAlign: 'center' },
  attuned: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.gold, marginTop: 2 },
  faded: { color: colors.muted },
  danger: { marginTop: 8 },
  centered: { flex: 1, justifyContent: 'center', padding: space.gutter, gap: 14 },
  full: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
  fullBar: { position: 'absolute', flexDirection: 'row', gap: 8 },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(12, 21, 16, 0.94)',
    borderLeftWidth: 1,
    borderLeftColor: colors.goldLine,
  },
  drawerHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 16, paddingRight: 8, paddingTop: 6 },
  drawerClose: { marginLeft: 'auto', minHeight: touch, minWidth: touch, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  drawerCloseText: { color: colors.gold, fontFamily: fonts.bodySemi, fontSize: 15 },
  drawerContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 14 },
});
