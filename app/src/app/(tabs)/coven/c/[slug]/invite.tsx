import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Card, Chips, Field, Notice, Section, SwitchRow } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import {
  activeLinks,
  EXPIRY_CHOICES,
  inviteError,
  inviteLink,
  invitationOpen,
  linkOptions,
  linkSummary,
  MESSAGE_MAX,
  NOTE_MAX,
  searchReady,
  shareMessage,
  shortDate,
  USES_CHOICES,
  type ExpiryChoice,
  type Invitation,
  type InviteLink,
  type InvitePerson,
  type UsesChoice,
} from '../../../../../lib/covens/invites';
import { copyText } from '../../../../../lib/copyText';
import { colors, type } from '../../../../../theme';

// Invite people: share an invite link (how long it lasts, how many it lets
// in), invite someone in the app by name, the links still working and the
// invitations waiting (each can be revoked), and, for those who lead the
// coven, whether members may invite too. Reached from the coven's page
// (Invite) and Manage → Invite people. The website's Manage tab has the same.
export default function InvitePeople() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  const covenId = info?.id;
  const { perms, userId, loadNames, nameOf } = coven;
  const leads = perms.manage || perms.site;
  const oversees = perms.manage || perms.review || perms.site;

  const [settings, setSettings] = useState<{ may_invite: boolean; members_can_invite: boolean } | null | undefined>(undefined);
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [waiting, setWaiting] = useState<Invitation[]>([]);
  const [expiry, setExpiry] = useState<ExpiryChoice>('7');
  const [uses, setUses] = useState<UsesChoice>('unlimited');
  const [note, setNote] = useState('');
  const [made, setMade] = useState<InviteLink | null>(null);
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<InvitePerson[] | null>(null);
  const [chosen, setChosen] = useState<InvitePerson | null>(null);
  const [words, setWords] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Read again after each change (and on pull to refresh).
  const [version, setVersion] = useState(0);
  const load = useCallback(async () => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!covenId) return;
    let live = true;
    readInvites(covenId, perms.site, loadNames)
      .then((r) => {
        if (!live) return;
        setSettings(r.settings);
        setLinks(r.links);
        setWaiting(r.waiting);
      })
      .catch((error) => live && setMessage(inviteError(error)));
    return () => {
      live = false;
    };
  }, [covenId, perms.site, loadNames, version]);

  // Search as they type, a moment after they stop.
  useEffect(() => {
    if (!covenId || !searchReady(query)) return;
    let live = true;
    const timer = setTimeout(() => {
      api
        .searchInvitable(covenId, query)
        .then((rows) => live && setFound(rows))
        .catch((error) => live && setMessage(inviteError(error)));
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [covenId, query]);

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
    } catch (error) {
      setMessage(inviteError(error));
    }
    setBusy(false);
  };

  const makeLink = () =>
    run(async () => {
      const { days, uses: count } = linkOptions(expiry, uses);
      const link = await api.createInviteLink(covenId!, days, count, note);
      setMade(link);
      setNote('');
      await load();
    });

  const share = (code: string) => void Share.share({ message: shareMessage(info?.name ?? 'my coven', inviteLink(code)) }).catch(() => undefined);
  const copy = async (code: string) => {
    const ok = await copyText(inviteLink(code));
    setMessage(ok ? 'Link copied.' : 'The link couldn’t be copied here. Use Share instead.');
  };

  const send = () =>
    run(async () => {
      if (!chosen) return;
      await api.inviteToCoven(covenId!, chosen.user_id, words);
      setMessage(`Invitation sent to ${chosen.display_name}.`);
      setChosen(null);
      setWords('');
      setQuery('');
      setFound(null);
      await load();
    });

  const confirm = (title: string, body: string, yes: string, act: () => Promise<void>) => {
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.(`${title}\n\n${body}`) ?? true) void run(act);
      return;
    }
    Alert.alert(title, body, [
      { text: 'Keep it', style: 'cancel' },
      { text: yes, style: 'destructive', onPress: () => void run(act) },
    ]);
  };
  const revokeLink = (link: InviteLink) =>
    confirm('Revoke this link?', 'No one else can join with it. Those who already joined stay.', 'Revoke', async () => {
      await api.revokeInviteLink(link.id);
      if (made?.id === link.id) setMade(null);
      await load();
    });
  const revokeInvitation = (inv: Invitation) =>
    confirm(`Take back ${nameOf(inv.user_id)}’s invitation?`, 'It leaves their list of invitations.', 'Revoke', async () => {
      await api.revokeInvitation(inv.id);
      await load();
    });

  const setMembers = (on: boolean) =>
    run(async () => {
      await api.setMembersCanInvite(covenId!, on);
      await load();
    });

  const canRevoke = (by: string | null) => oversees || by === userId;
  const working = activeLinks(links);

  let body;
  if (settings === undefined) body = <Text style={type.caption}>Opening…</Text>;
  else if (settings === null) body = <Notice>Invitations aren’t ready yet. Please try again later.</Notice>;
  else if (!settings.may_invite && !perms.site) {
    body = (
      <Card>
        <Text style={type.body}>
          {info?.status !== 'active'
            ? 'This coven isn’t open right now, so no one can be invited.'
            : 'Those who lead or review the coven invite people. Its leaders can let members invite too.'}
        </Text>
      </Card>
    );
  } else {
    body = (
      <>
        {settings.may_invite && (
          <Section label="Share an invite link">
            <Text style={type.caption}>Anyone with the link can join without applying, once they’ve signed the coven’s agreements. It works even though the coven isn’t listed.</Text>
            <Chips label="How long it lasts" options={EXPIRY_CHOICES} value={expiry} onChange={setExpiry} />
            <Chips label="How many people can use it" options={USES_CHOICES} value={uses} onChange={setUses} />
            <Field label="A note for yourself (optional)" value={note} onChangeText={setNote} maxLength={NOTE_MAX} placeholder="Who it’s for" />
            <Button label={busy ? 'Making it…' : 'Make a link'} onPress={() => void makeLink()} disabled={busy} />
            {made && (
              <Card tone="gold">
                <Text style={type.caption}>Your link</Text>
                <Text selectable style={type.body}>
                  {inviteLink(made.code)}
                </Text>
                <Text style={type.caption}>{linkSummary(made)}</Text>
                <View style={styles.row}>
                  <Button label="Share" onPress={() => share(made.code)} />
                  <Button label="Copy link" variant="outline" onPress={() => void copy(made.code)} />
                </View>
              </Card>
            )}
          </Section>
        )}

        {settings.may_invite && (
          <Section label="Invite someone in the app">
            <Field label="Search by name" value={query} onChangeText={(t) => {
              setQuery(t);
              setChosen(null);
              if (!searchReady(t)) setFound(null);
            }} placeholder="The name they use in covens" autoCapitalize="none" autoCorrect={false} />
            {chosen ? (
              <Card>
                <Text style={type.cardTitle}>{chosen.display_name}</Text>
                <Field label="A message (optional)" value={words} onChangeText={setWords} multiline maxLength={MESSAGE_MAX} placeholder="Why you’d like them in the circle" />
                <Button label={busy ? 'Sending…' : 'Send invitation'} onPress={() => void send()} disabled={busy} />
                <Button label="Choose someone else" variant="text" onPress={() => setChosen(null)} />
              </Card>
            ) : (
              searchReady(query) &&
              found && (
                <View style={styles.list}>
                  {found.length ? (
                    found.map((p) => (
                      <Pressable
                        key={p.user_id}
                        accessibilityRole="button"
                        accessibilityLabel={`Invite ${p.display_name}`}
                        onPress={() => setChosen(p)}
                        style={({ pressed }) => [styles.person, pressed && styles.pressed]}
                      >
                        <View style={styles.initial}>
                          <Text style={styles.initialText}>{(p.display_name.trim()[0] ?? '?').toUpperCase()}</Text>
                        </View>
                        <Text style={[type.body, styles.flex]}>{p.display_name}</Text>
                        <Text style={[type.caption, styles.gold]}>Invite</Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={type.caption}>No one by that name can be invited. They need a coven profile, and can’t already be here or waiting on an invitation.</Text>
                  )}
                </View>
              )
            )}
          </Section>
        )}

        <Section label="Invite links">
          {working.length ? (
            working.map((link) => (
              <Card key={link.id}>
                <Text style={type.cardTitle}>{link.note || link.code}</Text>
                <Text style={type.caption}>
                  {linkSummary(link)}
                  {link.created_by ? ` · made by ${link.created_by === userId ? 'you' : nameOf(link.created_by)}` : ''}
                </Text>
                <View style={styles.row}>
                  {settings.may_invite && <Button label="Share" variant="outline" onPress={() => share(link.code)} />}
                  {canRevoke(link.created_by) && <Button label="Revoke" variant="text" onPress={() => revokeLink(link)} />}
                </View>
              </Card>
            ))
          ) : (
            <Text style={type.caption}>No links working now.</Text>
          )}
        </Section>

        <Section label="Invitations waiting">
          {waiting.length ? (
            waiting.map((inv) => (
              <Card key={inv.id}>
                <Text style={type.cardTitle}>{nameOf(inv.user_id)}</Text>
                <Text style={type.caption}>
                  Sent {shortDate(inv.created_at)}
                  {inv.invited_by ? ` by ${inv.invited_by === userId ? 'you' : nameOf(inv.invited_by)}` : ''}
                </Text>
                {!!inv.message && <Text style={type.body}>“{inv.message}”</Text>}
                {canRevoke(inv.invited_by) && <Button label="Revoke" variant="text" onPress={() => revokeInvitation(inv)} />}
              </Card>
            ))
          ) : (
            <Text style={type.caption}>{oversees ? 'No invitations waiting.' : 'No invitations you sent are waiting.'}</Text>
          )}
        </Section>
      </>
    );
  }

  return (
    <CovenScreen title="Invite people" need="member" onRefresh={load}>
      {body}
      {leads && settings && (
        <Section label="Who may invite">
          <Card>
            <SwitchRow
              label="Members may invite people"
              detail="Any member in good standing, as well as those who lead or review"
              value={settings.members_can_invite}
              onChange={(on) => void setMembers(on)}
              last
            />
          </Card>
        </Section>
      )}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

/** The settings, and, for those who may invite (or site moderators), the coven's links and the invitations waiting. */
async function readInvites(covenId: string, site: boolean, loadNames: (ids: (string | null | undefined)[]) => Promise<void>) {
  const settings = await api.fetchInviteSettings(covenId);
  if (!settings?.may_invite && !site) return { settings, links: [] as InviteLink[], waiting: [] as Invitation[] };
  const [links, all] = await Promise.all([api.fetchInviteLinks(covenId).catch(() => [] as InviteLink[]), api.fetchCovenInvitations(covenId).catch(() => [] as Invitation[])]);
  const waiting = all.filter((i) => invitationOpen(i));
  await loadNames([...waiting.map((i) => i.user_id), ...waiting.map((i) => i.invited_by), ...links.map((x) => x.created_by)]);
  return { settings, links, waiting };
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  list: { gap: 6 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  pressed: { opacity: 0.75 },
  initial: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.goldLine },
  initialText: { ...type.body, color: colors.gold },
  flex: { flex: 1 },
  gold: { color: colors.gold },
});
