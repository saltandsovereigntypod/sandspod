import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { ChoiceChips, errorText } from '../../../../components/cycle/ui';
import { Body, Card, Chip, Chips, Expander, Notice, RitualScreen, SectionLabel, SignInCard, Title, ui } from '../../../../components/rituals/ui';
import { STATUS_DAYS, STATUS_OPTIONS, statusLabel, type MoonStatus } from '../../../../lib/cycle/status';
import { loadSharedStatus, shareChoices, shareStatus, stopSharingStatus, type SharedStatus } from '../../../../lib/cycle/store';
import { useSession } from '../../../../lib/session';
import { type } from '../../../../theme';

// Share that you're in moon time: strictly opt-in, one of a few set phrases,
// to the covens and people chosen, for a few days. Never dates or notes; it
// has nothing to do with the encrypted notes. Members see a small moon by
// your name on the coven's Members page.
export default function CycleShare() {
  const { session } = useSession();
  const me = session?.user.id ?? '';
  const [current, setCurrent] = useState<SharedStatus | 'unavailable' | undefined>(undefined);
  const [choices, setChoices] = useState<Awaited<ReturnType<typeof shareChoices>> | null>(null);
  const [status, setStatus] = useState<MoonStatus>('moon_time_resting');
  const [days, setDays] = useState<number>(3);
  const [covens, setCovens] = useState<string[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(
    () =>
      Promise.all([loadSharedStatus(me), shareChoices(me)]).then(
        ([now, options]) => {
          setCurrent(now);
          setChoices(options);
          if (now && now !== 'unavailable') {
            setStatus(now.status);
            setCovens(now.covens);
            setPeople(now.people);
          }
        },
        (e: unknown) => {
          setMessage(errorText(e));
          setCurrent(null);
        },
      ),
    [me],
  );

  useEffect(() => {
    if (!session) return;
    let live = true;
    Promise.all([loadSharedStatus(me), shareChoices(me)]).then(
      ([now, options]) => {
        if (!live) return;
        setCurrent(now);
        setChoices(options);
        if (now && now !== 'unavailable') {
          setStatus(now.status);
          setCovens(now.covens);
          setPeople(now.people);
        }
      },
      (e: unknown) => {
        if (!live) return;
        setMessage(errorText(e));
        setCurrent(null);
      },
    );
    return () => {
      live = false;
    };
  }, [session, me]);

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  if (!session) {
    return (
      <RitualScreen back="Cycle & Moon">
        <Title eyebrow="Cycle & Moon">Share with my covens</Title>
        <SignInCard title="Sign in to share" body="Sharing that you’re in moon time is for covens, so it needs an account." />
      </RitualScreen>
    );
  }

  return (
    <RitualScreen back="Cycle & Moon" onRefresh={load}>
      <Title eyebrow="Cycle & Moon">Share with my covens</Title>
      <Body>
        Only if you want to: let chosen covens or people see a few words by your name, like “In moon time · resting”. Never dates, notes or anything from your Cycle &amp; Moon notes, and it clears itself after the days you choose.
      </Body>
      {current === undefined && <ActivityIndicator />}
      {current === 'unavailable' && <Notice>Sharing isn’t ready on the server yet. Try again after the next update.</Notice>}
      {current && current !== 'unavailable' && (
        <Card accent>
          <Text style={[type.eyebrow, ui.gold]}>Shared now</Text>
          <Text style={type.cardTitle}>{`☾ ${statusLabel(current.status)}`}</Text>
          <Body muted>{`Until ${new Date(current.expiresAt).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}`}</Body>
          <Button
            label="Stop sharing now"
            variant="outline"
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              try {
                await stopSharingStatus(me);
                setCurrent(null);
                setMessage('No longer shared.');
              } catch (e) {
                setMessage(errorText(e));
              } finally {
                setBusy(false);
              }
            }}
          />
        </Card>
      )}
      {current !== 'unavailable' && current !== undefined && choices && (
        <>
          <SectionLabel>What it says</SectionLabel>
          <ChoiceChips options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          <SectionLabel>For how long</SectionLabel>
          <ChoiceChips options={STATUS_DAYS.map((n) => ({ value: n as number, label: `${n} ${n === 1 ? 'day' : 'days'}` }))} value={days} onChange={setDays} />
          <SectionLabel>Who sees it</SectionLabel>
          {choices.covens.length === 0 ? (
            <Body muted>You’re not in a coven yet.</Body>
          ) : (
            <Card>
              <Text style={type.caption}>Everyone in these covens</Text>
              <Chips>
                {choices.covens.map((c) => (
                  <Chip key={c.id} label={c.name} selected={covens.includes(c.id)} onPress={() => setCovens(toggle(covens, c.id))} />
                ))}
              </Chips>
              {choices.people.length > 0 && (
                <Expander title="Or only certain people" initiallyOpen={people.length > 0}>
                  <View style={ui.gapSmall}>
                    <Chips>
                      {choices.people.map((p) => (
                        <Chip key={p.id} label={p.name} selected={people.includes(p.id)} onPress={() => setPeople(toggle(people, p.id))} />
                      ))}
                    </Chips>
                  </View>
                </Expander>
              )}
            </Card>
          )}
          {message && <Notice>{message}</Notice>}
          <Button
            label={busy ? 'Sharing…' : current ? 'Update what I share' : 'Share it'}
            disabled={busy || (!covens.length && !people.length)}
            onPress={async () => {
              setBusy(true);
              setMessage(null);
              try {
                await shareStatus(me, status, covens, people, days);
                await load();
                setMessage('Shared. Only the covens and people you chose can see it.');
              } catch (e) {
                setMessage(errorText(e));
              } finally {
                setBusy(false);
              }
            }}
          />
        </>
      )}
      {message && current === null && !choices && <Notice>{message}</Notice>}
    </RitualScreen>
  );
}
