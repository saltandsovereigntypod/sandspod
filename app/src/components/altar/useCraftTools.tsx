// The altar's round-two tools, wired into the editor as useToolRites does
// for the circle, bowl and chalice: the pendulum, the scrying mirror, the
// mortar and pestle, the bolline, the cauldron, crystals charging and the
// crystal grid, and drawing from a deck on the altar; and ritual mode.
// Everything done is kept in the altar's History, and on a coven altar the
// others see its moment (the "rite" broadcast, lib/altar/useAltarRites.ts);
// the grid, the mortar, the simmer pot and a charging stone travel with the
// altar itself. The logic is lib/altar/craftTools.ts, shared with the website.

import { useMemo, useState } from 'react';

import { apothecaryObject } from '../../lib/altar/apothecary';
import { builtInCabinet, shortLabel } from '../../lib/altar/cabinet';
import { cordsOf } from '../../lib/altar/cord';
import { readingObject } from '../../lib/altar/connect/practice';
import { drawResult, pendulumResult, type DivinationResult } from '../../lib/altar/divinationResult';
import {
  activateGrid,
  addToMortar,
  answerLabel,
  askPendulum,
  blendItem,
  burnBlendLine,
  chargeLineFor,
  chargingGlow,
  chargingOf,
  cutCord,
  cuttableCords,
  cutLine,
  deckKindOf,
  DECK_SPREAD,
  drawLine,
  drawSpot,
  emptyMortar,
  fillForScrying,
  finishCharging,
  GRID_MIN,
  GRID_RELEASED,
  gridLine,
  gridProblem,
  grindLine,
  grindMortar,
  isBolline,
  isCauldron,
  isMortar,
  isPendulum,
  isScryingGlass,
  isWand,
  mortarChoices,
  mortarOf,
  encodeCalibration,
  PENDULUM_SETTING,
  pendulumLine,
  pendulumReading,
  readCalibration,
  releaseGrid,
  simmerLine,
  startCharging,
  startSimmer,
  stopSimmer,
  takeFromMortar,
  type Calibration,
  type ChargePlace,
} from '../../lib/altar/craftTools';
import { chargeGate, seleniteUnder, setStoneIntention } from '../../lib/altar/crystalCare';
import { addObject, updateObjects } from '../../lib/altar/editor';
import { usePlace } from '../../lib/location';
import { isCandle, isLit } from '../../lib/altar/livingState';
import type { AltarDocument } from '../../lib/altar/snapshot';
import type { SavedObject } from '../../lib/altar/types';
import { saveApothecary } from '../../lib/altar/workshop';
import type { ScryVessel } from '../../lib/altar/workings/scrying';
import type { AltarDeed } from '../../lib/covens/altarActions';
import { READINGS } from '../../lib/craft/hedge/readings';
import { addEntry } from '../../lib/craft/store';
import { chosenDeck } from '../../lib/divination/decks';
import { drawOptions, drawSpread, meaningOf, readingFromDraw, spreadById } from '../../lib/divination/draw';
import { CraftPanel, GridBar, type CraftActs } from './CraftPanels';

const nowIso = () => new Date().toISOString();

type Deps = {
  doc: AltarDocument | null;
  docRef: { current: AltarDocument | null };
  commit: (next: (d: AltarDocument) => AltarDocument, recordUndo?: boolean) => void;
  selected: number | null;
  setSelected: (i: number | null) => void;
  say: (line: string) => void;
  log: (line: string) => void;
  /** Its moment here, and for the others at a coven altar (useAltarRites show). */
  show: (kind: 'swing' | 'grind' | 'cauldron' | 'grid' | 'cut' | 'draw' | 'charge', uid: string) => void;
  me: string;
  userId: string | null;
  settings: Record<string, unknown> | null;
  /** Keep a setting (with the rest kept); false when there are no settings to keep it in. */
  saveSettings: (change: Record<string, string>) => boolean;
  finishDeed: (kind: AltarDeed) => void;
  toCabinet: (what: string) => void;
  /** Open one of the editor's own sheets: carving, harvesting, the petition box. */
  openSheet: (name: 'carve' | 'potted-harvest' | 'petitions') => void;
  openScry: (vessel: ScryVessel) => void;
  /** Hold a divination's answer in the stage's corner (DivinationResultCard). */
  showResult?: (result: DivinationResult) => void;
  isPottedPlant: (o: SavedObject) => boolean;
  /** The ids of what is chosen while selecting several (null when not choosing). */
  chosenIds: string[] | null;
  stopSelecting: () => void;
};

export function useCraftTools(deps: Deps) {
  const { doc, docRef, commit, selected, say, log, show } = deps;
  const [ritualMode, setRitualMode] = useState(false);
  const place = usePlace();
  const selectedObject = doc && selected != null ? doc.objects[selected] ?? null : null;
  const uidOf = (o: SavedObject | null | undefined) => String(o?.altarObjectId || '');
  const [ownCalibration, setOwnCalibration] = useState<Calibration | null>(null);
  const calibration = ownCalibration ?? readCalibration(deps.settings?.[PENDULUM_SETTING]);
  const herbs = useMemo(() => builtInCabinet.filter((c) => c.category === 'herbs').map((c) => ({ name: c.name, id: c.id })), []);
  const choices = useMemo(() => mortarChoices(doc?.objects ?? [], herbs), [doc?.objects, herbs]);
  const labelOf = (id: string) => shortLabel(doc?.objects.find((o) => o.altarObjectId === id)?.label, 'the candle');
  const cords = doc ? cuttableCords(doc).map((c) => ({ id: c.id, label: `${labelOf(c.a)} and ${labelOf(c.b)}` })) : [];

  const change = (fn: (o: SavedObject, at: string) => SavedObject) => {
    if (selected == null) return;
    const at = nowIso();
    commit((d) => updateObjects(d, [selected], (o) => fn(o, at)));
  };
  const findIndex = (test: (o: SavedObject) => boolean) => (docRef.current?.objects ?? []).findIndex(test);
  const crystalsOf = (list: SavedObject[]) => list.filter((o) => o.type === 'crystal');

  const grid = (stones: SavedObject[]) => {
    const problem = gridProblem(stones);
    if (problem) return say(problem);
    const wand = findIndex((o) => isWand(o));
    const at = nowIso();
    const n = crystalsOf(stones).length;
    commit((d) => ({ ...d, extra: activateGrid(d.extra, stones, at, deps.me || undefined) }));
    log(gridLine(n, wand >= 0));
    show('grid', wand >= 0 ? uidOf(docRef.current?.objects[wand]) : uidOf(stones[0]));
    say(wand >= 0 ? `The grid is lit: ${n} stones, joined by lines of light.` : `The grid is lit: ${n} stones. Set a wand on the altar to activate the next one with it.`);
    deps.finishDeed('grid');
  };

  const act: CraftActs = {
    calibrate: (c: Calibration) => {
      setOwnCalibration(c);
      const kept = deps.saveSettings({ [PENDULUM_SETTING]: encodeCalibration(c) });
      say(kept ? 'The pendulum’s answers are kept. Ask it whenever you like.' : 'The pendulum’s answers are set for now. Sign in to keep them for next time.');
    },
    ask: (question) => {
      if (!calibration || !selectedObject) return null;
      const r = askPendulum(calibration);
      const now = new Date();
      const said = addEntry(READINGS, pendulumReading(question, r.answer, r.swing, now), now);
      // The card shows once the pendulum has swung its answer.
      setTimeout(() => void said.then((e) => deps.showResult?.(pendulumResult(answerLabel(r.answer), question, e.id, now.toISOString()))).catch(() => {}), 3200);
      log(pendulumLine(question, r.answer, r.swing));
      show('swing', uidOf(selectedObject));
      deps.finishDeed('pendulum');
      return r;
    },
    addHerb: (item) => change((o, at) => addToMortar(o, item, at)),
    takeHerb: (label) => change((o, at) => takeFromMortar(o, label, at)),
    grind: () => {
      if (!selectedObject) return;
      const items = mortarOf(selectedObject).items;
      change((o, at) => grindMortar(o, at));
      log(grindLine(items));
      show('grind', uidOf(selectedObject));
      say('Ground into a loose blend.');
      deps.finishDeed('grind');
    },
    placeBlend: () => placeBlend('loose'),
    bagBlend: () => placeBlend('sachet'),
    burnBlend: () => {
      if (!selectedObject) return;
      const items = mortarOf(selectedObject).items;
      const line = burnBlendLine(items);
      const pot = findIndex((o) => isCauldron(o) || /incense-burner|censer/.test(String(o.tool || o.imagePath || '')));
      change((o, at) => emptyMortar(o, at));
      log(line);
      show('cauldron', pot >= 0 ? uidOf(docRef.current?.objects[pot]) : uidOf(selectedObject));
      say(line);
    },
    saveBlend: () => {
      if (!selectedObject) return;
      const item = blendItem(mortarOf(selectedObject).items, 'loose');
      void saveApothecary(deps.userId, item, null)
        .then((saved) => say(`“${saved.name}” is in My Apothecary.`))
        .catch(() => say('That couldn’t be saved just now. Try again in a moment.'));
    },
    emptyMortar: () => change((o, at) => emptyMortar(o, at)),
    cutCord: (id) => {
      const d0 = docRef.current;
      const cord = d0 ? cordsOf(d0).find((c) => c.id === id) : null;
      if (!d0 || !cord) return;
      const at = nowIso();
      commit((d) => cutCord(d, id, at));
      const line = cutLine(labelOf(cord.a), labelOf(cord.b));
      log(line);
      show('cut', uidOf(selectedObject));
      say(`${line} The besom will sweep it away.`);
      deps.finishDeed('cut_cord');
    },
    harvest: () => {
      const i = findIndex((o) => deps.isPottedPlant(o));
      if (i < 0) return deps.toCabinet('potted plant to harvest from');
      deps.setSelected(i);
      deps.openSheet('potted-harvest');
    },
    carve: () => {
      const i = findIndex((o) => isCandle(o) && !isLit(o));
      if (i < 0) return deps.toCabinet('unlit candle to carve');
      deps.setSelected(i);
      deps.openSheet('carve');
    },
    simmer: (items) => {
      change((o, at) => startSimmer(o, items, at));
      log(simmerLine(items));
      show('cauldron', uidOf(selectedObject));
      say('The simmer pot is steaming. It runs about three hours before it wants topping up.');
      deps.finishDeed('simmer');
    },
    unsimmer: () => {
      change((o, at) => stopSimmer(o, at));
      log('Took the simmer pot off.');
    },
    burnPetition: () => {
      say('Choose a petition in the box and burn it; the cauldron takes the ash.');
      deps.openSheet('petitions');
    },
    fillToScry: () => {
      change((o, at) => fillForScrying(o, at));
      log('Filled the cauldron with water to scry in.');
      deps.openScry('cauldron');
    },
    scry: (vessel) => deps.openScry(vessel),
    charge: (how: ChargePlace) => {
      if (!selectedObject) return;
      // The moon only by night, the sun only by day, selenite only touching (crystalCare.ts).
      const gate = chargeGate(selectedObject, how, docRef.current?.objects ?? [], new Date(), place);
      if (!gate.ok) return say(gate.line);
      change((o, at) => startCharging(o, how, at, gate.strength));
      const line = chargeLineFor(shortLabel(selectedObject.label, 'The crystal'), how);
      log(line);
      show('charge', uidOf(selectedObject));
      say(`${line} ${gate.line}${gate.warn ? ` ${gate.warn}` : ''} Its glow builds as it sits.`);
    },
    takeUp: () => {
      if (!selectedObject) return;
      const full = chargingGlow(selectedObject) >= 1;
      change((o, at) => finishCharging(o, at));
      const name = shortLabel(selectedObject.label, 'The crystal');
      log(`${name} was taken up${full ? ', fully charged' : ''}.`);
      say(`${name} is charged. It’s kept in its charging history.`);
      deps.finishDeed('charge_crystal');
    },
    placeSelenite: () => {
      const d0 = docRef.current;
      if (!d0 || !selectedObject) return;
      const piece = seleniteUnder(selectedObject, d0.objects, nowIso());
      if (!piece) return deps.toCabinet('selenite');
      commit((d) => addObject(d, piece));
      log('Set a selenite cluster on the altar, under the stone, to charge it on.');
      say('A selenite cluster is set under the stone. Now choose On selenite.');
    },
    setIntention: (text: string) => {
      if (!selectedObject || !text.trim()) return;
      change((o, at) => setStoneIntention(o, text, at));
      const name = shortLabel(selectedObject.label, 'The crystal');
      log(`${name} was given an intention: ${text.trim()}.`);
      say(`${name} holds it now. Charging it will renew it.`);
    },
    gridAll: () => grid(crystalsOf(docRef.current?.objects ?? [])),
    releaseGrid: () => {
      commit((d) => ({ ...d, extra: releaseGrid(d.extra) }));
      log(GRID_RELEASED);
      say('The grid rests.');
    },
    draw: (question) => void drawHere(selected, question),
  };

  function placeBlend(as: 'loose' | 'sachet') {
    const d0 = docRef.current;
    if (!d0 || selected == null) return;
    const mortar = d0.objects[selected];
    const item = blendItem(mortarOf(mortar).items, as);
    const at = nowIso();
    const object = apothecaryObject(item, d0.objects, at, drawSpot(mortar));
    commit((d) => addObject(updateObjects(d, [selected], (o) => emptyMortar(o, at)), object));
    const line = as === 'sachet' ? `Bagged the ground blend as a sachet: ${item.name}.` : `Set the ground blend on the altar: ${item.name}.`;
    log(line);
    say(line);
  }

  async function drawHere(index: number | null, question: string) {
    const d0 = docRef.current;
    const deck = d0 && index != null ? d0.objects[index] : null;
    const kind = deckKindOf(deck);
    if (!deck || !kind) return;
    const spread = spreadById(DECK_SPREAD[kind]);
    if (!spread) return;
    const draw = drawSpread(spread, drawOptions(deps.settings));
    const now = new Date();
    const reading = readingFromDraw(spread, draw, { question, now, deck: kind === 'tarot' ? chosenDeck(deps.settings) : undefined });
    const entry = await addEntry(READINGS, reading, now);
    const name = draw.items[0]?.name ?? '';
    const laid = (docRef.current?.objects ?? []).filter((o) => o.tool === 'reading' || o.tool === 'rune').length;
    const card = readingObject(entry, `${name}${draw.items[0]?.reversed ? ', reversed' : ''}`, docRef.current?.objects ?? [], now.toISOString(), drawSpot(deck, laid % 4));
    commit((d) => addObject(d, card));
    const items = draw.items.map((i) => ({ name: i.name, reversed: i.reversed, keywords: meaningOf(i)?.meaning.keywords ?? null }));
    deps.showResult?.(drawResult(kind, items, question, entry.id, now.toISOString()));
    const line = drawLine(kind, name);
    log(line);
    show('draw', uidOf(deck));
    say(`${line} It’s laid beside it and kept in your readings.`);
    deps.finishDeed('draw_deck');
  }

  // ── In the panel ────────────────────────────────────────────────────
  const chosenCrystals = deps.chosenIds ? crystalsOf((doc?.objects ?? []).filter((o) => deps.chosenIds!.includes(uidOf(o)))) : [];
  const panels = (
    <>
      {deps.chosenIds && chosenCrystals.length >= GRID_MIN && (
        <GridBar
          count={chosenCrystals.length}
          onActivate={() => {
            grid(chosenCrystals);
            deps.stopSelecting();
          }}
        />
      )}
      {doc && selectedObject && (
        <CraftPanel object={selectedObject} objects={doc.objects} extra={doc.extra ?? {}} calibration={calibration} choices={choices} cords={cords} act={act} />
      )}
    </>
  );

  /** A ritual step's deed at the altar: find the tool and begin. */
  const startDeed = (kind: AltarDeed): boolean => {
    const pick = (test: (o: SavedObject) => boolean, what: string) => {
      const i = findIndex(test);
      if (i < 0) {
        deps.toCabinet(what);
        return -1;
      }
      deps.setSelected(i);
      return i;
    };
    switch (kind) {
      case 'pendulum':
        if (pick(isPendulum, 'pendulum') >= 0) say(calibration ? 'Ask your question, then tap Ask.' : 'First show the pendulum how it says yes, no and maybe.');
        return true;
      case 'scry_mirror': {
        const i = findIndex((o) => isScryingGlass(o));
        if (i >= 0) deps.setSelected(i);
        deps.openScry('mirror');
        return true;
      }
      case 'grind':
        if (pick(isMortar, 'mortar and pestle') >= 0) say('Add herbs and resins, then tap Grind.');
        return true;
      case 'cut_cord': {
        if (pick(isBolline, 'bolline') < 0) return true;
        const d0 = docRef.current;
        if (d0 && !cuttableCords(d0).length) say('No cord is tied on the altar yet. Tie one between two candles first.');
        else say('Choose the cord to cut.');
        return true;
      }
      case 'simmer':
        if (pick(isCauldron, 'cauldron') >= 0) say('Choose what goes in, then start the simmer pot.');
        return true;
      case 'grid': {
        const stones = crystalsOf(docRef.current?.objects ?? []);
        if (stones.length < GRID_MIN) {
          deps.toCabinet(`crystal for a grid (it takes ${GRID_MIN})`);
          return true;
        }
        grid(stones);
        return true;
      }
      case 'draw_deck': {
        const i = pick((o) => !!deckKindOf(o), 'tarot deck, rune bag or ogham staves');
        if (i >= 0) void drawHere(i, '');
        return true;
      }
      default:
        return false;
    }
  };

  // The glow a stone set to charge has built (merged with the charge glow by the editor).
  const building = (now: number): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const o of doc?.objects ?? []) if (o.altarObjectId && chargingOf(o)) out[String(o.altarObjectId)] = Math.max(0.15, chargingGlow(o, now));
    return out;
  };

  return {
    panels,
    startDeed,
    building,
    ritualMode,
    setRitualMode,
    /** Lit candles, for the mirror's reflections. */
    litCandles: (doc?.objects ?? []).filter((o) => isCandle(o) && isLit(o)).length,
  };
}
