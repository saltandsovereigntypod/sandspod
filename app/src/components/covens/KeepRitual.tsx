import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Button } from '../Button';
import { Notice, Section } from '../more/ui';
import * as api from '../../lib/covens/api';
import { builderStepFrom, cleanPlan, libraryStep } from '../../lib/covens/builder';
import { useCoven } from '../../lib/covens/CovenContext';
import type { Ritual, RitualStep } from '../../lib/covens/model';
import { draftFromCoven } from '../../lib/rituals/community';
import { saveTemplate } from '../../lib/rituals/store';
import { type } from '../../theme';

/**
 * Keep a coven's rite or meeting: as your own template (any member; its
 * words and directions, never its roles or who was cast), or, for those who
 * lead its rituals, as one of the coven's templates, which can then be
 * shared with the community.
 */
export function KeepRitual({ ritual, steps }: { ritual: Ritual; steps: RitualStep[] }) {
  const coven = useCoven();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [keptId, setKeptId] = useState<string | null>(null);
  const covenId = coven.snapshot?.coven.id;
  const covenName = coven.snapshot?.coven.name ?? 'the coven';
  const leads = (coven.perms.lead && coven.standing.ok) || coven.perms.site;
  if (!steps.length || !covenId || !(coven.perms.member || coven.perms.site) || !coven.userId) return null;
  const kind = ritual.kind === 'meeting' ? 'meeting' : 'rite';

  const toMine = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const saved = await saveTemplate(
        draftFromCoven(ritual.title, { kind, intention: ritual.intention ?? '', description: ritual.description ?? '', occasion_name: ritual.occasion_name ?? '', steps }, covenName),
      );
      router.push({ pathname: '/rituals/templates/[id]', params: { id: saved.id } });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const toCoven = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const plan = cleanPlan(ritual.plan, kind);
      const kept = await api.saveLibrary(covenId, null, 'template', ritual.title, {
        kind,
        intention: ritual.intention ?? '',
        description: ritual.description ?? '',
        occasion: ritual.occasion ?? '',
        occasion_name: ritual.occasion_name ?? '',
        plan,
        steps: steps.map((s) => libraryStep(builderStepFrom(s, plan))),
      });
      setKeptId(kept.id);
      setMessage(`“${ritual.title}” is kept with the coven’s templates.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section label="Keep it">
      <Text style={type.caption}>Keep its steps to do again: as your own ritual, or as one of the coven’s templates to plan from.</Text>
      <Button label="Save to my templates" variant="outline" disabled={busy} onPress={() => void toMine()} />
      {leads && !keptId && <Button label="Keep as one of the coven’s templates" variant="outline" disabled={busy} onPress={() => void toCoven()} />}
      {leads && keptId && (
        <Button
          label="Share with the community"
          variant="outline"
          onPress={() => router.push({ pathname: '/rituals/community/share', params: { covenId, itemId: keptId } })}
        />
      )}
      {!!message && <Notice>{message}</Notice>}
    </Section>
  );
}
