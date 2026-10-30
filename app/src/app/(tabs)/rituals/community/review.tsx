import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { CommunityRitualView } from '../../../../components/rituals/CommunityRitualView';
import { Body, Card, Chip, Chips, Field, Notice, RitualScreen, Title, ui } from '../../../../components/rituals/ui';
import { communityDate } from '../../../../lib/community/model';
import {
  inRitualFolder,
  REVIEW_FOLDERS,
  reviewActionsFor,
  RITUAL_REVIEW_ACTIONS,
  sharedStatusLabel,
  sharerName,
  type ReviewFolder,
  type RitualReviewAction,
  type SharedRitual,
} from '../../../../lib/rituals/community';
import { fetchReviewQueue, reviewRitual, useIsRitualModerator } from '../../../../lib/rituals/communityApi';
import { colors, type } from '../../../../theme';

// Review shared rituals (site moderators, as for the Community Grimoire):
// read each one in full, then publish it, return it for changes with a note
// for the sharer, or decline it. A published one can be taken down.
export default function ReviewRituals() {
  const moderator = useIsRitualModerator();
  const [rows, setRows] = useState<SharedRitual[] | null>(null);
  const [folder, setFolder] = useState<ReviewFolder>('pending');
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await fetchReviewQueue());
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'The queue couldn’t open.');
      setRows([]);
    }
  }, []);

  useEffect(() => {
    if (!moderator) return;
    let off = false;
    fetchReviewQueue()
      .then((list) => !off && setRows(list))
      .catch((e: unknown) => {
        if (off) return;
        setMessage(e instanceof Error ? e.message : 'The queue couldn’t open.');
        setRows([]);
      });
    return () => {
      off = true;
    };
  }, [moderator]);

  if (!moderator) {
    return (
      <RitualScreen back="Community Rituals">
        <Title>Review shared rituals</Title>
        <Body>Only the community’s moderators review shared rituals.</Body>
      </RitualScreen>
    );
  }

  const act = async (row: SharedRitual, action: RitualReviewAction) => {
    setBusy(true);
    setMessage(null);
    try {
      await reviewRitual(row.id, action, notes[row.id] ?? '');
      const label = RITUAL_REVIEW_ACTIONS.find((a) => a.value === action)?.label ?? 'Done';
      setMessage(`${label}: “${row.title}”.`);
      setOpen(null);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const shown = (rows ?? []).filter((r) => inRitualFolder(r, folder));
  const count = (f: ReviewFolder) => (rows ?? []).filter((r) => inRitualFolder(r, f)).length;

  return (
    <RitualScreen back="Community Rituals" onRefresh={load}>
      <Title eyebrow="Moderators">Review shared rituals</Title>
      <Chips>
        {REVIEW_FOLDERS.map((f) => (
          <Chip key={f.value} label={`${f.label} (${count(f.value)})`} selected={folder === f.value} onPress={() => setFolder(f.value)} />
        ))}
      </Chips>
      {!!message && <Notice>{message}</Notice>}
      {!rows && <ActivityIndicator color={colors.gold} />}
      {rows && !shown.length && <Body muted>Nothing here.</Body>}
      {shown.map((row) => (
        <Card key={row.id}>
          <Text style={type.eyebrow}>{sharedStatusLabel(row.status)}</Text>
          <Text style={type.cardTitle}>{row.title}</Text>
          <Body muted>
            {[`Credited to ${sharerName(row)}`, row.coven_id ? 'a coven’s template' : '', row.replaces_id ? `update (version ${row.version})` : '', communityDate(row.submitted_at)]
              .filter(Boolean)
              .join(' · ')}
          </Body>
          {open === row.id ? (
            <View style={ui.gap}>
              <CommunityRitualView row={row} />
              <Field
                label="Note for the sharer"
                value={notes[row.id] ?? row.reviewer_note ?? ''}
                onChange={(v) => setNotes((n) => ({ ...n, [row.id]: v }))}
                multiline
                placeholder="Needed to return it; shown to them with any decision"
              />
              <View style={ui.actions}>
                {reviewActionsFor(row).map((action) => (
                  <Button
                    key={action}
                    label={RITUAL_REVIEW_ACTIONS.find((a) => a.value === action)!.label}
                    variant={action === 'publish' ? 'primary' : 'outline'}
                    disabled={busy}
                    onPress={() => void act(row, action)}
                  />
                ))}
                <Button label="Close" variant="text" onPress={() => setOpen(null)} />
              </View>
            </View>
          ) : (
            <Button label="Read and review" variant="outline" onPress={() => setOpen(row.id)} />
          )}
        </Card>
      ))}
    </RitualScreen>
  );
}
