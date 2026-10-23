import { router } from 'expo-router';
import { Text } from 'react-native';

import { Button } from '../../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../../components/covens/CovenScreen';
import { MenuList, MenuRow } from '../../../../../../../components/more/ui';
import { useCoven } from '../../../../../../../lib/covens/CovenContext';
import { rankPowers } from '../../../../../../../lib/covens/model';
import { type } from '../../../../../../../theme';

export default function ManagePositions() {
  const coven = useCoven();
  const ranks = [...(coven.snapshot?.ranks ?? [])].sort((a, b) => b.level - a.level);
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
                detail={[`Level ${r.level}`, r.is_default ? 'new members begin here' : '', r.open_to_applications ? 'open to apply for' : '', powers.length ? powers.join(', ') : ''].filter(Boolean).join(' · ')}
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
