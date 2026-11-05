import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';

import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Card, MenuList, Notice, Section, SwitchRow } from '../../../../../components/more/ui';
import { useCharts } from '../../../../../components/astro/useCharts';
import { balance, extremes, pairings } from '../../../../../lib/astro/relationship';
import { SIGNS } from '../../../../../lib/astro/signs';
import { fetchShares, positionsToShare, shareChart, stopSharing, type ChartShare } from '../../../../../lib/covens/chartShares';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { type } from '../../../../../theme';

const signOf = (l: number) => SIGNS[Math.floor((((l % 360) + 360) % 360) / 30) % 12];

// Members who choose to share their chart's positions (off by default): the
// circle's element and modality balance, and ritual-role pairings.
export default function CovenCharts() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const { userId, nameOf, loadNames } = coven;
  const { mine } = useCharts();
  const [shares, setShares] = useState<{ rows: ChartShare[]; ready: boolean } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!covenId) return;
    const r = await fetchShares(covenId);
    setShares(r);
    void loadNames(r.rows.map((x) => x.user_id));
  }, [covenId, loadNames]);
  useEffect(() => {
    if (!covenId) return;
    let off = false;
    void fetchShares(covenId).then((r) => {
      if (off) return;
      setShares(r);
      void loadNames(r.rows.map((x) => x.user_id));
    });
    return () => {
      off = true;
    };
  }, [covenId, loadNames]);

  const on = !!shares?.rows.some((r) => r.user_id === userId);
  const toggle = async (v: boolean) => {
    if (!covenId || !userId) return;
    setMessage(null);
    if (v && !mine?.chart) return setMessage('Add your own chart first (Craft, Cosmic, Birth charts).');
    const ok = v ? await shareChart(covenId, userId, positionsToShare(mine!.chart!)) : await stopSharing(covenId, userId);
    if (!ok) setMessage('That isn’t open just yet. Please try again soon.');
    await load();
  };

  const people = useMemo(
    () => (shares?.rows ?? []).map((r) => ({ id: r.user_id, rows: r.positions.map((x) => ({ point: x.p, sign: signOf(x.l) })) })),
    [shares],
  );
  const tally = useMemo(() => balance(people.map((p) => p.rows)), [people]);
  const { most, least } = extremes(tally);
  const roles = useMemo(
    () => pairings(people.flatMap((p) => { const s = p.rows.find((r) => r.point === 'Sun'); return s ? [{ name: nameOf(p.id), sunSign: s.sign }] : []; })),
    [people, nameOf],
  );

  return (
    <CovenScreen title="Chart sharing" eyebrow="The coven’s sky" onRefresh={load}>
      <Section label="Your choice">
        <MenuList>
          <SwitchRow
            label="Share my chart’s positions with this coven"
            detail="Off unless you turn it on. Only the planets’ signs and degrees are shared; never your birth date, time or place. Turn it off to remove it."
            value={on}
            onChange={(v) => void toggle(v)}
            last
          />
        </MenuList>
        {!!message && <Notice>{message}</Notice>}
        {shares && !shares.ready && <Notice>Chart sharing isn’t available yet.</Notice>}
      </Section>
      {people.length > 0 && (
        <Section label="The circle’s balance">
          <Card>
            <Text style={type.body}>{`${people.length} ${people.length === 1 ? 'member has' : 'members have'} shared.`}</Text>
            <Text style={type.body}>{`Elements: ${Object.entries(tally.elements).map(([k, n]) => `${k} ${n}`).join(' · ')}.`}</Text>
            <Text style={type.body}>{`Modalities: ${Object.entries(tally.modalities).map(([k, n]) => `${k} ${n}`).join(' · ')}.`}</Text>
            <Text style={type.caption}>{`The circle leans ${most}; ${least} may need a little more attention in your workings. A tendency, not a rule.`}</Text>
          </Card>
          {roles.length > 0 && (
            <Card>
              <Text style={type.body}>Ritual-role pairings to try:</Text>
              {roles.map((r) => (
                <Text key={r} style={type.body}>{`• ${r}`}</Text>
              ))}
            </Card>
          )}
        </Section>
      )}
    </CovenScreen>
  );
}
