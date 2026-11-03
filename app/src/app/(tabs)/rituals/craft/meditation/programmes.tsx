import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { useDayContext } from '../../../../../components/craft/hearth';
import { beginSit } from '../../../../../components/meditation/begin';
import { useLastPlan } from '../../../../../components/meditation/PlanForm';
import { Body, Card, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { addEntry, useCraft } from '../../../../../lib/craft/store';
import { newId } from '../../../../../lib/grimoire/ids';
import { NO_EXTRAS } from '../../../../../lib/meditation/extras';
import { normalizeSit, SITS } from '../../../../../lib/meditation/log';
import { focusFor, PROGRAMMES, programmeRun, runLine, sabbatProgress, yearFestivals, type ProgrammeId } from '../../../../../lib/meditation/programmes';
import { cleanPlan } from '../../../../../lib/meditation/timer';
import { fullDate } from '../../../../../lib/calendar';
import { newOwnRecord, TEND_COLLECTION, type TendRecord } from '../../../../../lib/tend/model';

// Meditation programmes (lib/meditation/programmes.ts): 7 days of grounding,
// a 28-day moon cycle and Sabbat sits, each day's sit begun from here with
// its focus and guidance. Progress is read from your log. A programme can be
// put on To tend with "Count my meditations" on, so each sit ticks it.
// Website: /practice/meditation/programmes/.
export default function Programmes() {
  const [plan] = useLastPlan();
  const { entries } = useCraft<unknown>(SITS);
  const { choice } = useDayContext();
  const [message, setMessage] = useState<string | null>(null);
  const now = useMemo(() => new Date(), []);
  const sits = useMemo(() => entries.map((e) => ({ id: e.id, data: normalizeSit(e.data) })), [entries]);
  const festivals = useMemo(() => yearFestivals(now, choice), [now, choice]);
  const sabbats = useMemo(() => sabbatProgress(sits, festivals, now), [sits, festivals, now]);
  // Programme sits are ten minutes unless your own plan is longer.
  const sitPlan = cleanPlan({ ...plan, minutes: plan.minutes === null || plan.minutes < 10 ? 10 : plan.minutes });

  const begin = (id: ProgrammeId, day: number, step = String(day), intention = '') => {
    const f = focusFor(id, day, now);
    beginSit(sitPlan, { ...NO_EXTRAS, kind: f.kind, script: f.script, intention: intention || f.line, programme: id, step });
  };
  const toTend = async (title: string, daily = true) => {
    try {
      await addEntry<TendRecord>(TEND_COLLECTION, newOwnRecord({ name: title, type: 'other', other: 'Meditation', rhythm: { kind: daily ? 'daily' : 'asks' }, meditations: true }, newId()));
      setMessage(`${title} is on your To tend list, and each sit you finish marks it done for the day.`);
    } catch {
      setMessage('That couldn’t be added just now. Please try again.');
    }
  };

  return (
    <RitualScreen back="Meditation">
      <Title eyebrow="Meditation">Programmes</Title>
      <Body muted>A sit a day with a focus for each. Progress comes from your log, so a sit logged for a programme counts wherever you sat it.</Body>
      {message && <Notice>{message}</Notice>}
      {PROGRAMMES.filter((p) => p.days !== null).map((p) => {
        const run = programmeRun(sits, p.id, now);
        const day = run.complete ? 1 : run.next;
        const f = focusFor(p.id, day, now);
        return (
          <View key={p.id} style={ui.gapSmall}>
            <SectionLabel>{p.title}</SectionLabel>
            <Card>
              <Body muted>{p.line}</Body>
              <Body>{runLine(run)}</Body>
              {!run.complete && <Body>{`${run.today ? 'Today’s' : `Day ${day}`}: ${f.title}. ${f.line}`}</Body>}
              {!run.started || run.complete ? (
                <Button label={run.complete ? 'Begin again' : 'Begin day 1'} onPress={() => begin(p.id, 1)} />
              ) : run.today ? (
                <Body muted>Today’s sit is done. Come back tomorrow for the next.</Body>
              ) : (
                <Button label={`Sit day ${day}`} onPress={() => begin(p.id, day)} />
              )}
              {run.started && !run.complete && !run.today && <Button label="Begin again from day 1" variant="text" onPress={() => begin(p.id, 1)} />}
              <Button label="Add to To tend" variant="outline" onPress={() => void toTend(p.title)} />
            </Card>
          </View>
        );
      })}
      <View style={ui.gapSmall}>
        <SectionLabel>Sabbat sits</SectionLabel>
        <Card>
          <Body muted>A sit for each festival in your calendars this year, sat on the day. Your calendars are chosen in Settings.</Body>
          <Body>{sabbats.total ? `${sabbats.done.length} of ${sabbats.total} sat this year` : 'No yearly festivals in your calendars yet.'}</Body>
          {sabbats.today ? (
            <Button label={`Sit for ${sabbats.today.name}`} onPress={() => begin('sabbats', 1, sabbats.today!.id, `For ${sabbats.today!.name}`)} />
          ) : sabbats.next ? (
            <Body muted>{`Next: ${sabbats.next.name}, ${fullDate(sabbats.next.date)}`}</Body>
          ) : null}
          <Button label="Add to To tend" variant="outline" onPress={() => void toTend('Sabbat sits', false)} />
        </Card>
      </View>
    </RitualScreen>
  );
}
