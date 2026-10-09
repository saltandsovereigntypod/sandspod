import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { altarImageSource } from '../../../lib/altar/assets';
import { DEFAULT_BACKGROUND } from '../../../lib/altar/cabinet';
import { confirmAction } from '../../../lib/grimoire/confirm';
import { altarSummary } from '../../../lib/altar/snapshot';
import { useAltars } from '../../../lib/altar/store';
import type { SavedAltar } from '../../../lib/altar/types';
import { useSession } from '../../../lib/session';
import { colors, fonts, radius, space, type } from '../../../theme';

function savedDate(altar: SavedAltar): string {
  const raw = altar.updatedAt || altar.savedAt;
  const date = raw ? new Date(raw) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AltarList() {
  const { session } = useSession();
  const { altars, draft, draftSourceId, status, refresh, signedIn, sync, pendingCount } = useAltars();
  const [pulling, setPulling] = useState(false);
  const open = (altarId: string) => router.push({ pathname: '/altar/[altarId]', params: { altarId } });
  const draftSource = draftSourceId ? altars.find((a) => a.id === draftSourceId) : null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        alwaysBounceHorizontal={false}
        refreshControl={
          <RefreshControl
            refreshing={pulling}
            tintColor={colors.gold}
            onRefresh={async () => {
              setPulling(true);
              await refresh();
              setPulling(false);
            }}
          />
        }
      >
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={type.eyebrow}>{signedIn ? 'Saved sanctuaries' : 'On this device'}</Text>
            <Text accessibilityRole="header" style={type.title}>
              Altar
            </Text>
          </View>
        </View>

        <Button label="Build a new altar" onPress={() => open('new')} />

        {draft && (draft.objects?.length ?? 0) > 0 && (
          <Pressable
            onPress={() => open('draft')}
            accessibilityRole="button"
            accessibilityLabel={`Continue your working altar${draftSource ? `, ${draftSource.name}` : ''}. ${altarSummary(draft)}. Not saved yet.`}
            style={({ pressed }) => [styles.draft, pressed && styles.pressed]}
          >
            <Text style={type.eyebrow}>Unsaved changes</Text>
            <Text style={type.cardTitle}>{draftSource ? draftSource.name : 'Working altar'}</Text>
            <Text style={type.caption}>{altarSummary(draft)} · tap to continue</Text>
          </Pressable>
        )}

        {status === 'offline' && signedIn && (
          <Text style={[type.caption, styles.notice]}>Offline · showing the copy saved on this phone</Text>
        )}

        {signedIn && pendingCount > 0 && sync === 'offline' && (
          <Text style={[type.caption, styles.notice]} accessibilityLiveRegion="polite">
            {pendingCount === 1 ? 'One change is' : `${pendingCount} changes are`} kept on this device until you’re back
            online
          </Text>
        )}

        <RefusedChanges />

        {altars.length === 0 && (status === 'loading' || status === 'idle') && (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 24 }} />
        )}

        {altars.length === 0 && status !== 'loading' && status !== 'idle' && (
          <View style={styles.card}>
            <Text style={type.cardTitle}>No saved altars yet</Text>
            <Text style={type.body}>
              Build an altar, then save it to return to it here{signedIn ? ' and on the website' : ''}.
            </Text>
          </View>
        )}

        <View style={styles.list}>
          {altars.map((altar) => (
            <AltarCard key={altar.id} altar={altar} onPress={() => open(altar.id)} />
          ))}
        </View>

        {!session && (
          <View style={styles.card}>
            <Text style={type.body}>
              You're exploring as a guest, so altars stay on this phone. Sign in to open the altars you keep on the
              website.
            </Text>
            <Button label="Sign in" variant="outline" onPress={() => router.push('/sign-in')} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Saves or deletions the account refused, kept on the device so they're never lost silently. */
function RefusedChanges() {
  const { failed, retryFailed, discardFailed } = useAltars();
  if (!failed.length) return null;
  const count = failed.length;
  const names = failed.map((f) => (f.op.kind === 'save' ? f.op.name : 'a deleted altar')).join(', ');
  return (
    <View style={[styles.card, styles.refused]} accessibilityRole="alert">
      <Text style={type.cardTitle}>{count === 1 ? 'A change wasn’t saved' : `${count} changes weren’t saved`}</Text>
      <Text style={type.body}>
        Your account didn’t accept changes to {names}. They’re kept on this device, so you can try again.
      </Text>
      <Text style={type.caption} numberOfLines={3}>
        {failed[0].message}
      </Text>
      <Button label="Try again" onPress={retryFailed} />
      <Button
        label="Discard these changes"
        variant="text"
        onPress={async () => {
          const ok = await confirmAction(
            'Discard these changes?',
            'They\u2019ll be removed from this device and your altars will show what your account has saved.',
            'Discard',
          );
          if (ok) discardFailed();
        }}
      />
    </View>
  );
}

function AltarCard({ altar, onPress }: { altar: SavedAltar; onPress: () => void }) {
  const source = altarImageSource(altar.background || DEFAULT_BACKGROUND);
  const date = savedDate(altar);
  const summary = altarSummary(altar);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${altar.name || 'Untitled altar'}. ${summary}.${date ? ` Saved ${date}.` : ''}`}
      style={({ pressed }) => [styles.altar, pressed && styles.pressed]}
    >
      <View style={styles.thumb}>{source && <Image source={source} style={styles.thumbImage} resizeMode="cover" />}</View>
      <View style={styles.altarText}>
        <Text style={type.eyebrow} numberOfLines={1}>
          {altar.backgroundName || 'Custom altar'}
        </Text>
        <Text style={styles.altarName} numberOfLines={2}>
          {altar.name || 'Untitled altar'}
        </Text>
        <Text style={type.caption} numberOfLines={1}>
          {summary}
          {date ? ` · ${date}` : ''}
        </Text>
      </View>
      <Icon name="chevron" size={16} color={colors.tabInactive} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  content: { paddingHorizontal: space.gutter, paddingTop: 16, paddingBottom: 32, gap: space.section },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end' },
  notice: { textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 20, gap: 12 },
  refused: { borderWidth: 1, borderColor: colors.goldLine },
  draft: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 18,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  list: { gap: 12 },
  altar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 12,
    minHeight: 88,
  },
  thumb: { width: 96, aspectRatio: 16 / 9, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.night },
  thumbImage: { width: '100%', height: '100%' },
  altarText: { flex: 1, gap: 2 },
  altarName: { fontFamily: fonts.display, fontSize: 21, lineHeight: 24, color: colors.cream },
  pressed: { opacity: 0.75 },
});
