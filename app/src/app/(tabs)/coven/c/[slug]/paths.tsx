import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Card, MenuList, Notice, Section, SwitchRow } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../lib/covens/model';
import {
  ANONYMOUS_NOTE,
  sectionBars,
  sectionLine,
  SECTIONS,
  seesPaths,
  sharedLine,
  type OverviewItem,
  type PathsOverview,
  type PathsSettings,
} from '../../../../../lib/covens/paths';
import type { RecordSettings } from '../../../../../lib/covens/record';
import { colors, type } from '../../../../../theme';

// Paths in the coven: what share of the coven practises each way, keeps each
// tradition and honours each deity, never who. For the coven's head, those
// who see the members' record, and everyone when the head shows it to the
// whole coven (switched here). As on the website (covens/coven/paths.js);
// the database sums it up (coven_paths_overview) and lib/covens/paths.ts reads it.
export default function PathsInTheCoven() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const { perms } = coven;
  const head = perms.founder || perms.site;
  const [record, setRecord] = useState<RecordSettings | null | undefined>(undefined);
  const [paths, setPaths] = useState<PathsSettings | null | undefined>(undefined);
  const [overview, setOverview] = useState<PathsOverview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = record !== undefined && paths !== undefined;
  const allowed = seesPaths({ founder: perms.founder, site: perms.site, member: perms.member, record, paths, membership: coven.snapshot?.membership, userId: coven.userId });

  useEffect(() => {
    if (!covenId) return;
    void api.fetchRecordSettings(covenId).catch(() => null).then(setRecord);
    void api.fetchPathsSettings(covenId).catch(() => null).then(setPaths);
  }, [covenId]);

  const load = useCallback(async () => {
    if (!covenId || !allowed) return;
    setMessage(null);
    try {
      setOverview(await api.fetchPathsOverview(covenId));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [covenId, allowed]);

  useEffect(() => {
    if (!covenId || !allowed) return;
    let off = false;
    api.fetchPathsOverview(covenId).then(
      (next) => !off && setOverview(next),
      (error) => !off && setMessage(errorMessage(error)),
    );
    return () => {
      off = true;
    };
  }, [covenId, allowed]);

  const showToAll = async (on: boolean) => {
    if (!covenId) return;
    setBusy(true);
    setMessage(null);
    try {
      setPaths(await api.setPathsVisible(covenId, on));
      setMessage(on ? 'The whole coven can see it now.' : 'Only you and those who keep the record see it now.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  return (
    <CovenScreen title="Paths in the coven" onRefresh={load}>
      {!ready && <ActivityIndicator color={colors.gold} />}
      {ready && !allowed && (
        <Card>
          <Text style={type.body}>The coven’s head sees this, with those who keep the members’ record, unless the head shows it to everyone.</Text>
        </Card>
      )}
      {allowed && (
        <>
          <Text style={type.body}>How the coven practises, the paths it walks and the deities it honours, as a share of those who have said.</Text>
          {!overview && !message && <ActivityIndicator color={colors.gold} />}
          {overview && <Text style={type.caption}>{sharedLine(overview)}</Text>}
          {overview?.enough &&
            SECTIONS.map(({ key, label }) => {
              const s = overview[key];
              if (!s) return null;
              const bars = sectionBars(s);
              return (
                <Section key={key} label={label}>
                  <Text style={type.caption}>{sectionLine(s, key)}</Text>
                  {bars.length > 0 && (
                    <Card>
                      {bars.map((item) => (
                        <Bar key={item.key} item={item} shared={s.shared} other={item.key === 'other'} />
                      ))}
                    </Card>
                  )}
                  {s.shared >= 3 && !bars.length && <Text style={type.caption}>Nothing shared by three or more yet.</Text>}
                </Section>
              );
            })}
          <Text style={type.caption}>{ANONYMOUS_NOTE}</Text>
          {head && (
            <Section label="Who sees it">
              <Text style={type.caption}>You, as the coven’s head, always see it, as do those who keep the members’ record.</Text>
              <MenuList>
                <SwitchRow
                  label="Show it to the whole coven"
                  detail="Every member can open Paths in the coven from the coven’s page."
                  value={paths?.paths_visible_to_all === true}
                  onChange={(on) => {
                    if (!busy) void showToAll(on);
                  }}
                  last
                />
              </MenuList>
            </Section>
          )}
        </>
      )}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

function Bar({ item, shared, other }: { item: OverviewItem; shared: number; other: boolean }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${item.name}: ${item.count} of ${shared}, ${item.pct}%`}>
      <View style={styles.labels}>
        <Text style={[type.body, styles.name, other && styles.otherName]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[type.body, styles.pct]}>{item.pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, other && styles.otherFill, { width: `${Math.max(item.pct, 2)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 4, paddingVertical: 4 },
  labels: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  name: { flex: 1 },
  otherName: { color: colors.muted, fontStyle: 'italic' },
  pct: { color: colors.gold, fontVariant: ['tabular-nums'] },
  track: { height: 10, borderRadius: 999, backgroundColor: 'rgba(244,236,216,0.1)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: colors.gold },
  otherFill: { backgroundColor: colors.fern },
});
