import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { SearchPicker } from '../../../../../../components/covens/SearchPicker';
import { Pill, Pills } from '../../../../../../components/covens/ui';
import { Card, Chips, Notice, Section, SwitchRow } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage, type Member } from '../../../../../../lib/covens/model';
import { assigneeFromKey, assigneeKey, assigneeLabel, cleanAssignees, whoEntries, whoSuggestions, type Assignee } from '../../../../../../lib/covens/picker';
import {
  agoLabel,
  attendanceLine,
  DEFAULT_RANGE,
  mentorLine,
  overviewRows,
  RANGES,
  rangePhrase,
  seesRecord,
  sinceFor,
  studiesLine,
  type RangeValue,
  type RecordOverview,
  type RecordSettings,
} from '../../../../../../lib/covens/record';
import { colors, type } from '../../../../../../theme';

// The members' record: everyone in the coven, least active first, with how
// many rituals they came to, when they last took part, their studies and
// their mentoring, and gentle flags where someone may need a word. For the
// coven's head, site moderators, and those the head chooses (set here), as on
// the website (covens/coven/record.js).
export default function MembersRecord() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const ranks = useMemo(() => coven.snapshot?.ranks ?? [], [coven.snapshot?.ranks]);
  const { loadNames, perms } = coven;
  const head = perms.founder || perms.site;
  const [settings, setSettings] = useState<RecordSettings | null | undefined>(undefined);
  const [range, setRange] = useState<RangeValue>(DEFAULT_RANGE);
  const [overview, setOverview] = useState<RecordOverview | null>(null);
  const [who, setWho] = useState<Assignee[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [viewers, setViewers] = useState<Assignee[]>([]);
  const [menteesSee, setMenteesSee] = useState(false);
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const allowed = seesRecord({ founder: perms.founder, site: perms.site, settings, membership: coven.snapshot?.membership, userId: coven.userId });

  useEffect(() => {
    if (!covenId) return;
    void api
      .fetchRecordSettings(covenId)
      .catch(() => null)
      .then((s) => {
        setSettings(s);
        const list = cleanAssignees(s?.record_viewers ?? []);
        setViewers(list);
        setMenteesSee(!!s?.mentees_see_checkins);
        setSaved(JSON.stringify([list, !!s?.mentees_see_checkins]));
      });
    void api.fetchMembers(covenId).then((list) => {
      setMembers(list);
      void loadNames(list.map((m) => m.user_id));
    }).catch(() => {});
  }, [covenId, loadNames]);

  const apply = useCallback(
    (next: RecordOverview) => {
      setOverview(next);
      void loadNames([...next.members.map((m) => m.user_id), ...next.mentors.map((m) => m.mentor_id)]);
    },
    [loadNames],
  );
  const load = useCallback(async () => {
    if (!covenId || !allowed) return;
    setMessage(null);
    try {
      apply(await api.fetchRecordOverview(covenId, sinceFor(range)));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [covenId, allowed, range, apply]);

  useEffect(() => {
    if (!covenId || !allowed) return;
    let off = false;
    api.fetchRecordOverview(covenId, sinceFor(range)).then(
      (next) => !off && apply(next),
      (error) => !off && setMessage(errorMessage(error)),
    );
    return () => {
      off = true;
    };
  }, [covenId, allowed, range, apply]);

  const entries = useMemo(() => whoEntries(ranks, members.map((m) => ({ id: m.user_id, name: coven.nameOf(m.user_id) })), { coven: false }), [ranks, members, coven]);
  const viewerEntries = useMemo(() => entries.filter((e) => e.key !== `user:${coven.snapshot?.coven.founder_id}`), [entries, coven.snapshot?.coven.founder_id]);
  const rows = useMemo(() => (overview ? overviewRows(overview, who) : []), [overview, who]);
  const now = overview ? Date.parse(overview.now) : 0;
  const phrase = rangePhrase(range);

  const saveViewers = async () => {
    if (!covenId) return;
    setBusy(true);
    setMessage(null);
    try {
      const done = await api.setRecordViewers(covenId, viewers, menteesSee);
      setSettings(done);
      setSaved(JSON.stringify([cleanAssignees(done.record_viewers), done.mentees_see_checkins]));
      setMessage('Saved.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  return (
    <CovenScreen title="Members’ record" onRefresh={load}>
      {settings === undefined && <ActivityIndicator color={colors.gold} />}
      {settings !== undefined && !allowed && (
        <Card>
          <Text style={type.body}>The members’ record is kept by the coven’s head and those they choose.</Text>
          <Button label="See your own standing" variant="outline" onPress={() => router.push(covenHref(coven.slug, 'standing'))} />
        </Card>
      )}
      {allowed && (
        <>
          <Text style={type.body}>Who has been taking part, and who hasn’t, least active first. Tap someone for every ritual, their studies and their mentoring.</Text>
          <Chips label="Over" options={RANGES} value={range} onChange={setRange} />
          <SearchPicker
            label="Only these"
            chips={who.map((a) => ({ key: assigneeKey(a), label: assigneeLabel(a, ranks, coven.nameOf) }))}
            entries={entries}
            suggestions={whoSuggestions(entries, 3)}
            onAdd={(entry) => {
              const a = assigneeFromKey(entry.key);
              if (a) setWho((list) => cleanAssignees([...list, a]));
            }}
            onRemove={(key) => setWho((list) => list.filter((a) => assigneeKey(a) !== key))}
            placeholder="A position or a name"
            empty="Everyone."
          />
          {!overview && !message && <ActivityIndicator color={colors.gold} />}
          {overview && !rows.length && <Text style={type.caption}>No one matches.</Text>}
          {rows.map((r) => {
            const rank = ranks.find((x) => x.id === r.rankId);
            return (
              <Pressable key={r.userId} accessibilityRole="button" accessibilityHint="Opens their record" onPress={() => router.push(covenHref(coven.slug, `record/${r.userId}`))}>
                <Card>
                  <View style={styles.head}>
                    <Text style={type.cardTitle}>
                      {coven.nameOf(r.userId)}
                      {r.userId === coven.userId ? ' (you)' : ''}
                    </Text>
                    {!!rank && <Text style={type.caption}>{rank.name}</Text>}
                  </View>
                  <Text style={type.body}>{attendanceLine(r.attendance, phrase)}</Text>
                  <Text style={type.caption}>Last took part {agoLabel(r.lastActive, now)} · joined {new Date(r.joinedAt).toLocaleDateString()}</Text>
                  <Text style={type.caption}>{studiesLine(r.studies)}</Text>
                  <Text style={type.caption}>{mentorLine(r, coven.nameOf, now)}</Text>
                  {r.flags.length > 0 && (
                    <Pills>
                      {r.flags.map((f) => (
                        <Pill key={f} label={f} tone="warn" />
                      ))}
                    </Pills>
                  )}
                </Card>
              </Pressable>
            );
          })}
          {!!overview && <Text style={type.caption}>Attendance has been kept since {new Date(overview.attendance_since).toLocaleDateString()}: someone counts as there when they open the ritual while it’s under way, and leaders can correct it. Earlier rituals show what people answered and did instead.</Text>}

          {head && (
            <Section label="Who keeps the record">
              <Card>
                <Text style={type.caption}>You, as the coven’s head, always see it, as do the Salt &amp; Sovereignty moderators. Choose positions and people who see it too. No one sees their own leader notes.</Text>
                <SearchPicker
                  label="Who also sees the record"
                  chips={viewers.map((a) => ({ key: assigneeKey(a), label: assigneeLabel(a, ranks, coven.nameOf) }))}
                  entries={viewerEntries}
                  suggestions={whoSuggestions(viewerEntries, 3)}
                  onAdd={(entry) => {
                    const a = assigneeFromKey(entry.key);
                    if (a) setViewers((list) => cleanAssignees([...list, a]));
                  }}
                  onRemove={(key) => setViewers((list) => list.filter((a) => assigneeKey(a) !== key))}
                  placeholder="Maiden, Elder, Rowan…"
                  empty="Only you."
                />
                <SwitchRow label="Mentees read their mentor’s check-ins" detail="Off: only the mentor and those who keep the record read them." value={menteesSee} onChange={setMenteesSee} last />
                <Button label={busy ? 'Saving…' : 'Save'} onPress={() => void saveViewers()} disabled={busy || JSON.stringify([viewers, menteesSee]) === saved} />
              </Card>
            </Section>
          )}
        </>
      )}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  head: { gap: 2 },
});
