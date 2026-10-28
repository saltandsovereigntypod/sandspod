import { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Chips, MenuList, Notice, Section, SwitchRow } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import type { Succession } from '../../../../../../lib/covens/lineage';
import { fetchDaughterFounders, fetchSuccession, setDaughterFounder, setRankFoundsDaughters, setSuccessors } from '../../../../../../lib/covens/lineageApi';
import { errorMessage, type Member, type Rank } from '../../../../../../lib/covens/model';
import { type } from '../../../../../../theme';

const NONE = '';

// Manage → Leadership: the succession plan (who leads next, and a second),
// and who may ask to found a daughter coven. The head chooses (or, for a
// daughter coven, the head of its mother coven, who can always change it).
export default function Leadership() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  const ranks = coven.snapshot?.ranks ?? [];
  const head = coven.perms.founder;
  const [members, setMembers] = useState<Member[]>([]);
  const [plan, setPlan] = useState<Succession | null>(null);
  const [first, setFirst] = useState(NONE);
  const [second, setSecond] = useState(NONE);
  const [named, setNamed] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const covenId = info?.id;
  const loadNames = coven.loadNames;

  const [version, setVersion] = useState(0);
  const load = useCallback(async () => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!covenId) return;
    let live = true;
    void Promise.all([api.fetchMembers(covenId).catch(() => [] as Member[]), fetchSuccession(covenId), fetchDaughterFounders(covenId)]).then(async ([people, saved, founders]) => {
      await loadNames(people.map((m) => m.user_id));
      if (!live) return;
      setMembers(people);
      setPlan(saved);
      setFirst(saved?.successor_id ?? NONE);
      setSecond(saved?.second_id ?? NONE);
      setNamed(founders.map((f) => f.user_id));
    });
    return () => {
      live = false;
    };
  }, [covenId, loadNames, version]);

  const others = members.filter((m) => m.status === 'active' && m.user_id !== info?.founder_id);
  const options = [{ value: NONE, label: 'No one' }, ...others.map((m) => ({ value: m.user_id, label: coven.nameOf(m.user_id) }))];

  const save = async () => {
    if (!covenId) return;
    setBusy(true);
    setMessage(null);
    try {
      await setSuccessors(covenId, first || null, first && second && second !== first ? second : null);
      await load();
      setMessage(first ? `${coven.nameOf(first)} is named to lead next. They’re told.` : 'No successor is named.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const toggleRank = async (rank: Rank, on: boolean) => {
    setMessage(null);
    try {
      await setRankFoundsDaughters(rank, on);
      await coven.refresh();
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };
  const togglePerson = async (userId: string, on: boolean) => {
    if (!covenId) return;
    setMessage(null);
    setNamed((prev) => (on ? [...prev, userId] : prev.filter((id) => id !== userId)));
    try {
      await setDaughterFounder(covenId, userId, on);
    } catch (error) {
      setMessage(errorMessage(error));
      await load();
    }
  };
  const founds = (r: Rank) => !!(r as Rank & { can_found_daughter?: boolean }).can_found_daughter;

  return (
    <CovenScreen title="Leadership" need="manage" onRefresh={load}>
      {!head && <Notice tone="muted">Only the coven’s head (or the head of its mother coven) changes these. You can see them.</Notice>}
      <Section label="Succession plan">
        <Text style={type.body}>
          Name who leads the coven next, and a second. If the head closes their account, the coven goes to them. If the head can’t be reached, the coven’s elders can tell the site moderators, who can hand it on to them.
        </Text>
        <Chips label="Successor" options={options} value={first} onChange={setFirst} />
        {!!first && <Chips label="Second" options={options.filter((o) => o.value !== first)} value={second} onChange={setSecond} />}
        {plan && <Text style={type.caption}>Last set {new Date(plan.updated_at).toLocaleDateString()}{plan.set_by ? ` by ${coven.nameOf(plan.set_by)}` : ''}.</Text>}
        {head && <Button label={busy ? 'Saving…' : 'Save the plan'} disabled={busy} onPress={save} />}
      </Section>
      <Section label="Who may ask to found a daughter coven">
        <Text style={type.caption}>Positions with this power can ask; so can anyone you name. You approve every request either way.</Text>
        <MenuList>
          {[...ranks]
            .sort((a, b) => b.level - a.level)
            .map((r, i, all) => (
              <SwitchRow key={r.id} label={r.name} detail={r.can_manage ? 'Leads the coven' : undefined} value={founds(r)} onChange={(on) => void toggleRank(r, on)} last={i === all.length - 1} />
            ))}
        </MenuList>
        {others.length > 0 && (
          <MenuList>
            {others.map((m, i) => (
              <SwitchRow key={m.user_id} label={coven.nameOf(m.user_id)} detail="Named by you" value={named.includes(m.user_id)} onChange={(on) => void togglePerson(m.user_id, on)} last={i === others.length - 1} />
            ))}
          </MenuList>
        )}
      </Section>
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}
