import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Share, Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { ScriptView } from '../../../../../../components/covens/builder/ScriptView';
import { Chips } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { builderStepFrom, cleanPlan, type GatheringKind } from '../../../../../../lib/covens/builder';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { orderSteps, type BookPage } from '../../../../../../lib/covens/model';
import { buildScript, scriptText } from '../../../../../../lib/covens/script';
import { type } from '../../../../../../theme';

const MODES = [
  { value: 'script', label: 'The whole script' },
  { value: 'run', label: 'Your run-through' },
] as const;

// A gathering read back (lib/covens/script.ts): the whole script, every word
// with who says it, or your run-through with your own parts marked. Words
// linked from the coven's Book are read as the page stands now. Shared or
// printed through the phone's share sheet; the website prints it.
export default function RitualScript() {
  const { id, mode: start } = useLocalSearchParams<{ id: string; mode?: string }>();
  const coven = useCoven();
  const ritual = coven.rituals.find((r) => r.id === id);
  const [mode, setMode] = useState<'script' | 'run'>(start === 'run' ? 'run' : 'script');
  const [pages, setPages] = useState<BookPage[]>([]);
  const covenId = coven.snapshot?.coven.id;
  const kind: GatheringKind = ritual?.kind === 'meeting' ? 'meeting' : 'rite';
  const plan = useMemo(() => cleanPlan(ritual?.plan, kind), [ritual?.plan, kind]);
  const steps = useMemo(() => orderSteps(coven.steps, id).map((s) => builderStepFrom(s, plan)), [coven.steps, id, plan]);
  // Linked pages you can't open come back marked, so the script says only that.
  const linkedKey = steps.map((s) => s.details.book_page_id).filter(Boolean).join(',');
  useEffect(() => {
    if (covenId && linkedKey) api.fetchBookPages(covenId, linkedKey.split(',')).then(setPages).catch(() => setPages([]));
  }, [covenId, linkedKey]);

  if (!ritual) {
    return (
      <CovenScreen title="The script">
        <Text style={type.body}>{coven.rituals.length ? 'This ritual couldn’t be found.' : 'Loading…'}</Text>
      </CovenScreen>
    );
  }
  const script = buildScript({ title: ritual.title, kind, plan, steps, ctx: { ranks: coven.snapshot?.ranks ?? [], nameOf: coven.nameOf }, pages, viewer: { membership: coven.snapshot?.membership ?? null, userId: coven.userId } });
  const share = () => void Share.share({ title: ritual.title, message: scriptText(script, { mineOnly: mode === 'run' }) }).catch(() => undefined);
  return (
    <CovenScreen title={ritual.title}>
      <Chips label="Read it as" options={MODES} value={mode} onChange={setMode} />
      <Text style={type.caption}>{mode === 'run' ? 'Every step in order, with yours marked in gold.' : `Every step and every word, in order${script.minutes ? `, about ${script.minutes} minutes` : ''}.`}</Text>
      <ScriptView script={script} mode={mode} />
      <Button label={mode === 'run' ? 'Share your parts' : 'Share or print the script'} variant="outline" onPress={share} />
    </CovenScreen>
  );
}
