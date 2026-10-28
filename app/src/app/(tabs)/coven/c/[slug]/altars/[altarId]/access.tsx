import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';

import { Button } from '../../../../../../../components/Button';
import { CovenScreen, covenHref } from '../../../../../../../components/covens/CovenScreen';
import { Card, CheckRow, Chips, Field, Notice, Section } from '../../../../../../../components/more/ui';
import * as api from '../../../../../../../lib/covens/api';
import {
  altarAccess,
  archiveAltar,
  deleteAltar,
  fetchAltarEditors,
  setAltar,
  setAltarEditor,
  TEND_CHOICES,
  tendedBy,
  ALTAR_FIELDS,
  type AltarAccess,
  type AltarEditor,
  type CovenAltar,
} from '../../../../../../../lib/covens/altarSync';
import { archiveAltarWords, canDeleteAltar, deleteAltarWords } from '../../../../../../../lib/covens/altarPanel';
import { useCoven } from '../../../../../../../lib/covens/CovenContext';
import { confirmAction } from '../../../../../../../lib/grimoire/confirm';
import { errorMessage, type Member } from '../../../../../../../lib/covens/model';
import { supabase } from '../../../../../../../lib/supabase';
import { colors, type } from '../../../../../../../theme';

// Who tends one of the coven's altars. Its keepers (the coven's head, those
// whose position keeps altars, and whoever started it) name it, choose who
// tends it outside rituals (everyone, chosen people and positions, or only
// its keepers), lock it, archive it (kept, so it can be restored) or
// delete it for good. Everyone else sees who tends it.
// During a ritual, the ritual's steps decide instead (set on the ritual).
export default function AltarAccessScreen() {
  const { altarId } = useLocalSearchParams<{ altarId: string }>();
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const ranks = coven.snapshot?.ranks ?? [];
  const [altar, setAltarRow] = useState<CovenAltar | null>(null);
  const [access, setAccess] = useState<AltarAccess | null>(null);
  const [editors, setEditors] = useState<AltarEditor[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!covenId || !altarId) return;
    try {
      const [{ data, error }, rights, chosen, people] = await Promise.all([
        supabase.from('coven_altars').select(ALTAR_FIELDS).eq('id', altarId).single(),
        altarAccess(String(altarId)),
        fetchAltarEditors(String(altarId)),
        api.fetchMembers(covenId),
      ]);
      if (error) throw new Error(error.message);
      setAltarRow(data as CovenAltar);
      setName((data as CovenAltar).name);
      setAccess(rights);
      setEditors(chosen);
      setMembers(people);
      await coven.loadNames(people.map((m) => m.user_id));
    } catch (error) {
      setMessage(errorMessage(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload for this altar
  }, [covenId, altarId]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (work: () => Promise<unknown>, done?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      await load();
      if (done) setMessage(done);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const confirmDelete = () => {
    if (!altar) return;
    const words = deleteAltarWords(altar.name);
    Alert.alert(words.title, words.body, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: words.confirm,
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          setMessage(null);
          try {
            await deleteAltar(altar.id);
            router.replace(covenHref(coven.slug, 'altar'));
          } catch (error) {
            setMessage(errorMessage(error));
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (!altar || !access) {
    return (
      <CovenScreen title="Who tends it" onRefresh={load}>
        {message ? <Notice>{message}</Notice> : <ActivityIndicator color={colors.gold} />}
      </CovenScreen>
    );
  }

  const keeper = access.keeper;
  const isChosen = (who: { userId?: string; rankId?: string }) =>
    editors.some((e) => e.active && (who.userId ? e.user_id === who.userId : e.rank_id === who.rankId));
  const founder = coven.snapshot?.coven.founder_id;
  const tenders = ranks.filter((r) => r.can_tend_altars || r.can_keep_altars || r.can_manage).map((r) => r.name);
  const keepers = [
    coven.nameOf(founder) + ' (the coven’s head)',
    ...ranks.filter((r) => r.can_keep_altars || r.can_manage).map((r) => `everyone who is ${r.name}`),
    ...(!altar.is_main && altar.created_by ? [`${coven.nameOf(altar.created_by)}, who started it`] : []),
  ];

  return (
    <CovenScreen title="Who tends it" eyebrow={altar.name} onRefresh={load}>
      <Text style={type.body}>{tendedBy(altar)}.</Text>
      <Text style={type.caption}>Kept by {keepers.join('; ')}. Keepers can always tend it.</Text>
      {altar.is_main && <Text style={type.caption}>During a ritual held here, the ritual’s steps decide who tends it. Its leader chooses that on the ritual.</Text>}
      {!!tenders.length && altar.edit_mode === 'chosen' && <Text style={type.caption}>Positions that tend the coven’s altars: {tenders.join(', ')}.</Text>}
      {access.can_edit ? <Notice tone="muted">You can tend this altar now.</Notice> : !!access.reason && <Notice tone="muted">{access.reason}</Notice>}
      {message && <Notice>{message}</Notice>}

      {keeper && (
        <>
          <Card>
            <Field label="Name" value={name} onChangeText={setName} maxLength={80} />
            <Chips
              label="Who tends it, outside rituals"
              options={TEND_CHOICES.map((c) => (c.value === 'keeper' ? { ...c, label: 'Only its keepers' } : c))}
              value={altar.edit_mode}
              onChange={(mode) => void act(() => setAltar(altar.id, name, mode, altar.locked))}
            />
            <CheckRow label="Locked (only its keepers can change it, even in a ritual’s steps)" value={altar.locked} onChange={(locked) => void act(() => setAltar(altar.id, name, altar.edit_mode, locked))} />
            {name.trim() !== altar.name && <Button label="Save the name" onPress={() => void act(() => setAltar(altar.id, name, altar.edit_mode, altar.locked), 'Saved.')} disabled={busy || !name.trim()} />}
          </Card>

          {altar.edit_mode === 'chosen' && (
            <>
              <Section label="Positions that tend it">
                {ranks.map((rank) => (
                  <CheckRow
                    key={rank.id}
                    label={rank.name}
                    value={isChosen({ rankId: rank.id })}
                    onChange={(on) => void act(() => setAltarEditor(altar.id, { rankId: rank.id }, on))}
                  />
                ))}
              </Section>
              <Section label="People who tend it">
                {members
                  .filter((m) => m.user_id !== founder)
                  .map((m) => (
                    <CheckRow
                      key={m.user_id}
                      label={coven.nameOf(m.user_id)}
                      value={isChosen({ userId: m.user_id })}
                      onChange={(on) => void act(() => setAltarEditor(altar.id, { userId: m.user_id }, on))}
                    />
                  ))}
              </Section>
            </>
          )}

          {!altar.is_main &&
            (altar.archived_at ? (
              <Button label="Restore this altar" variant="outline" onPress={() => void act(() => archiveAltar(altar.id, false), archiveAltarWords(altar.name).restored)} disabled={busy} />
            ) : (
              <Button
                label="Archive this altar"
                variant="text"
                onPress={async () => {
                  const words = archiveAltarWords(altar.name);
                  if (!(await confirmAction(words.title, words.body, words.confirm))) return;
                  void act(async () => {
                    await archiveAltar(altar.id, true);
                    router.replace(covenHref(coven.slug, 'altar'));
                  });
                }}
                disabled={busy}
              />
            ))}
          {!altar.is_main && (
            <Section label="Delete it for good">
              <Text style={type.caption}>
                {deleteAltarWords(altar.name).body} {deleteAltarWords(altar.name).gentler}
              </Text>
              {canDeleteAltar(altar, access).ok ? (
                <Button label="Delete this altar" variant="outline" onPress={confirmDelete} disabled={busy} />
              ) : (
                !!canDeleteAltar(altar, access).reason && <Text style={type.caption}>{canDeleteAltar(altar, access).reason}</Text>
              )}
            </Section>
          )}
        </>
      )}
      {!keeper && altar.edit_mode === 'chosen' && (
        <Section label="Chosen to tend it">
          <Text style={type.body}>
            {[
              ...editors.filter((e) => e.active && e.rank_id).map((e) => ranks.find((r) => r.id === e.rank_id)?.name ?? 'A position'),
              ...editors.filter((e) => e.active && e.user_id).map((e) => coven.nameOf(e.user_id)),
            ].join(', ') || 'No one yet.'}
          </Text>
        </Section>
      )}
    </CovenScreen>
  );
}
