import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Connections } from '../../../../components/rituals/Connections';
import { Body, Card, Chip, Chips, RitualScreen, SectionLabel, Title, confirmAction, tell, ui } from '../../../../components/rituals/ui';
import { journalDetail } from '../../../../lib/rituals/format';
import { journalConnections } from '../../../../lib/rituals/plans';
import { deleteJournal, useRituals } from '../../../../lib/rituals/store';
import type { JournalRow } from '../../../../lib/rituals/types';

const SECTIONS: [string, keyof JournalRow][] = [
  ['Intention', 'intention'],
  ['Before beginning', 'feelings_before'],
  ['What happened', 'what_happened_during'],
  ['While it happened', 'feelings_during'],
  ['What stood out', 'signs_and_symbols'],
  ['Afterward', 'what_happened_after'],
  ['How I feel now', 'feelings_after'],
  ['Dreams and follow-up signs', 'dreams_and_follow_up'],
  ['Watching for', 'results'],
  ['Next time', 'changes_for_next_time'],
  ['Notes', 'notes'],
];

export default function JournalEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rituals = useRituals();
  const entry = rituals.journal.find((j) => j.id === id) ?? null;

  if (!entry) {
    return (
      <RitualScreen back="Journal">
        <Title>Journal</Title>
        <Body>{rituals.status === 'loading' || rituals.status === 'idle' ? 'Opening…' : "This entry couldn't be found. It may have been removed on the website."}</Body>
      </RitualScreen>
    );
  }

  const links = journalConnections(entry, rituals.links, rituals.templates);
  const template = links.templateId ? rituals.templates.find((t) => t.id === links.templateId) : null;
  const steps = Array.isArray(entry.metadata?.completedSteps)
    ? (entry.metadata.completedSteps as { title?: string; status?: string }[])
    : [];
  const altarItems = ((entry.altar_snapshot as { objects?: { label?: string }[] })?.objects ?? [])
    .map((o) => o.label)
    .filter((label): label is string => !!label);

  const remove = async () => {
    const ok = await confirmAction('Delete this ritual?', 'It is removed from your journal here and on the website.', 'Delete');
    if (!ok) return;
    try {
      await deleteJournal(entry.id);
      router.replace('/rituals');
    } catch (e) {
      tell("Couldn't delete", e instanceof Error ? e.message : 'Please try again.');
    }
  };

  return (
    <RitualScreen back="Journal">
      <Title eyebrow={[entry.day_of_week, entry.time_of_day].filter(Boolean).join(' · ') || 'Ritual journal'}>{entry.title || 'Untitled Ritual'}</Title>
      <Body muted>{journalDetail(entry)}</Body>

      <Connections
        grimoirePageId={links.grimoirePageId}
        altarId={links.altarId}
        altars={rituals.altars}
        templateId={links.templateId}
        templateTitle={template?.title}
        date={links.date}
        ingredients={links.ingredients}
      />

      {SECTIONS.map(([label, key]) => {
        const value = entry[key];
        return typeof value === 'string' && value.trim() ? (
          <View key={key} style={ui.gapSmall}>
            <SectionLabel>{label}</SectionLabel>
            <Body>{value}</Body>
          </View>
        ) : null;
      })}

      {altarItems.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>On the altar</SectionLabel>
          <Chips>
            {altarItems.map((label, i) => (
              <Chip key={`${label}-${i}`} label={label} />
            ))}
          </Chips>
        </View>
      )}

      {steps.length > 0 && (
        <Card>
          <SectionLabel>Steps</SectionLabel>
          {steps.map((step, i) => (
            <Body key={i} muted>{`${i + 1}. ${step.title ?? 'Step'}${step.status === 'skipped' ? ' · skipped' : step.status === 'completed' ? '' : ` · ${step.status ?? ''}`}`}</Body>
          ))}
        </Card>
      )}

      <View style={ui.actions}>
        <Button label="Edit reflections" variant="outline" onPress={() => router.push({ pathname: '/rituals/journal/new', params: { id: entry.id } })} />
        {!!links.templateId && (
          <Button label="Plan it again" variant="outline" onPress={() => router.push({ pathname: '/rituals/planner', params: { templateId: links.templateId } })} />
        )}
        <Button label="Delete" variant="text" onPress={remove} />
      </View>
    </RitualScreen>
  );
}
