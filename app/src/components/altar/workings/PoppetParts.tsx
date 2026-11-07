// The poppet customiser's pieces (lib/altar/workings/poppetLook): the
// figure as it looks, choosers for its body, dye, eyes, stuffing, taglock and
// seal, and the pin board, where a tap on the body (or a place chosen from
// the list) sets a coloured pin with a note. Used by the making sheet and by
// the sheet that tends it on the altar.

import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../Button';
import { builtInCabinet } from '../../../lib/altar/cabinet';
import { keywordLine } from '../../../lib/altar/cabinetKeywords';
import type { PoppetBody, PoppetLook, PoppetPin } from '../../../lib/altar/workings/poppet';
import { makePin, pinWords } from '../../../lib/altar/workings/poppet';
import {
  artBodyOf,
  bodyToPicture,
  BODY_COLOURS,
  colourMeaning,
  EYES,
  MATERIAL_HISTORY,
  MAX_PINS,
  pictureToBody,
  PIN_COLOURS,
  pinColour,
  poppetPlan,
  SEALS,
  snapPin,
  STUFFINGS,
  TAGLOCKS,
  ZONES,
  zonePoint,
  type PinZone,
} from '../../../lib/altar/workings/poppetLook';
import { useShelves } from '../../../lib/shelves/store';
import { colors, touch, type } from '../../../theme';
import { PoppetFigure } from '../PoppetFigure';
import { Chip, ChipRow } from '../Chip';
import { Field, Label, nowIso, sheetStyles } from './common';

const rgb = (c: number[]) => `rgb(${c.join(',')})`;

/** What a cabinet herb or stone is used for, by its name ("Protection · Sleep · Dreams"), or ''. */
export function usesOf(label: string): string {
  const name = label.trim().toLowerCase();
  const item = builtInCabinet.find((i) => i.name.toLowerCase() === name && (i.category === 'herbs' || i.category === 'crystals'));
  return item ? keywordLine(item.keywords, 3) : '';
}

/** A coloured round to choose, its name read aloud. */
function Swatch({ color, label, active, onPress }: { color: string; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }} onPress={onPress} style={[styles.swatchHit, active && styles.swatchOn]}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
    </Pressable>
  );
}

// ─── The figure, and the pin board ────────────────────────────────────────

type Pending = { x: number; y: number; zone: PinZone | 'free' };

/** The poppet as it looks, with its pins; tap the body to choose where a pin goes. */
export function PinBoard({ look, pins, pending, onTap, width = 230, height = 300 }: { look: PoppetLook; pins: PoppetPin[]; pending?: Pending | null; onTap?: (p: Pending) => void; width?: number; height?: number }) {
  const plan = useMemo(() => poppetPlan(look, []), [look]);
  const body = artBodyOf(look.body);
  if (!plan || !body) return null;
  // Where the picture sits in the box (contained, centred).
  const fit = Math.min(width / plan.width, height / plan.height);
  const pw = plan.width * fit;
  const ph = plan.height * fit;
  const left = (width - pw) / 2;
  const top = (height - ph) / 2;
  const marker = pending ? bodyToPicture(body, pending.x, pending.y) : null;
  return (
    <View style={styles.center}>
      <Pressable
        accessibilityRole={onTap ? 'button' : 'image'}
        accessibilityLabel={onTap ? 'The poppet. Tap where the pin should go, or choose a place below.' : 'The poppet'}
        disabled={!onTap}
        onPress={(e) => {
          if (!onTap) return;
          const [bx, by] = pictureToBody(body, (e.nativeEvent.locationX - left) / pw, (e.nativeEvent.locationY - top) / ph);
          onTap(snapPin(body, bx, by));
        }}
        style={{ width, height }}
      >
        <PoppetFigure look={look} pins={pins} width={width} height={height} />
        {marker && <View pointerEvents="none" style={[styles.marker, { left: left + marker[0] * pw - 11, top: top + marker[1] * ph - 11 }]} />}
      </Pressable>
    </View>
  );
}

/** Choose a place, a colour and a note, and set the pin. */
export function PinMaker({ look, pins, onSet, label = 'Set the pin' }: { look: PoppetLook; pins: PoppetPin[]; onSet: (pin: PoppetPin) => void; label?: string }) {
  const body = artBodyOf(look.body);
  const [pending, setPending] = useState<Pending | null>(null);
  const [colour, setColour] = useState('white');
  const [note, setNote] = useState('');
  if (!body) return <Text style={type.caption}>A paper poppet has no picture to pin; write what each pin is for on the paper itself.</Text>;
  const zone = ZONES.find((z) => z.key === pending?.zone);
  const full = pins.length >= MAX_PINS;
  return (
    <View style={sheetStyles.section}>
      <PinBoard look={look} pins={pins} pending={pending} onTap={full ? undefined : setPending} />
      <Text style={type.caption}>Tap the body where the pin goes, or choose a place.</Text>
      <ChipRow>
        {ZONES.map((z) => (
          <Chip
            key={z.key}
            label={z.label}
            active={pending?.zone === z.key}
            onPress={() => {
              if (z.key === 'free') return setPending({ x: 0.5, y: 0.47, zone: 'free' });
              const [x, y] = zonePoint(body, z.key);
              setPending({ x, y, zone: z.key });
            }}
          />
        ))}
      </ChipRow>
      {zone && <Text style={type.caption}>{`${zone.label}: ${zone.meaning.toLowerCase()}.`}</Text>}
      <Label>Its colour</Label>
      <View style={styles.swatches}>
        {PIN_COLOURS.map((c) => (
          <Swatch key={c.key} color={rgb(c.rgb)} label={`${c.label} pin: ${c.meaning}`} active={colour === c.key} onPress={() => setColour(c.key)} />
        ))}
      </View>
      <Text style={sheetStyles.body}>{`${pinColour(colour).label}: ${pinColour(colour).meaning.toLowerCase()}.`}</Text>
      <Field label="A short note (optional)" value={note} onChangeText={setNote} placeholder="What this pin is for" maxLength={120} />
      {full ? (
        <Text style={type.caption}>It holds as many pins as it can.</Text>
      ) : (
        <Button
          label={label}
          disabled={!pending}
          onPress={() => {
            if (!pending) return;
            onSet(makePin(pending, colour, note, nowIso()));
            setPending(null);
            setNote('');
          }}
        />
      )}
    </View>
  );
}

/** The pins in it, each with a way to take it out. */
export function PinList({ pins, onRemove, removeLabel = 'Take out' }: { pins: PoppetPin[]; onRemove?: (index: number) => void; removeLabel?: string }) {
  if (!pins.length) return null;
  return (
    <View style={sheetStyles.section}>
      {pins.map((p, i) => (
        <View key={`${p.at}-${i}`} style={[sheetStyles.between, styles.pinRow]}>
          <View style={styles.pinText}>
            <Text style={sheetStyles.value}>{pinWords({ ...p, note: '' })}</Text>
            <Text style={type.caption}>{p.note || p.meaning}</Text>
          </View>
          {onRemove && <Chip label={removeLabel} accessibilityLabel={`${removeLabel}: ${pinWords(p)}`} onPress={() => onRemove(i)} />}
        </View>
      ))}
    </View>
  );
}

// ─── Choosing the look ────────────────────────────────────────────────────

export function BodyChooser({ bodies, body, onBody }: { bodies: { key: PoppetBody; label: string; line: string }[]; body: PoppetBody; onBody: (b: PoppetBody) => void }) {
  const chosen = bodies.find((b) => b.key === body);
  return (
    <View style={sheetStyles.section}>
      <ChipRow>
        {bodies.map((b) => (
          <Chip key={b.key} label={b.label} active={body === b.key} onPress={() => onBody(b.key)} />
        ))}
      </ChipRow>
      {chosen && <Text style={sheetStyles.body}>{chosen.line}</Text>}
      {MATERIAL_HISTORY[body] && <Text style={type.caption}>{MATERIAL_HISTORY[body]}</Text>}
    </View>
  );
}

export function ColourChooser({ look, onColour }: { look: PoppetLook; onColour: (c: string) => void }) {
  const body = artBodyOf(look.body);
  const subtle = body === 'clay' || body === 'husk' || body === 'root';
  const chosen = BODY_COLOURS.find((c) => c.key === look.colour);
  return (
    <View style={sheetStyles.section}>
      <Label>{subtle ? 'A touch of colour (optional)' : 'Its colour'}</Label>
      <View style={styles.swatches}>
        <Swatch color={body === 'wax' ? '#e8d6a0' : body === 'clay' ? '#b8613c' : body === 'husk' ? '#d8bd78' : body === 'root' ? '#a88a5c' : '#e3dbc6'} label="Undyed: its own colour" active={!chosen} onPress={() => onColour('')} />
        {BODY_COLOURS.map((c) => (
          <Swatch key={c.key} color={rgb(c.rgb)} label={`${c.label}: ${colourMeaning(c.key)}`} active={chosen?.key === c.key} onPress={() => onColour(c.key)} />
        ))}
      </View>
      <Text style={sheetStyles.body}>{chosen ? `${chosen.label}, as its candle: ${colourMeaning(chosen.key).toLowerCase()}.` : 'Undyed: its own colour.'}</Text>
      {subtle && <Text style={type.caption}>Clay, husk and root keep their own colour; a dye only warms or cools it a little.</Text>}
    </View>
  );
}

export function EyeChooser({ eyes, onEyes }: { eyes: string | undefined; onEyes: (e: string) => void }) {
  const chosen = EYES.find((e) => e.key === eyes) ?? EYES[0];
  return (
    <View style={sheetStyles.section}>
      <Label>Its eyes</Label>
      <ChipRow>
        {EYES.map((e) => (
          <Chip key={e.key} label={e.label} active={chosen.key === e.key} onPress={() => onEyes(e.key)} />
        ))}
      </ChipRow>
      <Text style={sheetStyles.body}>{chosen.meaning}</Text>
      <Text style={type.caption}>These meanings are mostly modern practice rather than old record.</Text>
    </View>
  );
}

/** Stuffing: what fills it, and things from your shelves to add, each with what it's used for. */
export function StuffingChooser({ stuffing, onStuffing, chosen, onAdd }: { stuffing: string | undefined; onStuffing: (s: string) => void; chosen: string[]; onAdd: (label: string, kind: 'herb' | 'stone') => void }) {
  const { entries } = useShelves();
  const taken = new Set(chosen.map((c) => c.toLowerCase()));
  const shelf = entries
    .map((e) => e.item)
    .filter((i) => (i.shelf === 'herbs' || i.shelf === 'crystals') && !taken.has(i.name.toLowerCase()))
    .slice(0, 10);
  const base = STUFFINGS.find((s) => s.key === stuffing);
  return (
    <View style={sheetStyles.section}>
      <Label>What fills it</Label>
      <ChipRow>
        {STUFFINGS.map((s) => (
          <Chip key={s.key} label={s.label} active={stuffing === s.key} onPress={() => onStuffing(stuffing === s.key ? '' : s.key)} />
        ))}
      </ChipRow>
      {base && <Text style={type.caption}>{base.note}</Text>}
      {shelf.length > 0 && (
        <>
          <Label>From your shelves</Label>
          {shelf.map((i) => {
            const cabinet = builtInCabinet.find((c) => c.id === i.cabinetKey.split('|')[0]);
            const uses = cabinet ? keywordLine(cabinet.keywords, 3) : usesOf(i.name);
            return (
              <Pressable key={i.name} accessibilityRole="button" accessibilityLabel={`Add ${i.name}${uses ? `, used for ${uses}` : ''}`} onPress={() => onAdd(i.name, i.shelf === 'crystals' ? 'stone' : 'herb')} style={styles.shelfRow}>
                <Text style={sheetStyles.value}>{`+ ${i.name}`}</Text>
                {!!uses && <Text style={type.caption}>{uses}</Text>}
              </Pressable>
            );
          })}
        </>
      )}
    </View>
  );
}

export function LinkChooser({ taglock, onTaglock }: { taglock: string | undefined; onTaglock: (t: string) => void }) {
  const chosen = TAGLOCKS.find((t) => t.key === taglock);
  return (
    <View style={sheetStyles.section}>
      <Label>What links it</Label>
      <ChipRow>
        {TAGLOCKS.map((t) => (
          <Chip key={t.key} label={t.label} active={taglock === t.key} onPress={() => onTaglock(t.key)} />
        ))}
      </ChipRow>
      {chosen && <Text style={type.caption}>{chosen.note}</Text>}
      <Text style={type.caption}>Only the kind of link is noted here. No photo, hair or name is kept in the app.</Text>
    </View>
  );
}

export function SealChooser({ seal, onSeal }: { seal: string | undefined; onSeal: (s: string) => void }) {
  const chosen = SEALS.find((s) => s.key === seal);
  return (
    <View style={sheetStyles.section}>
      <Label>How it’s sealed</Label>
      <ChipRow>
        {SEALS.map((s) => (
          <Chip key={s.key} label={s.label} active={seal === s.key} onPress={() => onSeal(s.key)} />
        ))}
      </ChipRow>
      {chosen && <Text style={type.caption}>{chosen.note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center' },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  swatchHit: { width: touch, height: touch, borderRadius: touch / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: colors.gold },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.hairline },
  marker: { position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.gold, backgroundColor: 'rgba(226,195,109,0.2)' },
  pinRow: { borderTopWidth: 1, borderTopColor: colors.hairline, paddingTop: 8 },
  pinText: { flex: 1, gap: 2 },
  shelfRow: { minHeight: touch, justifyContent: 'center', gap: 2, borderTopWidth: 1, borderTopColor: colors.hairline, paddingVertical: 6 },
});
