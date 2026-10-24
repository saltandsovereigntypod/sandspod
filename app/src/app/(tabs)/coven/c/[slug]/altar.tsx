import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { CovenAltarView, useReport } from '../../../../../components/covens/ui';
import { Card, CheckRow, Chips, Field, Notice, Section } from '../../../../../components/more/ui';
import { websiteAssetKey } from '../../../../../lib/altar/assetPaths';
import { altarPicture } from '../../../../../lib/altar/assets';
import { AltarImage } from '../../../../../components/altar/AltarImage';
import { ALTAR_ARTWORK } from '../../../../../lib/altar/artworkData';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { CANDLE_COLORS, CANDLE_FORMS, candleImage, candleState, errorMessage, SWATCH, type AltarItem } from '../../../../../lib/covens/model';
import { colors, fonts, radius, type } from '../../../../../theme';

type Category = keyof typeof ALTAR_ARTWORK.items;
const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'herbs', label: 'Herbs' },
  { value: 'crystals', label: 'Crystals' },
  { value: 'tools', label: 'Tools' },
  { value: 'vessels', label: 'Vessels' },
  { value: 'deities', label: 'Deities' },
];
const BURNS = [
  { value: '15', label: '15 min' },
  { value: '60', label: '1 hour' },
  { value: '180', label: '3 hours' },
  { value: '720', label: '12 hours' },
  { value: '1440', label: 'A day' },
] as const;

// The coven's shared altar, the same one the website shows. Members in good
// standing set candles and offerings on it, light and snuff them, and move
// them; what one person does, everyone here sees.
export default function CovenAltar() {
  const coven = useCoven();
  const report = useReport(coven.userId);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [color, setColor] = useState<string>('white');
  const [form, setForm] = useState<string>('vigil');
  const [burn, setBurn] = useState<(typeof BURNS)[number]['value']>('60');
  const [lightNow, setLightNow] = useState(true);
  const [intention, setIntention] = useState('');
  const [category, setCategory] = useState<Category>('herbs');
  const [search, setSearch] = useState('');
  const covenId = coven.snapshot?.coven.id;
  const items = coven.altar;
  const canTend = coven.standing.ok || coven.perms.site;
  const { loadAltar, track } = coven;

  useEffect(() => {
    if (!covenId) return;
    loadAltar().catch((error) => setMessage(errorMessage(error)));
    track('altar');
    return () => track('coven');
  }, [covenId, loadAltar, track]);

  // Flames burn down while you watch.
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const cabinet = useMemo(() => {
    const words = search.toLowerCase().split(/\s+/).filter(Boolean);
    return (ALTAR_ARTWORK.items[category] ?? [])
      .flatMap((item) => {
        const forms = (item.forms ?? []).filter((f) => f.image);
        return forms.map((f) => ({ name: forms.length > 1 ? `${item.name} · ${f.label}` : item.name, image: `/${websiteAssetKey(f.image!) ?? ''}`, keywords: item.keywords ?? [] }));
      })
      .filter((entry) => entry.image !== '/' && words.every((w) => `${entry.name} ${entry.keywords.join(' ')}`.toLowerCase().includes(w)))
      .slice(0, 40);
  }, [category, search]);

  const save = async (id: string, changes: Partial<AltarItem>) => {
    coven.setAltar((list) => list.map((i) => (i.id === id ? { ...i, ...changes } : i)));
    try {
      const saved = await api.tendAltarItem(id, changes);
      coven.setAltar((list) => list.map((i) => (i.id === id ? saved : i)));
    } catch (error) {
      setMessage(errorMessage(error));
      void loadAltar();
    }
  };

  const place = async (row: Partial<AltarItem>) => {
    if (!covenId) return;
    setMessage(null);
    const list = items ?? [];
    try {
      const saved = await api.placeOnAltar({ coven_id: covenId, z: Math.max(0, ...list.map((i) => i.z || 0)) + 1, x: 0.35 + Math.random() * 0.3, y: 0.78 + Math.random() * 0.12, ...row });
      coven.setAltar((prev) => (prev.some((i) => i.id === saved.id) ? prev : [...prev, saved]));
      setSelected(saved.id);
      setIntention('');
      setMessage('Set on the altar.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  const item = items?.find((i) => i.id === selected) ?? null;
  const flame = item ? candleState(item) : null;
  const canClear = !!item && (item.placed_by === coven.userId || coven.perms.moderate || coven.perms.site);
  const formLabel = CANDLE_FORMS.find((f) => f.id === form)?.label ?? 'Candle';

  return (
    <CovenScreen title="Shared altar" need="standing" onRefresh={loadAltar}>
      {!items ? (
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      ) : (
        <CovenAltarView items={items} background={coven.snapshot?.coven.altar_background ?? null} selected={selected} onSelect={setSelected} onMove={canTend ? (id, x, y) => void save(id, { x, y }) : undefined} />
      )}
      <Text style={type.caption}>{canTend ? 'Tap something to tend it; drag to move it.' : 'Tap something to see who set it there.'}</Text>

      {item && flame && (
        <Card>
          <Text style={type.cardTitle}>{item.label || (item.kind === 'candle' ? 'Candle' : 'Offering')}</Text>
          <Text style={type.caption}>Set here by {coven.nameOf(item.placed_by)}</Text>
          {!!item.intention && <Text style={[type.body, styles.intention]}>“{item.intention}”</Text>}
          {item.kind === 'candle' && (
            <Text style={type.caption}>{flame.lit ? `Lit by ${coven.nameOf(item.lit_by)} · ${flame.minutesLeft} min left` : flame.burntOut ? 'Burnt down' : 'Unlit'}</Text>
          )}
          {canTend && (
            <View style={styles.row}>
              {item.kind === 'candle' && (
                <Button
                  label={flame.lit ? 'Snuff' : flame.burntOut ? 'Light a fresh flame' : 'Light'}
                  variant={flame.lit ? 'outline' : 'primary'}
                  onPress={async () => {
                    // A burnt-down candle is still marked lit; put it out first so the new flame gets a fresh start.
                    if (flame.burntOut) await save(item.id, { lit: false });
                    await save(item.id, { lit: !flame.lit });
                  }}
                />
              )}
              <Button label="Larger" variant="pill" onPress={() => void save(item.id, { scale: Math.min(2.5, Math.round((item.scale + 0.15) * 100) / 100) })} />
              <Button label="Smaller" variant="pill" onPress={() => void save(item.id, { scale: Math.max(0.4, Math.round((item.scale - 0.15) * 100) / 100) })} />
              <Button label="Turn" variant="pill" onPress={() => void save(item.id, { rotation: item.rotation + 15 > 180 ? item.rotation + 15 - 360 : item.rotation + 15 })} />
              <Button label="Bring forward" variant="pill" onPress={() => void save(item.id, { z: Math.max(0, ...(items ?? []).map((i) => i.z || 0)) + 1 })} />
            </View>
          )}
          <View style={styles.row}>
            {canClear && (
              <Button
                label="Clear away"
                variant="text"
                onPress={async () => {
                  try {
                    await api.clearAltarItem(item.id);
                    coven.setAltar((list) => list.filter((i) => i.id !== item.id));
                    setSelected(null);
                  } catch (error) {
                    setMessage(errorMessage(error));
                  }
                }}
              />
            )}
            {!!item.placed_by && item.placed_by !== coven.userId && (
              <Button label="Report" variant="text" onPress={() => report.open({ target_type: 'altar_item', target_id: item.id, coven_id: item.coven_id, target_user_id: item.placed_by, label: 'this altar offering' })} />
            )}
          </View>
        </Card>
      )}
      {message && <Notice>{message}</Notice>}

      {canTend && (
        <>
          <Section label="Set a candle">
            <View style={styles.swatches} accessibilityRole="radiogroup" accessibilityLabel="Candle colour">
              {CANDLE_COLORS.map((c) => (
                <Pressable
                  key={c}
                  accessibilityRole="radio"
                  accessibilityLabel={c}
                  accessibilityState={{ checked: color === c }}
                  onPress={() => setColor(c)}
                  style={[styles.swatch, { backgroundColor: SWATCH[c] }, color === c && styles.swatchOn]}
                />
              ))}
            </View>
            <Chips label="Kind of candle" options={CANDLE_FORMS.map((f) => ({ value: f.id as string, label: f.label }))} value={form} onChange={setForm} />
            <Chips label="Burns for" options={BURNS} value={burn} onChange={setBurn} />
            <Field label="Intention (optional)" value={intention} onChangeText={setIntention} maxLength={280} />
            <CheckRow label="Light it now" value={lightNow} onChange={setLightNow} />
            <Button
              label={`Set a ${color} ${formLabel.toLowerCase()} candle`}
              onPress={() =>
                void place({
                  kind: 'candle',
                  image: candleImage(color, form),
                  label: `${color[0].toUpperCase()}${color.slice(1)} ${formLabel.toLowerCase()} candle`,
                  burn_minutes: Number(burn),
                  lit: lightNow,
                  intention: intention.trim() || null,
                })
              }
            />
          </Section>

          <Section label="Set an offering">
            <Chips label="Cabinet" options={CATEGORIES} value={category} onChange={setCategory} />
            <Field label="Search" value={search} onChangeText={setSearch} placeholder="Rose, protection, chalice…" autoCapitalize="none" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cabinet}>
              {cabinet.map((entry) => {
                const picture = altarPicture(entry.image);
                return (
                  <Pressable
                    key={entry.image}
                    accessibilityRole="button"
                    accessibilityLabel={`Set ${entry.name} on the altar`}
                    onPress={() => void place({ kind: 'object', image: entry.image, label: entry.name, intention: intention.trim() || null })}
                    style={({ pressed }) => [styles.offering, pressed && styles.pressed]}
                  >
                    {picture && <AltarImage picture={picture} style={styles.offeringImage} resizeMode="contain" />}
                    <Text style={styles.offeringName} numberOfLines={2}>
                      {entry.name}
                    </Text>
                  </Pressable>
                );
              })}
              {!cabinet.length && <Text style={type.caption}>Nothing matches.</Text>}
            </ScrollView>
          </Section>
        </>
      )}
      {report.sheet}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 30 },
  intention: { fontStyle: 'italic' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: colors.gold },
  cabinet: { gap: 10, paddingVertical: 4 },
  offering: { width: 96, alignItems: 'center', gap: 4, padding: 6, borderRadius: radius.tile, backgroundColor: colors.surface },
  offeringImage: { width: 72, height: 72 },
  offeringName: { fontFamily: fonts.body, fontSize: 12, color: colors.parchment, textAlign: 'center' },
  pressed: { opacity: 0.7 },
});
