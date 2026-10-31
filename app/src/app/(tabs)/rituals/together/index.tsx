import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, Field, MenuList, MenuRow, MoreScreen, Notice, Section } from '../../../../components/more/ui';
import * as covens from '../../../../lib/covens/api';
import { errorMessage } from '../../../../lib/covens/model';
import { useSession } from '../../../../lib/session';
import * as api from '../../../../lib/together/api';
import { isOver, parseLiveCode, statusLine, TOGETHER_GUIDANCE, type LiveRitual } from '../../../../lib/together/live';
import { type } from '../../../../theme';

// Rituals together: begin one (handed here by a Begin together button on a
// ready-made working, a saved ritual or spell, or a coven gathering), join one
// by its code or link, and the ones you're in. The ritual itself is ./[id].tsx.
// Website: rituals/together/ (rituals/together/together.js).
export default function RitualsTogether() {
  const params = useLocalSearchParams<{ code?: string; start?: string }>();
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [me, setMe] = useState<covens.Me | null>(null);
  const [mine, setMine] = useState<LiveRitual[]>([]);
  const [code, setCode] = useState(String(params.code ?? ''));
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof api.previewLive>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const start = params.start ? api.takePendingStart() : null;

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [who, list] = await Promise.all([covens.fetchMe(userId), api.myLive(userId).catch(() => [])]);
      setMe(who);
      setMine(list.filter((l) => !isOver(l)));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [userId]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  // A code from a link: look it up straight away.
  const parsed = parseLiveCode(code);
  useEffect(() => {
    if (!userId || !parsed) return;
    let live = true;
    api
      .previewLive(parsed)
      .then((p) => live && setPreview(p))
      .catch((error) => live && setMessage(errorMessage(error)));
    return () => {
      live = false;
    };
  }, [userId, parsed]);

  const act = async (work: () => Promise<LiveRitual>) => {
    setBusy(true);
    setMessage(null);
    try {
      const live = await work();
      router.replace(`/rituals/together/${live.id}` as Href);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  if (!session) {
    return (
      <MoreScreen title="Rituals together" eyebrow="Rituals" back={'/rituals' as Href} backLabel="Rituals">
        <Card>
          <Text style={type.body}>Sign in to do a ritual together with your coven or friends.</Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </Card>
      </MoreScreen>
    );
  }

  const profiled = !!me?.profile;
  return (
    <MoreScreen title="Rituals together" eyebrow="Rituals" back={'/rituals' as Href} backLabel="Rituals">
      <Text style={type.body}>
        Do a ritual live with others, each from where you are. The one leading moves everyone through the same steps; you light a candle together, see who’s here, talk quietly in the chat or not at all, and close it together.
      </Text>
      {me && !profiled && (
        <Notice>
          Rituals together use your community profile, the name others see. Making one asks you to confirm you are 18 or older.
        </Notice>
      )}
      {me && !profiled && <Button label="Make your community profile" onPress={() => router.push('/coven/profile' as Href)} />}
      {me?.banned && <Notice>Your community access is paused, so rituals together aren’t open to you.</Notice>}

      {start && profiled && !me?.banned && (
        <Section label="Begin together">
          <Card tone="gold">
            <Text style={type.cardTitle}>{start.title}</Text>
            {!!start.intention && <Text style={type.body}>{start.intention}</Text>}
            <Text style={type.caption}>
              {start.steps.length} {start.steps.length === 1 ? 'step' : 'steps'}
              {start.gathering_id ? ' · everyone the gathering is for can join from its page, and hears it has begun' : ' · you’ll have a link to invite people'}
            </Text>
            <Button label={busy ? 'Beginning…' : 'Open the ritual for others to join'} disabled={busy} onPress={() => void act(() => api.startLive(start, start))} />
          </Card>
        </Section>
      )}

      {profiled && !me?.banned && (
        <Section label="Join with a code">
          <Field label="The code or link you were sent" value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} />
          {parsed && preview?.found === false && <Notice tone="muted">That ritual together wasn’t found, or it has ended.</Notice>}
          {parsed && preview?.found && (
            <Card>
              <Text style={type.cardTitle}>{preview.title}</Text>
              <Text style={type.caption}>
                Hosted by {preview.host_name ?? 'a witch'}
                {preview.coven_name ? ` · ${preview.coven_name}` : ''} · {preview.people ?? 0} here
              </Text>
              <Button label={busy ? 'Joining…' : 'Join'} disabled={busy} onPress={() => void act(() => api.joinLive(preview.id ?? null, parsed))} />
            </Card>
          )}
        </Section>
      )}

      {mine.length > 0 && (
        <Section label="Yours now">
          <MenuList>
            {mine.map((l, i) => (
              <MenuRow key={l.id} label={l.title} detail={`${l.host_id === userId ? 'Hosting' : 'Joined'} · ${statusLine(l)}`} last={i === mine.length - 1} onPress={() => router.push(`/rituals/together/${l.id}` as Href)} />
            ))}
          </MenuList>
        </Section>
      )}

      <Section label="Begin one from">
        <MenuList>
          <MenuRow label="Workings library" detail="Ready-made rituals and spells: open one, then Begin together" onPress={() => router.push('/rituals/premade')} />
          <MenuRow label="Your rituals and spells" detail="Saved rituals and spells from the spell builder" onPress={() => router.push('/rituals/templates')} />
          <MenuRow label="Your covens’ gatherings" detail="A coven rite: Begin together on its page" last onPress={() => router.push('/coven')} />
        </MenuList>
      </Section>

      <Section label="Good to know">
        <View style={styles.gap}>
          {TOGETHER_GUIDANCE.map((line) => (
            <Text key={line} style={type.caption}>
              {line}
            </Text>
          ))}
        </View>
      </Section>
      {message && <Notice>{message}</Notice>}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({ gap: { gap: 8 } });
