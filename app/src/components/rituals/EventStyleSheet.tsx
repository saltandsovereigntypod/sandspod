import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Sheet } from '../altar/Sheet';
import { Card, Chip, Chips, SectionLabel, Toggle } from './ui';
import type { PrincipalPhase } from '../../lib/moon';
import { alertChoices, DURATION_CHOICES, type EventStyle, type SkyKind } from '../../lib/reminders/calendarEvent';
import { sampleEvent } from '../../lib/reminders/calendarStore';
import { colors, fonts, type } from '../../theme';
import { TimeStepper, clockLabel } from './TimeStepper';

const KIND_NAMES: Record<SkyKind, { title: string; plural: string }> = {
  moon: { title: 'Moon phase events', plural: 'moon phase' },
  holiday: { title: 'Holiday events', plural: 'holiday' },
  astro: { title: 'Eclipse & retrograde events', plural: 'eclipse and retrograde' },
};

const DURATION_LABELS: Record<number, string> = { 30: '30 minutes', 60: '1 hour', 120: '2 hours' };

type Props = {
  kind: SkyKind | null;
  style: EventStyle | null;
  phases: Record<PrincipalPhase, boolean>;
  onClose: () => void;
  onSave: (kind: SkyKind, style: EventStyle) => void;
};

/**
 * Set up one event the way you like it; every event of that kind follows.
 * The parent keys this by kind, so each opening starts from the saved settings.
 */
export function EventStyleSheet({ kind, style, phases, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<EventStyle | null>(style);
  if (!kind || !draft) return null;

  const names = KIND_NAMES[kind];
  const change = (patch: Partial<EventStyle>) => {
    const next = { ...draft, ...patch };
    // An alert from the other kind of timing doesn't carry over.
    if (patch.timing && (patch.timing === 'allDay') !== (draft.timing === 'allDay')) next.alert = null;
    setDraft(next);
  };
  const sample = sampleEvent(kind, phases, draft);
  const alertLabel = alertChoices(draft.timing).find((choice) => choice.offset === draft.alert)?.label;

  return (
    <Sheet visible eyebrow="Your calendar" title={names.title} onClose={onClose}>
      <Text style={type.caption}>Set it up once and every {names.plural} event goes into your calendar the same way.</Text>

      <View style={styles.group}>
        <SectionLabel>When</SectionLabel>
        <Chips>
          <Chip label="All day" selected={draft.timing === 'allDay'} onPress={() => change({ timing: 'allDay' })} />
          {kind !== 'holiday' && (
            <Chip label="At the exact moment" selected={draft.timing === 'exact'} onPress={() => change({ timing: 'exact' })} />
          )}
          <Chip label="At a set time" selected={draft.timing === 'time'} onPress={() => change({ timing: 'time' })} />
        </Chips>
        {draft.timing === 'time' && <TimeStepper minutes={draft.minutes} onChange={(minutes) => change({ minutes })} />}
      </View>

      {draft.timing !== 'allDay' && (
        <View style={styles.group}>
          <SectionLabel>How long</SectionLabel>
          <Chips>
            {DURATION_CHOICES.map((minutes) => (
              <Chip key={minutes} label={DURATION_LABELS[minutes]} selected={draft.duration === minutes} onPress={() => change({ duration: minutes })} />
            ))}
          </Chips>
        </View>
      )}

      <View style={styles.group}>
        <SectionLabel>Alert</SectionLabel>
        <Chips>
          <Chip label="None" selected={draft.alert == null} onPress={() => change({ alert: null })} />
          {alertChoices(draft.timing).map((choice) => (
            <Chip key={choice.offset} label={choice.label} selected={draft.alert === choice.offset} onPress={() => change({ alert: choice.offset })} />
          ))}
        </Chips>
      </View>

      <Card>
        <Toggle
          label="Include what it means"
          detail="The meaning and exact time go in the event's notes"
          value={draft.details}
          onChange={(details) => change({ details })}
        />
      </Card>

      {sample && (
        <View style={styles.group}>
          <SectionLabel>How the next one will look</SectionLabel>
          <Card accent>
            <Text style={type.cardTitle}>{sample.title}</Text>
            <Text style={styles.when}>{whenLine(sample.start, sample.end, sample.allDay)}</Text>
            {!!alertLabel && <Text style={type.caption}>Alert: {alertLabel}</Text>}
            <Text style={type.caption}>{sample.notes}</Text>
          </Card>
        </View>
      )}

      <Button label={`Use for every ${names.plural} event`} onPress={() => onSave(kind, draft)} />
    </Sheet>
  );
}

function whenLine(start: Date, end: Date, allDay: boolean): string {
  const day = start.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  if (allDay) return `${day} · All day`;
  const minutes = (date: Date) => date.getHours() * 60 + date.getMinutes();
  return `${day} · ${clockLabel(minutes(start))} – ${clockLabel(minutes(end))}`;
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  when: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
});
