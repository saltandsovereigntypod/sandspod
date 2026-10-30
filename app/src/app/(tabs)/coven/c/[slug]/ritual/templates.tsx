import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Card, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { contentFromCovenTemplate, draftFromCoven, kindLabel } from '../../../../../../lib/rituals/community';
import { saveTemplate } from '../../../../../../lib/rituals/store';
import { type } from '../../../../../../theme';

// The coven's own templates (coven_ritual_library), for its members to keep
// a copy of and for those who lead its rituals to share with the community.
// Planning a gathering from one is under Plan a ritual.
export default function CovenTemplates() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const covenName = coven.snapshot?.coven.name ?? 'the coven';
  const leads = (coven.perms.lead && coven.standing.ok) || coven.perms.site;
  const [items, setItems] = useState<api.LibraryRow[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!covenId) return;
    void api.fetchLibrary(covenId).then((rows) => setItems(rows.filter((r) => r.kind === 'template')));
  }, [covenId]);

  const toMine = async (item: api.LibraryRow) => {
    setBusy(true);
    setMessage(null);
    try {
      const saved = await saveTemplate(draftFromCoven(item.title, item.body, covenName));
      router.push({ pathname: '/rituals/templates/[id]', params: { id: saved.id } });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <CovenScreen title="The coven’s templates">
      <Text style={type.body}>Rites and meetings the coven keeps to plan from. Save a copy to your own rituals{leads ? ', or share one with the community' : ''}.</Text>
      {!!message && <Notice>{message}</Notice>}
      {items && !items.length && <Text style={type.caption}>The coven hasn’t kept a template yet. Those who lead its rituals keep one from a ritual’s page, or while planning.</Text>}
      {(items ?? []).map((item) => {
        const content = contentFromCovenTemplate(item.title, item.body);
        return (
          <Card key={item.id}>
            <Text style={type.eyebrow}>{kindLabel(content.kind)}</Text>
            <Text style={type.cardTitle}>{item.title}</Text>
            {!!content.summary && <Text style={type.body}>{content.summary}</Text>}
            <Text style={type.caption}>{`${content.steps.length} ${content.steps.length === 1 ? 'step' : 'steps'}`}</Text>
            <View>
              {coven.userId && <Button label="Save to my templates" variant="outline" disabled={busy} onPress={() => void toMine(item)} />}
              {leads && (
                <Button
                  label="Share with the community"
                  variant="text"
                  onPress={() => router.push({ pathname: '/rituals/community/share', params: { covenId, itemId: item.id } })}
                />
              )}
            </View>
          </Card>
        );
      })}
    </CovenScreen>
  );
}
