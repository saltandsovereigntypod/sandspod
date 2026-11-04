import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../components/covens/CovenScreen';
import { SwapRow, useCovenRota } from '../../../../../components/covens/Rota';
import { Card, Chips, Field, MenuList, MenuRow, Notice, Section, SwitchRow } from '../../../../../components/more/ui';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { errorMessage, riteTime } from '../../../../../lib/covens/model';
import { APPLIES, cleanDuty, dutiesAt, DUTY_IDEAS, moveInRotation, swapStillFits, type RotaApplies, type RotaDuty } from '../../../../../lib/covens/rota';
import { removeDuty, saveDuty } from '../../../../../lib/covens/sharedApi';
import { type } from '../../../../../theme';

// The coven's duties rota: duties that turn among members from one gathering
// to the next (lib/covens/rota.ts). Everyone sees who has what at the
// gatherings coming up and answers swaps; those who lead the coven's rites
// set the duties and the order of people. Each gathering's page shows its
// duties, and Today shows yours.

type Draft = { id: string | null; name: string; detail: string; applies: RotaApplies; rotation: string[] };

export default function CovenRota() {
  const coven = useCoven();
  const { data, assignments, reload } = useCovenRota();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const leads = coven.perms.lead || coven.perms.manage || coven.perms.founder;
  const may = coven.perms.member && coven.standing.ok;

  const upcoming = (data?.gatherings ?? []).filter((g) => (g.status === 'scheduled' || g.status === 'live') && Date.parse(g.scheduled_for ?? '') > Date.now() - 3 * 3600_000).slice(0, 6);
  const swaps = (data?.swaps ?? []).filter((s) => s.status === 'pending' && (s.to_user === coven.userId || s.from_user === coven.userId) && swapStillFits(s, assignments, data?.members ?? []));
  const titleOf = (id: string) => coven.rituals.find((r) => r.id === id)?.title ?? 'Gathering';
  const nameOfDuty = (id: string) => data?.duties.find((d) => d.id === id)?.name ?? '';

  const edit = (d: RotaDuty | null) => {
    setMessage(null);
    setDraft(d ? { id: d.id, name: d.name, detail: d.detail ?? '', applies: d.applies, rotation: d.rotation } : { id: null, name: '', detail: '', applies: 'all', rotation: data?.members ?? [] });
  };
  const save = async () => {
    if (!draft || !data) return;
    const clean = cleanDuty(draft);
    if (!clean.name) return setMessage('Give the duty a name.');
    if (!clean.rotation.length) return setMessage('Choose at least one person for it to turn among.');
    setBusy(true);
    try {
      await saveDuty(data.covenId, draft.id, draft.id ? clean : { ...clean, sort_order: data.duties.length });
      setDraft(null);
      await reload();
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const retire = async () => {
    if (!draft?.id) return;
    setBusy(true);
    try {
      await removeDuty(draft.id);
      setDraft(null);
      await reload();
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <CovenScreen title="Duties rota" eyebrow="Who does what at each gathering" onRefresh={reload}>
      {!data ? (
        <Text style={type.caption}>Loading…</Text>
      ) : !data.ready ? (
        <Notice tone="muted">The duties rota isn’t open yet. It will appear here soon.</Notice>
      ) : draft ? (
        <Section label={draft.id ? 'Change the duty' : 'A new duty'}>
          {!draft.id && (
            <Chips
              label="Ideas"
              options={DUTY_IDEAS.map((i) => ({ value: i.name, label: i.name }))}
              value={draft.name}
              onChange={(name) => setDraft({ ...draft, name, detail: DUTY_IDEAS.find((i) => i.name === name)?.detail ?? draft.detail })}
            />
          )}
          <Field label="Duty" value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} maxLength={80} placeholder="Brings the candles" />
          <Field label="What it asks (optional)" value={draft.detail} onChangeText={(detail) => setDraft({ ...draft, detail })} maxLength={500} multiline />
          <Chips label="Turns at" options={APPLIES} value={draft.applies} onChange={(applies) => setDraft({ ...draft, applies })} />
          <Text style={type.eyebrow}>Who it turns among, in order</Text>
          <MenuList>
            {data.members.map((u, i) => (
              <SwitchRow
                key={u}
                label={draft.rotation.includes(u) ? `${draft.rotation.indexOf(u) + 1}. ${coven.nameOf(u)}` : coven.nameOf(u)}
                value={draft.rotation.includes(u)}
                onChange={(on) => setDraft({ ...draft, rotation: on ? [...draft.rotation, u] : draft.rotation.filter((x) => x !== u) })}
                last={i === data.members.length - 1}
                accessory={
                  draft.rotation.includes(u) && draft.rotation.indexOf(u) > 0 ? (
                    <Button label="Up" variant="text" onPress={() => setDraft({ ...draft, rotation: moveInRotation(draft.rotation, u, -1) })} />
                  ) : undefined
                }
              />
            ))}
          </MenuList>
          <Text style={type.caption}>The first gathering from now goes to the first person, the next to the second, and so on. Someone who says they can’t come is passed over that once; their place in the order stays.</Text>
          <View style={styles.row}>
            <Button label={busy ? 'Saving…' : 'Save'} disabled={busy} onPress={() => void save()} />
            <Button label="Cancel" variant="text" onPress={() => setDraft(null)} />
          </View>
          {!!draft.id && <Button label="Stop this duty" variant="text" disabled={busy} onPress={() => void retire()} />}
          {message && <Notice>{message}</Notice>}
        </Section>
      ) : (
        <>
          {swaps.length > 0 && (
            <Section label="Swaps">
              {swaps.map((s) => (
                <SwapRow key={s.id} swap={s} duties={data.duties} onDone={() => void reload()} />
              ))}
            </Section>
          )}
          {!data.duties.length ? (
            <Card>
              <Text style={type.body}>The coven has no duties on a rota yet.</Text>
              <Text style={type.caption}>
                {leads ? 'Add duties such as who brings the candles, who calls the quarters, who hosts and who clears up. The app turns each among the people you choose, gathering by gathering.' : 'Those who lead the coven’s rites set them.'}
              </Text>
            </Card>
          ) : (
            <Section label="Coming up">
              {!upcoming.length && <Text style={type.caption}>No gatherings on the calendar yet.</Text>}
              {upcoming.map((g) => {
                const here = dutiesAt(assignments, g.id);
                if (!here.length) return null;
                return (
                  <Card key={g.id}>
                    <Text style={type.cardTitle}>{titleOf(g.id)}</Text>
                    <Text style={type.caption}>{riteTime(g.scheduled_for)}</Text>
                    {here.map((a) => (
                      <Text key={a.dutyId} style={[type.body, a.userId === coven.userId && styles.mine]}>
                        {nameOfDuty(a.dutyId)}: {a.userId ? (a.userId === coven.userId ? 'you' : coven.nameOf(a.userId)) : 'nobody free'}
                        {a.swapped ? ' (swapped)' : a.covered ? ' (covering)' : ''}
                      </Text>
                    ))}
                    {may && <Button label="Open, to swap" variant="text" onPress={() => router.push(covenHref(coven.slug, `ritual/${g.id}`))} />}
                  </Card>
                );
              })}
            </Section>
          )}
          {data.duties.length > 0 && (
            <Section label="The duties">
              <MenuList>
                {data.duties.map((d, i) => (
                  <MenuRow
                    key={d.id}
                    label={d.name}
                    detail={[APPLIES.find((a) => a.value === d.applies)?.label, d.rotation.map((u) => coven.nameOf(u)).join(' → ')].filter(Boolean).join(' · ')}
                    icon="journey"
                    last={i === data.duties.length - 1}
                    onPress={leads ? () => edit(d) : undefined}
                  />
                ))}
              </MenuList>
            </Section>
          )}
          {leads && may && <Button label="Add a duty" variant="outline" onPress={() => edit(null)} />}
          {message && <Notice>{message}</Notice>}
        </>
      )}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  mine: { fontWeight: '600' },
});
