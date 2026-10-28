import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { DisclosureCard } from '../../../../../../components/covens/lineage';
import { Card, Field, MenuList, MenuRow, Notice, Section } from '../../../../../../components/more/ui';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { daughterDetail, daughterLabel, hivedLine, requestLine, type DaughterRequest, type LinkedCoven } from '../../../../../../lib/covens/lineage';
import { askRelease, decideRelease, fetchMyDaughterRequests, releaseDaughter, withdrawDaughterRequest } from '../../../../../../lib/covens/lineageApi';
import { errorMessage } from '../../../../../../lib/covens/model';
import { type } from '../../../../../../theme';

// Lineage and daughter covens: the coven's mother and daughters, founding a
// daughter (and the head's answers), what the mother shares, releasing, and
// the log. The database decides who may (…_coven_lineage.sql).
export default function LineageHome() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  const lineage = coven.lineage;
  const [mine, setMine] = useState<DaughterRequest[]>([]);
  const [note, setNote] = useState('');
  const [releasing, setReleasing] = useState<LinkedCoven | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const covenId = info?.id;
  const userId = coven.userId;
  const ownHead = !!info && info.founder_id === userId;

  // Read again after each change (and on pull to refresh).
  const [version, setVersion] = useState(0);
  const load = useCallback(async () => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!covenId || !userId) return;
    let live = true;
    void fetchMyDaughterRequests(covenId, userId).then((list) => live && setMine(list));
    return () => {
      live = false;
    };
  }, [covenId, userId, version]);

  const act = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      setMessage(done);
      setNote('');
      setReleasing(null);
      await Promise.all([coven.refresh(), load()]);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const go = (sub: string) => router.push(covenHref(coven.slug, `lineage/${sub}`));
  const pending = mine.find((r) => r.status === 'pending');
  const latest = mine[0];

  return (
    <CovenScreen title="Daughter covens" onRefresh={async () => void (await Promise.all([coven.refresh(), load()]))}>
      {!lineage && <Notice tone="muted">Daughter covens aren’t open here yet.</Notice>}
      {lineage && info && (
        <>
          {lineage.mother && (
            <Section label="Mother coven">
              <Card>
                <Text style={type.cardTitle}>{hivedLine(lineage)}</Text>
                {lineage.mother.slug && <Button label={`Open ${lineage.mother.name}`} variant="outline" onPress={() => router.push(covenHref(lineage.mother!.slug!))} />}
              </Card>
              <DisclosureCard text={lineage.disclosure} />
              <MenuList>
                <MenuRow label="From your mother coven" detail="What it shares with its daughters, to copy in" icon="library" last onPress={() => go('library')} />
              </MenuList>
              {ownHead && !lineage.ancestor && (
                <Card>
                  <Text style={type.eyebrow}>Becoming independent</Text>
                  {lineage.release_request ? (
                    <>
                      <Text style={type.body}>You’ve asked {lineage.mother.name ?? 'your mother coven'} to release this coven. Its head decides.</Text>
                      <Button label="Take back the request" variant="text" disabled={busy} onPress={() => void act(() => decideRelease(info.id, lineage.release_request!.id, false, ''), 'Your request is taken back.')} />
                    </>
                  ) : (
                    <>
                      <Text style={type.body}>Only the head of {lineage.mother.name ?? 'your mother coven'} can release this coven. You can ask; they decide.</Text>
                      <Field label="A note for them (optional)" value={note} onChangeText={setNote} multiline maxLength={2000} />
                      <Button label="Ask to be released" variant="outline" disabled={busy} onPress={() => void act(() => askRelease(info.id, note), 'Your request is with the head of your mother coven.')} />
                    </>
                  )}
                </Card>
              )}
              {(lineage.ancestor || coven.perms.site) && (
                <Card>
                  <Text style={type.eyebrow}>Release this coven</Text>
                  <Text style={type.body}>
                    {info.name} would no longer count {lineage.mother.name ?? 'its mother coven'} as its mother. You, and the heads above you, would lose your say over it. What it has copied stays its own.
                  </Text>
                  {lineage.release_request && <Text style={type.caption}>Its head has asked to be released{lineage.release_request.note ? `: “${lineage.release_request.note}”` : '.'}</Text>}
                  <Field label="A note (optional)" value={note} onChangeText={setNote} multiline maxLength={2000} />
                  <View style={styles.row}>
                    <Button label="Release this coven" variant="outline" disabled={busy} onPress={() => void act(() => releaseDaughter(info.id, note), `${info.name} is released.`)} />
                    {lineage.release_request && <Button label="Keep the link" variant="text" disabled={busy} onPress={() => void act(() => decideRelease(info.id, lineage.release_request!.id, false, note), 'The link stays.')} />}
                  </View>
                </Card>
              )}
            </Section>
          )}

          <Section label="Daughter covens">
            {lineage.daughters.length === 0 && <Text style={type.caption}>No daughter covens yet.</Text>}
            {lineage.daughters.length > 0 && (
              <MenuList>
                {lineage.daughters.map((d, i) => (
                  <MenuRow key={d.id} label={daughterLabel(d)} detail={daughterDetail(d) || 'Daughter coven'} icon="community" last={i === lineage.daughters.length - 1} onPress={d.slug ? () => router.push(covenHref(d.slug!)) : undefined} />
                ))}
              </MenuList>
            )}
            {lineage.may_decide &&
              lineage.release_requests.map((r) => (
                <Card key={r.id}>
                  <Text style={type.cardTitle}>{r.daughter_name ?? 'A daughter coven'} asks to be released</Text>
                  {!!r.note && <Text style={type.body}>“{r.note}”</Text>}
                  <Text style={type.caption}>Releasing ends the link: you lose your say over it, and it keeps what it copied.</Text>
                  <View style={styles.row}>
                    <Button label="Release it" variant="outline" disabled={busy} onPress={() => void act(() => decideRelease(r.daughter_coven_id, r.id, true, ''), `${r.daughter_name ?? 'The coven'} is released.`)} />
                    <Button label="Keep the link" variant="text" disabled={busy} onPress={() => void act(() => decideRelease(r.daughter_coven_id, r.id, false, ''), 'The link stays.')} />
                  </View>
                </Card>
              ))}
            {lineage.may_decide &&
              lineage.daughters.map((d) => (
                <View key={`release-${d.id}`}>
                  {releasing?.id === d.id ? (
                    <Card>
                      <Text style={type.body}>{daughterLabel(d)} would no longer count {info.name} as its mother. You would lose your say over it.</Text>
                      <Field label="A note (optional)" value={note} onChangeText={setNote} multiline maxLength={2000} />
                      <View style={styles.row}>
                        <Button label="Release it" variant="outline" disabled={busy} onPress={() => void act(() => releaseDaughter(d.id, note), `${daughterLabel(d)} is released.`)} />
                        <Button label="Not now" variant="text" onPress={() => setReleasing(null)} />
                      </View>
                    </Card>
                  ) : (
                    <Button label={`Release ${daughterLabel(d)}…`} variant="text" onPress={() => setReleasing(d)} />
                  )}
                </View>
              ))}
          </Section>

          <Section label="Founding and sharing">
            <MenuList>
              {lineage.may_found && !pending && <MenuRow label="Found a daughter coven" detail="Ask to hive off a new coven from this one" icon="journey" last={!lineage.may_decide && !coven.perms.manage} onPress={() => go('found')} />}
              {lineage.may_decide && (
                <MenuRow
                  label="Requests to found"
                  detail={lineage.pending_requests ? `${lineage.pending_requests} waiting for your answer` : 'None waiting'}
                  count={lineage.pending_requests}
                  icon="offer"
                  onPress={() => go('requests')}
                />
              )}
              {lineage.may_decide && <MenuRow label="Share with your daughter covens" detail="Book sections, programs, templates and more; push an update" icon="library" last={!coven.perms.manage} onPress={() => go('share')} />}
              {coven.perms.manage && <MenuRow label="The lineage log" detail="Founding, copies, releases, and every change a mother coven made here" icon="letters" last onPress={() => go('log')} />}
            </MenuList>
            {!lineage.may_found && !lineage.may_decide && <Text style={type.caption}>Founding a daughter coven is for positions the head allows, and for anyone the head names.</Text>}
            {latest && (
              <Card>
                <Text style={type.body}>{requestLine(latest)}</Text>
                {latest.status === 'pending' && <Button label="Withdraw it" variant="text" disabled={busy} onPress={() => void act(() => withdrawDaughterRequest(info.id, latest.id), 'Your request is withdrawn.')} />}
              </Card>
            )}
          </Section>
          {message && <Notice>{message}</Notice>}
        </>
      )}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
