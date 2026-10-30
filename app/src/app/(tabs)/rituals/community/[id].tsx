import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { CommunityRitualView } from '../../../../components/rituals/CommunityRitualView';
import { Body, Card, Chip, Chips, Notice, RitualScreen, SectionLabel, Title, confirmAction, tell, ui } from '../../../../components/rituals/ui';
import { block as blockOnServer } from '../../../../lib/covens/api';
import { blockAuthor, hidePost, useHiddenCommunity } from '../../../../lib/community/hidden';
import { SUPPORT_EMAIL } from '../../../../lib/community/model';
import { creditLine, draftFromCommunity, isRitualHidden, ritualReportUrl, savesLabel, sharerKey, sharerName } from '../../../../lib/rituals/community';
import { addToCoven, noteSaved, useCovensILead, usePublishedRituals } from '../../../../lib/rituals/communityApi';
import { handOffDraft } from '../../../../lib/rituals/handoff';
import { saveTemplate, startRitual, useRituals } from '../../../../lib/rituals/store';
import { useSession } from '../../../../lib/session';

// One shared ritual: everything it holds, who shared it, and what you can do
// with it: add it to your rituals (an independent copy, credited), do it once
// without saving, plan a night for it, or add it to a coven you lead.
// Report it, hide it, or hide everything from its sharer.
export default function CommunityRitual() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { data, status } = usePublishedRituals();
  const rituals = useRituals();
  const covens = useCovensILead();
  const hidden = useHiddenCommunity();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [choosingCoven, setChoosingCoven] = useState(false);

  const row = data?.rituals.find((r) => r.id === id) ?? null;
  if (!row || isRitualHidden(row, hidden)) {
    return (
      <RitualScreen back="Community Rituals">
        <Title>Community Rituals</Title>
        <Body>
          {row
            ? 'You’ve hidden this ritual. You can show hidden rituals again from Community Rituals.'
            : !data && status !== 'offline'
              ? 'Opening…'
              : 'This ritual couldn’t be found. It may have been withdrawn or replaced by a newer version.'}
        </Body>
      </RitualScreen>
    );
  }

  const name = sharerName(row);
  const key = sharerKey(row);
  const leads = covens.data ?? [];

  const addToMine = async () => {
    setBusy('mine');
    setMessage(null);
    try {
      const saved = await saveTemplate(draftFromCommunity(row));
      void noteSaved(row.id, 'mine');
      setSavedId(saved.id);
    } catch (e) {
      tell('Couldn’t add it', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const doOnce = async () => {
    setBusy('once');
    try {
      await startRitual({ kind: 'draft', draft: draftFromCommunity(row) });
      router.replace('/rituals/run');
    } catch (e) {
      tell('Couldn’t begin', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const plan = () => {
    handOffDraft(draftFromCommunity(row));
    router.push({ pathname: '/rituals/planner', params: { fromSpell: '1' } });
  };

  const toCoven = async (covenId: string, covenName: string) => {
    setBusy('coven');
    setMessage(null);
    try {
      await addToCoven(covenId, row);
      setChoosingCoven(false);
      setMessage(`Added to ${covenName}’s templates. Plan a gathering from it under the coven’s Rituals.`);
    } catch (e) {
      tell('Couldn’t add it', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const report = async () => {
    try {
      await Linking.openURL(ritualReportUrl(row));
    } catch {
      setMessage(`To report this ritual, email ${SUPPORT_EMAIL} and mention “${row.title}”.`);
    }
  };
  const hide = async () => {
    if (await confirmAction('Hide this ritual?', 'You won’t see it in Community Rituals on this device.', 'Hide')) {
      hidePost(row.id);
      router.back();
    }
  };
  const hideSharer = async () => {
    const coven = row.share_as === 'coven';
    const ok = await confirmAction(
      coven ? 'Hide everything from this coven?' : 'Block this person?',
      coven
        ? `You won’t see rituals shared by ${name} on this device.`
        : `You won’t see rituals or community pages from ${name}${session ? ', here or on the website' : ' on this device'}. They aren’t told.`,
      coven ? 'Hide all' : 'Block',
    );
    if (!ok || !key) return;
    blockAuthor(row.sharer_id ?? key);
    if (!coven && session && row.sharer_id && row.sharer_id !== session.user.id) {
      await blockOnServer(session.user.id, row.sharer_id).catch(() => undefined);
    }
    router.back();
  };

  return (
    <RitualScreen back="Community Rituals">
      <Title eyebrow="Community Rituals">{row.title}</Title>
      <Body muted>{[`Shared by ${name}`, row.version > 1 ? `version ${row.version}` : '', savesLabel(row.save_count)].filter(Boolean).join(' · ')}</Body>
      {!!key && (
        <Button
          label={`More from ${name}`}
          variant="text"
          onPress={() => router.push({ pathname: '/rituals/community', params: { sharer: key, sharerName: name } })}
        />
      )}

      <View style={ui.actions}>
        {session ? (
          savedId ? (
            <Card>
              <Body>{`Added to your rituals, credited “${creditLine(row)}”. It’s your own copy now: change it however you like.`}</Body>
              <Button label="Open your copy" variant="outline" onPress={() => router.push({ pathname: '/rituals/templates/[id]', params: { id: savedId } })} />
            </Card>
          ) : (
            <Button label={busy === 'mine' ? 'Adding…' : 'Add to my rituals'} disabled={!!busy} onPress={addToMine} />
          )
        ) : (
          <Body muted>Sign in to add it to your rituals and change it however you like.</Body>
        )}
        <Button
          label={busy === 'once' ? 'Beginning…' : 'Do it once'}
          variant="outline"
          disabled={!!busy || !!rituals.active}
          accessibilityHint="Begins it as a guided ritual without saving it to your rituals"
          onPress={doOnce}
        />
        {!!rituals.active && <Body muted>Finish the ritual that’s under way before beginning another.</Body>}
        <Button label="Plan a night for it" variant="outline" onPress={plan} />
        {leads.length > 0 && (
          <Button label="Add to a coven’s rituals" variant="outline" disabled={!!busy} onPress={() => setChoosingCoven((v) => !v)} />
        )}
        {choosingCoven && (
          <Card>
            <SectionLabel>Which coven?</SectionLabel>
            <Body muted>It’s kept with the coven’s templates, credited, for planning a gathering from.</Body>
            <Chips>
              {leads.map((c) => (
                <Chip key={c.id} label={c.name} onPress={() => void toCoven(c.id, c.name)} />
              ))}
            </Chips>
          </Card>
        )}
        {!!message && <Notice>{message}</Notice>}
      </View>

      <CommunityRitualView row={row} />

      <View style={ui.gapSmall}>
        <Body muted>{creditLine(row)}</Body>
        <Chips>
          <Chip label="Report" onPress={() => void report()} hint="Emails the moderators about this ritual" />
          <Chip label="Hide" onPress={() => void hide()} hint="Stops showing this ritual on this device" />
          {!!key && row.sharer_id !== session?.user.id && (
            <Chip label={row.share_as === 'coven' ? 'Hide this coven' : 'Block this person'} onPress={() => void hideSharer()} hint="Stops showing anything they share" />
          )}
        </Chips>
      </View>
    </RitualScreen>
  );
}
