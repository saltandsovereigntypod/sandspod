import { router } from 'expo-router';
import { Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { MenuList, MenuRow } from '../../../../../../components/more/ui';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { KIND_LABELS, orderDocuments } from '../../../../../../lib/covens/model';
import { type } from '../../../../../../theme';

export default function ManagePages() {
  const coven = useCoven();
  const docs = orderDocuments(coven.snapshot?.documents ?? []);
  const open = (id: string) => router.push(`${covenHref(coven.slug, 'manage/page')}?id=${id}` as never);
  return (
    <CovenScreen title="Creed, rules and agreements" need="manage">
      <Text style={type.caption}>Pages everyone can read help seekers decide whether the coven is for them. Agreements are signed before joining, and again whenever their words change.</Text>
      {docs.length > 0 && (
        <MenuList>
          {docs.map((d, i) => (
            <MenuRow
              key={d.id}
              label={d.title}
              detail={[KIND_LABELS[d.kind] ?? 'Page', d.requires_signature ? `to be signed · version ${d.version}` : '', d.visibility === 'members' ? 'members only' : '', d.published === false ? 'draft' : ''].filter(Boolean).join(' · ')}
              last={i === docs.length - 1}
              onPress={() => open(d.id)}
            />
          ))}
        </MenuList>
      )}
      <Button label="Add a page" onPress={() => open('new')} />
    </CovenScreen>
  );
}
