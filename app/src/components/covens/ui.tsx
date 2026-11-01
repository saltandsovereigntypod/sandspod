// Pieces the coven screens share: small labels, text with line breaks, the
// report sheet (reports go to the Salt & Sovereignty moderators, never to
// coven leaders), and the coven's shared altar.

import { useRef, useState, type ReactNode } from 'react';
import { Image, PanResponder, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { Button } from '../Button';
import { Sheet } from '../altar/Sheet';
import { Chips, Field, Notice } from '../more/ui';
import { altarImageSource, altarPicture } from '../../lib/altar/assets';
import { AltarImage } from '../altar/AltarImage';
import { ALTAR_ARTWORK } from '../../lib/altar/artworkData';
import { imageRatio } from '../../lib/altar/geometry';
import * as api from '../../lib/covens/api';
import { candleState, errorMessage, REPORT_REASONS, type AltarItem, type ReportReason } from '../../lib/covens/model';
import { colors, fonts, radius, type, fitLines } from '../../theme';

export function Pill({ label, tone }: { label: string; tone?: 'gold' | 'warn' }) {
  return (
    <View style={[styles.pill, tone === 'gold' && styles.pillGold, tone === 'warn' && styles.pillWarn]}>
      <Text style={[styles.pillText, tone === 'gold' && styles.pillTextGold]}>{label}</Text>
    </View>
  );
}

export function Pills({ children }: { children: ReactNode }) {
  return <View style={styles.pills}>{children}</View>;
}

/** Text as it was written: one paragraph per line. */
export function Words({ text, style }: { text: string | null | undefined; style?: object }) {
  const lines = String(text ?? '').split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  return (
    <View style={styles.words}>
      {lines.map((line, i) => (
        <Text key={i} style={[type.body, styles.cream, style]}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export function Spoken({ text }: { text: string }) {
  return (
    <View style={styles.spoken}>
      <Words text={text} style={styles.spokenText} />
    </View>
  );
}

// ─── Reporting ───────────────────────────────────────────────────────────

export type ReportTarget = { target_type: string; target_id?: string | null; coven_id?: string | null; target_user_id?: string | null; label: string };

export function useReport(userId: string | null) {
  const [target, setTarget] = useState<ReportTarget | null>(null);
  const [reason, setReason] = useState<ReportReason>('harassment');
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const open = (next: ReportTarget) => {
    setTarget(next);
    setReason('harassment');
    setDetails('');
    setState('idle');
    setMessage(null);
  };
  const send = async () => {
    if (!target || !userId) return;
    setState('sending');
    try {
      await api.report(userId, target, reason, details);
      setState('sent');
    } catch (error) {
      setMessage(errorMessage(error));
      setState('idle');
    }
  };
  const sheet = (
    <Sheet visible={!!target} title={state === 'sent' ? 'Thank you' : `Report ${target?.label ?? ''}`} onClose={() => setTarget(null)}>
      {state === 'sent' ? (
        <Text style={type.body}>The moderators will look at this. You can also block someone so you no longer see their messages.</Text>
      ) : (
        <View style={styles.gap}>
          <Text style={type.caption}>Reports go to the Salt &amp; Sovereignty moderators, not to the coven’s leaders. The person you report isn’t told who reported them.</Text>
          <Chips label="What’s wrong?" options={REPORT_REASONS} value={reason} onChange={setReason} />
          {(reason === 'self_harm' || reason === 'minor') && (
            <Text style={type.caption}>If someone is in danger right now, please contact local emergency services. Support lines are in More → Support.</Text>
          )}
          <Field label="Anything the moderators should know (optional)" value={details} onChangeText={setDetails} multiline maxLength={2000} />
          <Button label={state === 'sending' ? 'Sending…' : 'Send report'} onPress={send} disabled={state === 'sending'} />
          {message && <Notice>{message}</Notice>}
        </View>
      )}
    </Sheet>
  );
  return { open, sheet };
}

// ─── The shared altar ────────────────────────────────────────────────────

const ASPECT = 4 / 3;
const VIGIL_WICK: [number, number] = [0.508, 0.0534];

// Height over width of the picture (the bundled copy's size; assets.ts fills this in).
const ratioOf = (path: string) => imageRatio(path) ?? 1.4;

function wickOf(path: string): [number, number] {
  const form = /\/candles\/([a-z-]+)\/[^/]+$/i.exec(path)?.[1];
  return (form && ALTAR_ARTWORK.candleWicks[form]) || VIGIL_WICK;
}

/**
 * The coven's altar, as the website draws it: each item stands with its base
 * at (x, y) on a 4:3 stage. Members in good standing can drag things when
 * `onMove` is given; tapping selects.
 */
export function CovenAltarView({
  items,
  background,
  selected,
  onSelect,
  onMove,
}: {
  items: AltarItem[];
  background: string | null;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  onMove?: (id: string, x: number, y: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const height = width / ASPECT;
  const bg = ALTAR_ARTWORK.backgrounds.find((b) => b.id === background);
  const now = Date.now();
  const lit = items.filter((i) => candleState(i, now).lit).length;
  return (
    <View
      style={[styles.stage, { height: height || undefined }]}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessibilityLabel={`The coven altar: ${items.length} ${items.length === 1 ? 'thing' : 'things'} on it, ${lit} ${lit === 1 ? 'candle' : 'candles'} lit`}
    >
      {bg && <Image source={altarImageSource(bg.assetPath) ?? undefined} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />}
      {!!width &&
        [...items]
          .sort((a, b) => a.z - b.z)
          .map((item) => <AltarPiece key={item.id} item={item} stageWidth={width} stageHeight={height} selected={selected === item.id} onSelect={onSelect} onMove={onMove} now={now} />)}
      {!items.length && (
        <View style={styles.empty}>
          <Text style={type.caption}>The coven altar is bare.</Text>
        </View>
      )}
    </View>
  );
}

function AltarPiece({
  item,
  stageWidth,
  stageHeight,
  selected,
  onSelect,
  onMove,
  now,
}: {
  item: AltarItem;
  stageWidth: number;
  stageHeight: number;
  selected: boolean;
  onSelect?: (id: string | null) => void;
  onMove?: (id: string, x: number, y: number) => void;
  now: number;
}) {
  const w = stageWidth * 0.11 * (item.scale || 1);
  const h = w * ratioOf(item.image);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const latest = useRef({ item, stageWidth, stageHeight, onMove, onSelect });
  latest.current = { item, stageWidth, stageHeight, onMove, onSelect };
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => !!latest.current.onMove && Math.abs(g.dx) + Math.abs(g.dy) > 4,
      onPanResponderMove: (_e, g) => {
        if (latest.current.onMove) setDrag({ dx: g.dx, dy: g.dy });
      },
      onPanResponderRelease: (_e, g) => {
        const { item: it, stageWidth: sw, stageHeight: sh, onMove: move, onSelect: select } = latest.current;
        setDrag(null);
        if (move && Math.abs(g.dx) + Math.abs(g.dy) > 4) {
          const x = Math.min(1, Math.max(0, it.x + g.dx / sw));
          const y = Math.min(1, Math.max(0.08, it.y + g.dy / sh));
          move(it.id, Math.round(x * 10000) / 10000, Math.round(y * 10000) / 10000);
        } else select?.(it.id);
      },
      onPanResponderTerminate: () => setDrag(null),
    }),
  ).current;
  const flame = candleState(item, now);
  const [wx, wy] = wickOf(item.image);
  const picture = altarPicture(item.image);
  const label = `${item.label || (item.kind === 'candle' ? 'Candle' : 'Offering')}${item.kind === 'candle' ? (flame.lit ? `, lit, ${flame.minutesLeft} minutes left` : flame.burntOut ? ', burnt down' : ', unlit') : ''}`;
  return (
    <View
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onAccessibilityTap={() => onSelect?.(item.id)}
      style={[
        styles.piece,
        {
          width: w,
          height: h,
          left: item.x * stageWidth - w / 2 + (drag?.dx ?? 0),
          top: item.y * stageHeight - h + (drag?.dy ?? 0),
          zIndex: 10 + item.z,
          transform: [{ rotate: `${item.rotation || 0}deg` }],
        },
        selected && styles.pieceSelected,
      ]}
    >
      {picture && <AltarImage picture={picture} style={[styles.pieceImage, flame.burntOut && styles.burnt]} resizeMode="contain" />}
      {flame.lit && (
        <View pointerEvents="none" style={[styles.flame, { left: wx * w - w * 0.11, top: wy * h - w * 0.42, width: w * 0.22, height: w * 0.46, opacity: 0.55 + 0.45 * flame.remaining }]}>
          <View style={styles.flameCore} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { borderRadius: radius.chip, borderWidth: 1, borderColor: 'rgba(226,195,109,0.4)', paddingHorizontal: 10, paddingVertical: 3 },
  pillGold: { backgroundColor: colors.gold, borderColor: colors.gold },
  pillWarn: { borderColor: 'rgba(243,160,110,0.7)' },
  pillText: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted },
  pillTextGold: { color: colors.forestInk, fontFamily: fonts.bodySemi },
  words: { gap: 8 },
  cream: { color: colors.cream },
  spoken: { borderLeftWidth: 2, borderLeftColor: colors.gold, paddingLeft: 12 },
  spokenText: fitLines({ fontFamily: fonts.displayItalic, fontSize: 20, lineHeight: 27 }),
  gap: { gap: 12 },
  stage: { width: '100%', aspectRatio: ASPECT, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.goldLine, backgroundColor: '#15130d' },
  empty: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  piece: { position: 'absolute' },
  pieceSelected: { shadowColor: colors.gold, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  pieceImage: { width: '100%', height: '100%' },
  burnt: { opacity: 0.55 },
  flame: {
    position: 'absolute',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: 'rgba(255,154,46,0.85)',
    shadowColor: '#ffc45a',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  flameCore: { width: '55%', height: '55%', borderRadius: 999, backgroundColor: '#fff3c4', marginBottom: '12%' },
});
