import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Field, List, Notice, RitualScreen, Row, SectionLabel, SignInCard, Title, tell, ui } from '../../../../components/rituals/ui';
import { minutesLabel } from '../../../../lib/rituals/format';
import { refresh, startRitual, useRituals } from '../../../../lib/rituals/store';
import { useSession } from '../../../../lib/session';

export default function Templates() {
  const { session } = useSession();
  const rituals = useRituals();
  const [title, setTitle] = useState('');
  const [intention, setIntention] = useState('');
  const [starting, setStarting] = useState(false);

  const beginFree = async () => {
    setStarting(true);
    try {
      await startRitual({ kind: 'free', title, intention });
      router.replace('/rituals/run');
    } catch (e) {
      tell("Couldn't begin", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <RitualScreen back="Rituals" onRefresh={refresh}>
      <Title eyebrow="Begin a ritual">Templates</Title>

      {rituals.active && (
        <Card accent>
          <Body>{`"${rituals.active.title || 'Your ritual'}" is still under way. Finish it before beginning another.`}</Body>
          <Button label="Continue the ritual" onPress={() => router.push('/rituals/run')} />
        </Card>
      )}

      {session ? (
        <View style={ui.gapSmall}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionLabel>Your templates</SectionLabel>
            <Button label="New template" variant="text" onPress={() => router.push('/rituals/templates/edit')} />
          </View>
          {rituals.status === 'offline' && <Notice>Offline · showing the copy saved on this phone</Notice>}
          {rituals.templates.length === 0 ? (
            <Card>
              <Body>
                {rituals.status === 'loading'
                  ? 'Opening your ritual book…'
                  : 'No templates yet. Write one here, build a spell, or use the template editor at the website’s altar.'}
              </Body>
            </Card>
          ) : (
            <List>
              {rituals.templates.map((template, i, all) => {
                const steps = template.ritual_template_steps?.length ?? 0;
                const detail = [`${steps} ${steps === 1 ? 'step' : 'steps'}`, minutesLabel(template.estimated_duration_seconds), template.intention]
                  .filter(Boolean)
                  .join(' · ');
                return (
                  <Row
                    key={template.id}
                    title={template.title}
                    detail={detail}
                    last={i === all.length - 1}
                    onPress={() => router.push({ pathname: '/rituals/templates/[id]', params: { id: template.id } })}
                  />
                );
              })}
            </List>
          )}
        </View>
      ) : (
        <SignInCard
          title="Templates live in your account"
          body="As on the website, ritual templates are kept with your Salt & Sovereignty account. Sign in to see yours and write new ones. You can still build a spell or begin a working of your own below."
        />
      )}

      <Card>
        <SectionLabel>A working of your own</SectionLabel>
        <Body muted>No steps, just a clock. Finish when you're ready and journal what happened.</Body>
        <Field label="Name (optional)" value={title} onChange={setTitle} placeholder="Evening candle, tea ritual…" />
        <Field label="Intention (optional)" value={intention} onChange={setIntention} placeholder="What are you tending tonight?" multiline />
        <Button label={starting ? 'Beginning…' : 'Begin'} disabled={starting || !!rituals.active} onPress={beginFree} />
      </Card>

      <List>
        <Row icon="altar" title="Build a spell" detail="Choose ingredients and words, and we'll lay out the steps" last onPress={() => router.push('/rituals/spell')} />
      </List>
    </RitualScreen>
  );
}
