import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AltarEditor } from '../../../../../../../components/altar/AltarEditor';
import { AltarChat } from '../../../../../../../components/covens/ChatPanel';
import { CovenScreen, covenHref } from '../../../../../../../components/covens/CovenScreen';
import * as api from '../../../../../../../lib/covens/api';
import { useCovenAltar } from '../../../../../../../lib/covens/altarSync';
import type { WhoseContext } from '../../../../../../../lib/tend/altar';
import { useCoven } from '../../../../../../../lib/covens/CovenContext';
import { colors, radius, type } from '../../../../../../../theme';

// One of the coven's altars, open in the whole altar editor and shared live:
// who else is here, whether you can tend it right now (and why not), and the
// coven's chat in a small window over the altar (ChatPanel.tsx).
export default function CovenAltarScreen() {
  const { altarId } = useLocalSearchParams<{ altarId: string }>();
  const coven = useCoven();
  const me = coven.userId ? { userId: coven.userId, name: coven.me?.profile?.display_name || 'A member' } : null;
  const { shared, altar, access, others } = useCovenAltar(String(altarId ?? ''), me, coven.snapshot?.coven.name);
  const { track } = coven;
  const covenId = coven.snapshot?.coven.id;

  useEffect(() => {
    track(`altar:${altarId}`);
    return () => track('coven');
  }, [altarId, track]);

  // "Find mine": your own papers by their ids, and the coven's petitions by who asked them.
  const [mine, setMine] = useState<{ contributions: string[]; petitions: WhoseContext['petitions'] } | null>(null);
  const { loadNames } = coven;
  useEffect(() => {
    if (!coven.userId || !covenId) return;
    let alive = true;
    void Promise.all([api.fetchMyContributions(coven.userId).catch(() => []), api.fetchPetitions(covenId).catch(() => [])]).then(([contributions, petitions]) => {
      if (!alive) return;
      void loadNames(petitions.map((p) => p.user_id));
      setMine({ contributions: contributions.map((c) => c.id), petitions: Object.fromEntries(petitions.map((p) => [p.id, { userId: p.user_id, title: p.title }])) });
    });
    return () => {
      alive = false;
    };
  }, [coven.userId, covenId, loadNames]);
  const myName = coven.me?.profile?.display_name || '';
  const whose = useMemo<WhoseContext | null>(
    () => (mine && coven.userId ? { userId: coven.userId, myName, myContributions: mine.contributions, petitions: mine.petitions, nameOf: coven.nameOf } : null),
    [mine, coven.userId, myName, coven.nameOf],
  );

  if (coven.status !== 'ready' || !(coven.perms.member || coven.perms.site)) {
    return (
      <CovenScreen title="Altar" need="member">
        <Text style={type.caption}>Opening the altar…</Text>
      </CovenScreen>
    );
  }

  const ritual = access?.ritual_id ? coven.rituals.find((r) => r.id === access.ritual_id) : null;
  const keeper = !!access?.keeper;
  const header = (
    <View style={styles.band}>
      <View style={styles.row}>
        <Text style={[type.caption, styles.grow]} numberOfLines={2}>
          {others.length ? `Here now: ${others.map((p) => p.name).join(', ')}` : 'No one else is here right now.'}
          {altar?.archived_at ? ' · Archived' : ''}
        </Text>
        {(keeper || altar?.is_main) && (
          <Pressable
            onPress={() => router.push(covenHref(coven.slug, `altars/${altarId}/access`))}
            accessibilityRole="button"
            accessibilityLabel={keeper ? 'Keeper’s choices: who tends this altar, clearing it away or deleting it' : 'Who tends this altar'}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          >
            <Text style={styles.linkText}>{keeper ? 'Keeper’s choices' : 'Who tends it?'}</Text>
          </Pressable>
        )}
      </View>
      {ritual && (
        <Pressable onPress={() => router.push(covenHref(coven.slug, `ritual/${ritual.id}`))} accessibilityRole="button" style={({ pressed }) => [styles.ritual, pressed && styles.pressed]}>
          <Text style={type.caption}>{`${ritual.title} is under way here. Open the ritual ›`}</Text>
        </Pressable>
      )}
      {!shared.canEdit && !!access && <Text style={[type.caption, styles.reason]}>{shared.reason}</Text>}
    </View>
  );

  return (
    <AltarEditor
      shared={shared}
      whose={whose}
      header={header}
      overlay={<AltarChat />}
      onBack={() => (router.canGoBack() ? router.back() : router.replace(covenHref(coven.slug, 'altar')))}
    />
  );
}

const styles = StyleSheet.create({
  band: { paddingHorizontal: 16, paddingBottom: 6, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  grow: { flex: 1 },
  link: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.chip, borderWidth: 1, borderColor: colors.hairline },
  linkText: { ...type.caption, color: colors.gold },
  ritual: { padding: 10, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.gold },
  reason: { color: colors.gold },
  pressed: { opacity: 0.7 },
});
