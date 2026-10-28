import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { MenuList, MenuRow } from '../../../../../../components/more/ui';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import * as api from '../../../../../../lib/covens/api';
import { rankPowers } from '../../../../../../lib/covens/model';
import { positionStatus } from '../../../../../../lib/covens/positions';
import { type } from '../../../../../../theme';

export default function ManagePositions() {
  const coven = useCoven();
  const ranks = [...(coven.snapshot?.ranks ?? [])].sort((a, b) => b.level - a.level);
  const covenId = coven.snapshot?.coven.id;
  // How many hold each position, for its places.
  const [held, setHeld] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    if (!covenId) return;
    let off = false;
    api.fetchMembers(covenId).then(
      (members) => {
        if (off) return;
        const counts: Record<string, number> = {};
        for (const m of members) if (m.rank_id) counts[m.rank_id] = (counts[m.rank_id] ?? 0) + 1;
        setHeld(counts);
      },
      () => {},
    );
    return () => {
      off = true;
    };
  }, [covenId, coven.snapshot]);
  const open = (id: string) => router.push(`${covenHref(coven.slug, 'manage/position')}?id=${id}` as never);
  return (
    <CovenScreen title="Positions" need="manage">
      <Text style={type.caption}>Reviewers can raise members to positions below their own that carry no powers. Only leaders give positions with powers.</Text>
      {ranks.length > 0 && (
        <MenuList>
          {ranks.map((r, i) => {
            const powers = rankPowers(r);
            return (
              <MenuRow
                key={r.id}
                label={r.name}
                detail={[`Level ${r.level}`, held ? positionStatus(r, held[r.id] ?? 0).label : r.is_default ? 'Where new members begin' : '', powers.length ? powers.join(', ') : ''].filter(Boolean).join(' · ')}
                last={i === ranks.length - 1}
                onPress={() => open(r.id)}
              />
            );
          })}
        </MenuList>
      )}
      <Button label="Add a position" onPress={() => open('new')} />
    </CovenScreen>
  );
}
