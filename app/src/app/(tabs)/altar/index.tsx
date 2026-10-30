import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/Button';
import { CovenAltars } from '../../../components/altar/CovenAltars';
import { SegmentedSwitch } from '../../../components/SegmentedSwitch';
import { Icon } from '../../../components/Icon';
import { altarImageSource } from '../../../lib/altar/assets';
import { DEFAULT_BACKGROUND } from '../../../lib/altar/cabinet';
import { confirmAction } from '../../../lib/grimoire/confirm';
import { archiveSave, ARCHIVE_WORDS, splitArchived } from '../../../lib/altar/archive';
import { altarOfferingsDue, altarWateringDue } from '../../../lib/altar/burnout';
import { tendCard } from '../../../lib/tend/card';
import { altarSummary } from '../../../lib/altar/snapshot';
import { useAltars } from '../../../lib/altar/store';
import type { SavedAltar } from '../../../lib/altar/types';
import type { CovenAltarsInput } from '../../../lib/covens/altarsAcross';
import { fetchAltarsAcrossCovens } from '../../../lib/covens/altarSync';
import { useCachedQuery } from '../../../lib/more/useCachedQuery';
import { preloadRememberedTab, useRememberedTab } from '../../../lib/rememberedTab';
import { ALTAR_TAB_KEY, ALTAR_TABS, asAltarTab } from '../../../lib/screenTabs';
import { useSession } from '../../../lib/session';
import { colors, fonts, radius, space, type } from '../../../theme';

void preloadRememberedTab(ALTAR_TAB_KEY);

function savedDate(altar: SavedAltar): string {
  const raw = altar.updatedAt || altar.savedAt;
  const date = raw ? new Date(raw) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AltarList() {
  const { session } = useSession();
  const { altars, draft, draftSourceId, status, refresh, signedIn, sync, pendingCount, save } = useAltars();
  const [pulling, setPulling] = useState(false);

  // Two tabs: your own altars, and the altars you tend with your covens.
  const [remembered, rememberTab] = useRememberedTab(ALTAR_TAB_KEY, asAltarTab);
  const tab = remembered ?? 'personal';
  // A link can pick the tab (/altar?tab=coven); it is then cleared so it works again.
  const params = useLocalSearchParams<{ tab?: string }>();
  const linked = asAltarTab(params.tab);
  useEffect(() => {
    if (!linked) return;
    rememberTab(linked);
    router.setParams({ tab: undefined });
  }, [linked, rememberTab]);
  // Tapping Altar in the tab bar while already here goes back to Personal.
  const navigation = useNavigation();
  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;
    return parent.addListener('tabPress' as never, () => {
      if (navigation.isFocused()) rememberTab('personal');
    });
  }, [navigation, rememberTab]);
  // The covens' altars load only when that tab is open (from the copy on the phone first).
  const userId = session?.user.id ?? null;
  const covenAltars = useCachedQuery<CovenAltarsInput[]>(userId && tab === 'coven' ? `altar-covens-${userId}` : null, () => fetchAltarsAcrossCovens(userId!));

  const open = (altarId: string) => router.push({ pathname: '/altar/[altarId]', params: { altarId } });
  const draftSource = draftSourceId ? altars.find((a) => a.id === draftSourceId) : null;
  // Offerings that have gone over on your saved altars (water drying, flowers wilting).
  const due = useMemo(() => altarOfferingsDue(altars, new Date(), 0), [altars]);
  // And potted plants that would like water.
  const thirsty = useMemo(() => altarWateringDue(altars, new Date(), 0), [altars]);
  // One "To tend" card: the most pressing thing when something wants tending, else what the list holds.
  const card = tendCard(due, thirsty);
  const { active, archived } = useMemo(() => splitArchived(altars), [altars]);
  const [showArchived, setShowArchived] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(ARCHIVED_OPEN_KEY)
      .then((v) => setShowArchived(v === 'open'))
      .catch(() => undefined);
  }, []);
  const toggleArchived = () => {
    const next = !showArchived;
    setShowArchived(next);
    void AsyncStorage.setItem(ARCHIVED_OPEN_KEY, next ? 'open' : 'closed').catch(() => undefined);
  };
  const setArchived = async (altar: SavedAltar, archive: boolean) => {
    if (archive) {
      const ok = await confirmAction(
        `Archive ${altar.name || 'this altar'}?`,
        'Everything on it is kept: its things, petitions and history. It moves to Archived altars and rests from reminders, tending nudges, the To tend list and the widget until you restore it.',
        ARCHIVE_WORDS.archive,
      );
      if (!ok) return;
    }
    const result = await save(archiveSave(altar, archive, new Date().toISOString()));
    setNotice(result.outcome === 'failed' ? 'Your account didn’t take that change. It’s kept on this phone to try again.' : archive ? ARCHIVE_WORDS.archived(altar.name) : ARCHIVE_WORDS.restored(altar.name));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        alwaysBounceHorizontal={false}
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={pulling}
            tintColor={colors.gold}
            onRefresh={async () => {
              setPulling(true);
              await (tab === 'coven' ? covenAltars.refresh() : refresh());
              setPulling(false);
            }}
          />
        }
      >
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={type.eyebrow}>{tab === 'coven' ? 'Tended together' : signedIn ? 'Saved sanctuaries' : 'On this device'}</Text>
            <Text accessibilityRole="header" style={type.title}>
              Altar
            </Text>
          </View>
        </View>

        <SegmentedSwitch label="Altar" options={ALTAR_TABS} value={tab} onChange={rememberTab} />

        {tab === 'coven' ? (
          <CovenAltars signedIn={!!session} userId={userId} data={covenAltars.data} status={covenAltars.status} refresh={covenAltars.refresh} />
        ) : (
          <>
            <Button label="Build a new altar" onPress={() => open('new')} />

            <View style={[styles.tending, card.pressing && styles.tendingDue]}>
              <Pressable
                onPress={() => router.push('/altar/tend')}
                accessibilityRole="link"
                accessibilityHint="Everything you tend, from every altar, coven and journey, in one list"
                style={({ pressed }) => [styles.tendingBody, pressed && styles.pressed]}
              >
                <Text style={type.eyebrow}>To tend</Text>
                <Text style={type.body}>{card.body}</Text>
              </Pressable>
              {card.altarId && (
                <Button
                  label={card.altarName ? `Open ${card.altarName}` : 'Open the altar'}
                  variant="text"
                  onPress={() => open(card.altarId!)}
                  accessibilityHint="Opens the altar, where you can tend it"
                />
              )}
            </View>

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
              <Text style={[type.caption, styles.notice]}>Couldn’t refresh just now · showing the copy saved on this phone</Text>
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

            {!!notice && (
              <Text style={[type.caption, styles.notice]} accessibilityLiveRegion="polite">
                {notice}
              </Text>
            )}

            <View style={styles.list}>
              {active.map((altar) => (
                <AltarCard key={altar.id} altar={altar} onPress={() => open(altar.id)} action={ARCHIVE_WORDS.archive} onAction={() => void setArchived(altar, true)} />
              ))}
            </View>

            {archived.length > 0 && (
              <View style={styles.list}>
                <Pressable
                  onPress={toggleArchived}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showArchived }}
                  style={({ pressed }) => [styles.archivedHead, pressed && styles.pressed]}
                >
                  <Text style={type.eyebrow}>{ARCHIVE_WORDS.section(archived.length)}</Text>
                  <Text style={styles.archivedToggle}>{showArchived ? 'Hide' : 'Show'}</Text>
                </Pressable>
                {showArchived && (
                  <>
                    <Text style={type.caption}>Kept whole and resting: no reminders, nudges or To tend items until you restore them.</Text>
                    {archived.map((altar) => (
                      <AltarCard key={altar.id} altar={altar} muted onPress={() => open(altar.id)} action={ARCHIVE_WORDS.restore} onAction={() => void setArchived(altar, false)} />
                    ))}
                  </>
                )}
              </View>
            )}

            {!session && (
              <View style={styles.card}>
                <Text style={type.body}>
                  You're exploring as a guest, so altars stay on this phone. Sign in to open the altars you keep on the
                  website.
                </Text>
                <Button label="Sign in" variant="outline" onPress={() => router.push('/sign-in')} />
              </View>
            )}
          </>
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

/** Whether the Archived altars section is open, on this device. */
const ARCHIVED_OPEN_KEY = 'altar.archivedOpen';

function AltarCard({ altar, onPress, action, onAction, muted }: { altar: SavedAltar; onPress: () => void; action: string; onAction: () => void; muted?: boolean }) {
  const source = altarImageSource(altar.background || DEFAULT_BACKGROUND);
  const date = savedDate(altar);
  const summary = altarSummary(altar);
  return (
    <View style={[styles.altarRow, muted && styles.muted]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${altar.name || 'Untitled altar'}${muted ? ', archived' : ''}. ${summary}.${date ? ` Saved ${date}.` : ''}`}
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
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        accessibilityLabel={`${action} ${altar.name || 'this altar'}`}
        hitSlop={8}
        style={({ pressed }) => [styles.altarAction, pressed && styles.pressed]}
      >
        <Text style={styles.altarActionText}>{action}</Text>
      </Pressable>
    </View>
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
  tending: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 18, gap: 4, borderLeftWidth: 2, borderLeftColor: colors.goldLine },
  tendingDue: { borderLeftColor: colors.gold },
  tendingBody: { gap: 4 },
  archivedHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  archivedToggle: { fontFamily: fonts.body, fontSize: 15, color: colors.gold },
  altarRow: { gap: 2 },
  muted: { opacity: 0.8 },
  altarAction: { alignSelf: 'flex-end', minHeight: 36, justifyContent: 'center', paddingHorizontal: 8 },
  altarActionText: { fontFamily: fonts.body, fontSize: 14, color: colors.tabInactive },
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
