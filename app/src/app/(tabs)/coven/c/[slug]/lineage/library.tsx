import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Card, Notice } from '../../../../../../components/more/ui';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { KIND_LABELS, libraryLine, libraryState, type LibraryItem } from '../../../../../../lib/covens/lineage';
import { copyFromMother, fetchMotherLibrary } from '../../../../../../lib/covens/lineageApi';
import { errorMessage } from '../../../../../../lib/covens/model';
import { colors, type } from '../../../../../../theme';

// "From your mother coven": what the mother coven shares with its daughters.
// The coven's leaders copy what they want in, as a copy of their own;
// copying again later adds a new copy beside theirs, never over it.
export default function MotherLibrary() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  const mother = coven.lineage?.mother?.name ?? 'your mother coven';
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const covenId = info?.id;

  const [version, setVersion] = useState(0);
  const load = useCallback(async () => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!covenId) return;
    let live = true;
    void fetchMotherLibrary(covenId).then((list) => live && setItems(list));
    return () => {
      live = false;
    };
  }, [covenId, version]);

  const copy = async (item: LibraryItem) => {
    if (!covenId) return;
    setBusy(item.item_id);
    setMessage(null);
    try {
      await copyFromMother(covenId, item.kind, item.item_id);
      setMessage(`“${item.title}” is copied in. It’s the coven’s own now.`);
      await Promise.all([load(), coven.refresh()]);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(null);
  };

  return (
    <CovenScreen title="From your mother coven" onRefresh={load}>
      <Text style={type.body}>What {mother} shares with its daughter covens. Copying is one way, and only when you choose: nothing here ever changes your copies by itself. (The head of {mother} can update a copy of yours; it’s kept in the lineage log.)</Text>
      {!items && <ActivityIndicator color={colors.gold} />}
      {items && !items.length && <Text style={type.caption}>{mother} isn’t sharing anything with its daughters yet.</Text>}
      {(items ?? []).map((item) => (
        <Card key={`${item.kind}-${item.item_id}`}>
          <Text style={type.eyebrow}>{KIND_LABELS[item.kind]}</Text>
          <Text style={type.cardTitle}>{item.title}</Text>
          <Text style={type.caption}>{libraryLine(item)}</Text>
          {coven.perms.manage && (
            <Button
              label={busy === item.item_id ? 'Copying…' : libraryState(item) === 'new' ? 'Copy in' : 'Copy again'}
              variant={libraryState(item) === 'current' ? 'outline' : 'primary'}
              disabled={!!busy}
              onPress={() => void copy(item)}
            />
          )}
        </Card>
      ))}
      {!coven.perms.manage && <Text style={type.caption}>The coven’s leaders copy things in.</Text>}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}
