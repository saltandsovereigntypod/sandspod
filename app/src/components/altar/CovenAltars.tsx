// The Altar tab's Coven half: the altars you tend with your covens, every
// coven's under its name (the ritual altar first), each opening the coven's
// own altar screen. Start an altar where your position starts them; archived
// altars wait, folded, for those who may restore them. The list and its order
// come from lib/covens/altarsAcross.ts, shared with the website.

import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Pill, Pills } from '../covens/ui';
import { Icon } from '../Icon';
import { Card, Chips, Field, Notice, Section } from '../more/ui';
import { altarKind, covensToStartIn, groupCovenAltars, thingsLabel, type CovenAltarGroup, type CovenAltarsInput } from '../../lib/covens/altarsAcross';
import { archiveAltar, createAltar, TEND_CHOICES, tendedBy, type CovenAltar } from '../../lib/covens/altarSync';
import { archiveAltarWords } from '../../lib/covens/altarPanel';
import { errorMessage } from '../../lib/covens/model';
import type { QueryStatus } from '../../lib/more/useCachedQuery';
import { colors, radius, type } from '../../theme';

/** Opens a coven altar from the Altar tab; its Back comes home here (`from: 'altar'`). */
export function openCovenAltar(slug: string, altarId: string) {
  router.push({ pathname: '/coven/c/[slug]/altars/[altarId]', params: { slug, altarId, from: 'altar' } });
}

export function CovenAltars({
  signedIn,
  userId,
  data,
  status,
  refresh,
}: {
  signedIn: boolean;
  userId: string | null;
  data: CovenAltarsInput[] | null;
  status: QueryStatus;
  refresh: () => Promise<void>;
}) {
  const [starting, setStarting] = useState(false);
  const [startIn, setStartIn] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<CovenAltar['edit_mode']>('members');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!signedIn) {
    return (
      <Card>
        <Text style={type.cardTitle}>Covens need an account</Text>
        <Text style={type.body}>A coven’s altars are tended together, so they live with your account. Sign in to see the altars of the covens you belong to.</Text>
        <Button label="Sign in" variant="outline" onPress={() => router.push('/sign-in')} />
      </Card>
    );
  }

  if (!data) {
    return status === 'offline' ? (
      <Card>
        <Text style={type.body}>Your covens’ altars couldn’t be loaded. Check your connection and try again.</Text>
        <Button label="Try again" variant="outline" onPress={() => void refresh()} />
      </Card>
    ) : (
      <ActivityIndicator color={colors.gold} style={styles.loading} />
    );
  }

  if (!data.length) {
    return (
      <Card>
        <Text style={type.cardTitle}>Join or found a coven</Text>
        <Text style={type.body}>When you belong to a coven, its altars are here: the ritual altar and the others its members tend together.</Text>
        <Button label="Find a coven" onPress={() => router.navigate({ pathname: '/coven', params: { tab: 'find' } })} />
      </Card>
    );
  }

  const groups = groupCovenAltars(data, userId);
  const startable = covensToStartIn(groups);
  const chosen = startable.find((c) => c.id === startIn) ?? (startable.length === 1 ? startable[0] : null);

  const start = async () => {
    if (!chosen) return;
    setBusy(true);
    setMessage(null);
    try {
      const made = await createAltar(chosen.id, name.trim() || 'An altar', mode);
      setStarting(false);
      setName('');
      setStartIn('');
      void refresh();
      openCovenAltar(chosen.slug, made.id);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const restore = async (altar: CovenAltar) => {
    setBusy(true);
    setMessage(null);
    try {
      await archiveAltar(altar.id, false);
      await refresh();
      setMessage(archiveAltarWords(altar.name).restored);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  return (
    <>
      {status === 'offline' && <Notice>Couldn’t refresh just now · showing the copy saved on this phone</Notice>}
      {!!message && <Notice>{message}</Notice>}

      {startable.length > 0 &&
        (starting ? (
          <Card>
            <Text style={type.cardTitle}>Start a coven altar</Text>
            {startable.length > 1 && (
              <Chips label="Which coven?" options={startable.map((c) => ({ value: c.id, label: c.name }))} value={chosen?.id ?? ''} onChange={setStartIn} />
            )}
            {chosen && (
              <>
                <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Healing altar for Sage" maxLength={80} />
                <Chips label="Who tends it" options={TEND_CHOICES} value={mode} onChange={setMode} />
                <Text style={type.caption}>You keep it: you can change who tends it, lock it, or archive it later. The coven’s head keeps every altar too.</Text>
                <Button label={startable.length > 1 ? `Start the altar in ${chosen.name}` : 'Start the altar'} onPress={() => void start()} disabled={busy} />
              </>
            )}
            <Button
              label="Not now"
              variant="text"
              onPress={() => {
                setStarting(false);
                setStartIn('');
              }}
            />
          </Card>
        ) : (
          <Button label="Start a coven altar" variant="outline" onPress={() => setStarting(true)} />
        ))}

      {groups.map((group) => (
        <CovenGroup key={group.coven.id} group={group} busy={busy} onRestore={(altar) => void restore(altar)} />
      ))}
    </>
  );
}

function CovenGroup({ group, busy, onRestore }: { group: CovenAltarGroup; busy: boolean; onRestore: (altar: CovenAltar) => void }) {
  const [showArchived, setShowArchived] = useState(false);
  const { coven, altars, archived, counts } = group;
  return (
    <Section label={coven.name}>
      {altars.length ? (
        <View style={styles.list}>
          {altars.map((altar) => (
            <Pressable
              key={altar.id}
              onPress={() => openCovenAltar(coven.slug, altar.id)}
              accessibilityRole="button"
              accessibilityLabel={`${altar.name}, ${coven.name}. ${altarKind(altar)}. ${thingsLabel(counts[altar.id])} on it. ${tendedBy(altar)}.`}
              accessibilityHint="Opens the altar"
              style={({ pressed }) => [styles.altar, altar.is_main && styles.main, pressed && styles.pressed]}
            >
              <View style={styles.head}>
                <View style={styles.grow}>
                  <Text style={type.eyebrow}>{altarKind(altar)}</Text>
                  <Text style={type.cardTitle}>{altar.name}</Text>
                </View>
                <Icon name="chevron" size={16} color={colors.gold} />
              </View>
              <Pills>
                <Pill label={thingsLabel(counts[altar.id])} />
                <Pill label={tendedBy(altar)} />
              </Pills>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={type.caption}>No altars here yet.</Text>
      )}
      {archived.length > 0 && (
        <>
          <Pressable
            onPress={() => setShowArchived((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showArchived }}
            style={({ pressed }) => [styles.archivedHead, pressed && styles.pressed]}
          >
            <Text style={type.caption}>{`Archived (${archived.length})`}</Text>
            <Text style={styles.toggle}>{showArchived ? 'Hide' : 'Show'}</Text>
          </Pressable>
          {showArchived &&
            archived.map((altar) => (
              <View key={altar.id} style={[styles.altar, styles.muted]}>
                <Pressable onPress={() => openCovenAltar(coven.slug, altar.id)} accessibilityRole="button" accessibilityLabel={`${altar.name}, archived`} style={({ pressed }) => pressed && styles.pressed}>
                  <Text style={type.body}>{altar.name}</Text>
                  <Text style={type.caption}>Kept whole. You can restore it.</Text>
                </Pressable>
                <View style={styles.actions}>
                  <Button label="Restore" variant="text" onPress={() => onRestore(altar)} disabled={busy} />
                </View>
              </View>
            ))}
        </>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 24 },
  list: { gap: 10 },
  altar: { gap: 6, padding: 14, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface },
  main: { borderColor: colors.gold },
  muted: { opacity: 0.85 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  grow: { flex: 1, gap: 2 },
  archivedHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  toggle: { ...type.caption, color: colors.gold },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  pressed: { opacity: 0.7 },
});
