// Practice tools on the altar: place one of your stones (Crystal), a plant
// from your garden (Green) or tonight's card or rune (Hedge readings), and the
// object panel sections that show where each came from. A cleansing logged on
// the altar can be added to the stone's own care log in Crystal.

import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../Button';
import { SETTINGS, STONES } from '../../../lib/craft/crystal/collections';
import { normaliseRule, normaliseStone, type CrystalSettings, type Stone } from '../../../lib/craft/crystal/stones';
import { asPlant, PLANTS, type Plant } from '../../../lib/craft/green/garden';
import { methodLabel, normalizeReading, READINGS, sortReadings, type Reading } from '../../../lib/craft/hedge/readings';
import { updateEntry, useCraft } from '../../../lib/craft/store';
import {
  careWarnings,
  drawnOf,
  plantChoices,
  plantIdOf,
  plantObject,
  plantPanel,
  readingIdOf,
  readingObject,
  readingPanel,
  recentCare,
  stoneCareFromAltar,
  stoneIdOf,
  stoneObject,
  stonePanel,
  tonightsReading,
} from '../../../lib/altar/connect/practice';
import type { SavedObject } from '../../../lib/altar/types';
import { fullDate } from '../../../lib/calendar';
import { type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { connectStyles, Eyebrow, nowIso, PanelSection, Row, type AltarRef } from './common';

type SheetProps = { visible: boolean; altar: AltarRef; onClose: () => void; onPlace: (object: SavedObject) => void };

function EmptyTool({ text, label, href, onClose }: { text: string; label: string; href: string; onClose: () => void }) {
  return (
    <View style={connectStyles.gap}>
      <Text style={connectStyles.body}>{text}</Text>
      <Button
        label={label}
        variant="outline"
        onPress={() => {
          onClose();
          router.push(href as Href);
        }}
      />
    </View>
  );
}

const onAltar = (objects: SavedObject[], id: string, of: (o: SavedObject) => string) => objects.some((o) => of(o) === id);

// ── Stones ────────────────────────────────────────────────────────────────

/** Place one of your own stones as a crystal on the altar. */
export function StoneSheet({ visible, altar, onClose, onPlace }: SheetProps) {
  const { entries, ready } = useCraft<Stone>(STONES);
  const { entries: settings } = useCraft<CrystalSettings>(SETTINGS);
  const rule = useMemo(() => normaliseRule(settings[0]?.data?.cleanse), [settings]);
  const now = useMemo(() => new Date(), []);
  return (
    <Sheet visible={visible} eyebrow="From your stones" title="Set a stone on the altar" onClose={onClose}>
      {ready && entries.length === 0 ? (
        <EmptyTool text="Your stones live in Crystal → My stones, with when each was last cleansed. Add one there and it can sit on your altar." label="Open My stones" href="/rituals/craft/crystal/stones" onClose={onClose} />
      ) : (
        <View style={connectStyles.gap}>
          {entries.map((entry) => {
            const stone = normaliseStone(entry.data);
            const status = stonePanel(stone, rule, now);
            const here = onAltar(altar.objects, entry.id, stoneIdOf);
            return (
              <Row
                key={entry.id}
                title={stone.name}
                detail={[status.status, here ? 'already on this altar' : ''].filter(Boolean).join(' · ')}
                onPress={() => {
                  onPlace(stoneObject(entry, altar.objects, nowIso()));
                  onClose();
                }}
              />
            );
          })}
        </View>
      )}
    </Sheet>
  );
}

type StonePanelProps = {
  object: SavedObject;
  altarName?: string;
  /**
   * The most recent cleansing or charge recorded on this crystal on the
   * altar (devotion careForCrystal), offered to the stone's own log. Pass
   * null when there isn't one.
   */
  lastAltarCare?: { kind: 'cleansed' | 'charged'; at: string; methods: string[]; intention?: string; note?: string } | null;
};

/** The object panel section for a stone from your collection: its cleansing and care. */
export function StonePanelSection({ object, altarName, lastAltarCare }: StonePanelProps) {
  const id = stoneIdOf(object);
  const { entries } = useCraft<Stone>(STONES);
  const { entries: settings } = useCraft<CrystalSettings>(SETTINGS);
  const [saved, setSaved] = useState<string | null>(null);
  const entry = entries.find((e) => e.id === id);
  if (!id) return null;
  if (!entry) {
    return (
      <PanelSection title="One of your stones">
        <Text style={connectStyles.body}>This stone isn’t in My stones on this phone any more.</Text>
      </PanelSection>
    );
  }
  const stone = normaliseStone(entry.data);
  const panel = stonePanel(stone, normaliseRule(settings[0]?.data?.cleanse), new Date());
  const logged = !!lastAltarCare && stone.care.some((c) => c.kind === lastAltarCare.kind && c.at === lastAltarCare.at);
  const warnings = lastAltarCare ? careWarnings(stone, lastAltarCare.methods) : [];
  const addToLog = async () => {
    if (!lastAltarCare) return;
    await updateEntry(STONES, entry.id, stoneCareFromAltar(stone, { ...lastAltarCare, altarName }));
    setSaved(lastAltarCare.kind === 'cleansed' ? 'Added to its cleansing log in Crystal.' : 'Added to its care log in Crystal.');
  };
  return (
    <PanelSection title="One of your stones">
      <Text style={panel.due ? connectStyles.value : connectStyles.body}>{panel.status}</Text>
      {panel.badges.length > 0 && <Text style={type.caption}>{panel.badges.join(' · ')}</Text>}
      {panel.intentions.length > 0 && <Text style={type.caption}>{`Held for ${panel.intentions.join(', ')}`}</Text>}
      {recentCare(stone, 2).map((c) => (
        <Text key={c.id} style={type.caption}>{`${c.kind === 'cleansed' ? 'Cleansed' : c.kind === 'charged' ? 'Charged' : 'Programmed'} ${fullDate(c.at) ?? ''}${c.method ? ` · ${c.method}` : ''}`}</Text>
      ))}
      {warnings.map((w) => (
        <Text key={w} style={connectStyles.problem}>
          {w}
        </Text>
      ))}
      <ChipRow>
        {lastAltarCare && !logged && !saved && <Chip label={lastAltarCare.kind === 'cleansed' ? 'Add this cleansing to its log' : 'Add this charge to its log'} symbol="✓" onPress={() => void addToLog()} />}
        <Chip label="Its page in Crystal" onPress={() => router.push(`/rituals/craft/crystal/stone?id=${entry.id}` as Href)} />
      </ChipRow>
      {saved && <Text style={type.caption}>{saved}</Text>}
    </PanelSection>
  );
}

// ── Plants ────────────────────────────────────────────────────────────────

/** Bring a plant from your garden to the altar, as a sprig or loose. */
export function PlantSheet({ visible, altar, onClose, onPlace }: SheetProps) {
  const { entries, ready } = useCraft<Plant>(PLANTS);
  const [form, setForm] = useState<'sprig' | 'loose'>('sprig');
  const list = useMemo(() => plantChoices(entries), [entries]);
  return (
    <Sheet visible={visible} eyebrow="From your garden" title="Bring a plant to the altar" onClose={onClose}>
      {ready && list.length === 0 ? (
        <EmptyTool text="Your plants live in Green → My garden. Add what you grow there and you can bring a sprig of it here." label="Open My garden" href="/rituals/craft/green/garden" onClose={onClose} />
      ) : (
        <>
          <ChipRow>
            <Chip label="A fresh sprig" active={form === 'sprig'} onPress={() => setForm('sprig')} />
            <Chip label="Dried, loose" active={form === 'loose'} onPress={() => setForm('loose')} />
          </ChipRow>
          <View style={connectStyles.gap}>
            {list.map((entry) => {
              const p = plantPanel(asPlant(entry.data));
              return (
                <Row
                  key={entry.id}
                  title={p.name}
                  detail={[p.herb, p.place, p.growing ? '' : 'gone'].filter(Boolean).join(' · ') || undefined}
                  onPress={() => {
                    onPlace(plantObject(entry, altar.objects, nowIso(), form));
                    onClose();
                  }}
                />
              );
            })}
          </View>
        </>
      )}
    </Sheet>
  );
}

export function PlantPanelSection({ object }: { object: SavedObject }) {
  const id = plantIdOf(object);
  const { entries } = useCraft<Plant>(PLANTS);
  const entry = entries.find((e) => e.id === id);
  if (!id) return null;
  if (!entry) return <PanelSection title="From your garden"><Text style={connectStyles.body}>This plant isn’t in My garden on this phone any more.</Text></PanelSection>;
  const p = plantPanel(asPlant(entry.data));
  return (
    <PanelSection title="From your garden">
      <Text style={connectStyles.value}>{p.name}</Text>
      {(p.place || p.last) && <Text style={type.caption}>{[p.place, p.last].filter(Boolean).join(' · ')}</Text>}
      <ChipRow>
        <Chip label="Its page in Green" onPress={() => router.push(`/rituals/craft/green/plant/${entry.id}` as Href)} />
      </ChipRow>
    </PanelSection>
  );
}

// ── Readings ──────────────────────────────────────────────────────────────

/** Tonight's card or rune (or one from an earlier reading) as a small tool on the altar. */
export function ReadingSheet({ visible, altar, onClose, onPlace }: SheetProps) {
  const { entries, ready } = useCraft<Reading>(READINGS);
  const now = useMemo(() => new Date(), []);
  const tonight = useMemo(() => tonightsReading(entries, now), [entries, now]);
  const earlier = useMemo(() => sortReadings(entries.map((e) => ({ ...e, data: normalizeReading(e.data) }))).filter((e) => e.id !== tonight?.id && e.data.drawn.length).slice(0, 8), [entries, tonight]);
  const t = tonight ? normalizeReading(tonight.data) : null;
  const place = (entry: (typeof entries)[number], drawn: string) => {
    onPlace(readingObject(entry, drawn, altar.objects, nowIso()));
    onClose();
  };
  return (
    <Sheet visible={visible} eyebrow="From your readings" title="Tonight’s card or rune" onClose={onClose}>
      {ready && !tonight ? (
        <EmptyTool text="Draw a card or a rune and keep it in Hedge → Readings; then it can sit on your altar while you sit with it." label="Open Readings" href="/rituals/craft/hedge/readings" onClose={onClose} />
      ) : tonight && t ? (
        <>
          <View style={connectStyles.gap}>
            <Eyebrow>{`${methodLabel(t.method)} · ${fullDate(t.date) ?? t.date}`}</Eyebrow>
            {!!t.question && <Text style={connectStyles.quote}>{t.question}</Text>}
            <ChipRow>
              {t.drawn.map((name) => (
                <Chip key={name} label={name} symbol="✦" accessibilityLabel={`Set ${name} on the altar`} onPress={() => place(tonight, name)} />
              ))}
            </ChipRow>
          </View>
          {earlier.length > 0 && (
            <View style={connectStyles.gap}>
              <Eyebrow>Earlier readings</Eyebrow>
              {earlier.map((e) => (
                <Row key={e.id} title={e.data.drawn.join(', ')} detail={`${methodLabel(e.data.method)} · ${fullDate(e.data.date) ?? e.data.date}`} onPress={() => place(e, e.data.drawn[0])} />
              ))}
            </View>
          )}
        </>
      ) : null}
    </Sheet>
  );
}

export function ReadingPanelSection({ object }: { object: SavedObject }) {
  const id = readingIdOf(object);
  const { entries } = useCraft<Reading>(READINGS);
  const entry = entries.find((e) => e.id === id);
  if (!id) return null;
  if (!entry) return <PanelSection title="From a reading"><Text style={connectStyles.body}>{`${drawnOf(object) || 'This card'}: its reading isn’t on this phone any more.`}</Text></PanelSection>;
  const p = readingPanel(entry.data, drawnOf(object));
  return (
    <PanelSection title="From a reading">
      <Text style={connectStyles.value}>{p.title}</Text>
      <Text style={type.caption}>{`${p.method} · ${fullDate(p.date) ?? p.date}`}</Text>
      {!!p.question && <Text style={connectStyles.quote}>{p.question}</Text>}
      {!!p.meaning && <Text style={connectStyles.body}>{p.meaning}</Text>}
      <ChipRow>
        <Chip label="The reading" onPress={() => router.push(`/rituals/craft/hedge/readings/${entry.id}` as Href)} />
      </ChipRow>
    </PanelSection>
  );
}
