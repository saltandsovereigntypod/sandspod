import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Card, Chips, Field, MoreScreen, Notice } from '../../../../../components/more/ui';
import { useIsReviewer, useReview } from '../../../../../lib/community/api';
import {
  authorName,
  communityDate,
  inReviewFolder,
  REVIEW_FILTERS,
  statusLabel,
  typeLabel,
  type ReviewFilter,
  type SubmissionRow,
} from '../../../../../lib/community/model';
import { colors, radius, type } from '../../../../../theme';

// The website's private review inbox (admin/submissions), for admins only.
export default function ReviewInbox() {
  const isReviewer = useIsReviewer();
  const { data, status, refresh } = useReview();
  const [filter, setFilter] = useState<ReviewFilter>('pending');
  const [search, setSearch] = useState('');
  const [pulling, setPulling] = useState(false);

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.submissions ?? []).filter(
      (row) =>
        inReviewFolder(row, filter) &&
        (!term || [row.title, row.body, row.display_name].join(' ').toLowerCase().includes(term)),
    );
  }, [data, filter, search]);

  if (!isReviewer) {
    return (
      <MoreScreen title="Review submissions" back="/more" backLabel="Back to More">
        <Text style={type.body}>Only Salt & Sovereignty reviewers can open this page.</Text>
      </MoreScreen>
    );
  }

  const options = REVIEW_FILTERS.map((option) => {
    const count = data?.submissions.filter((row) => inReviewFolder(row, option.value)).length ?? 0;
    const unread = data?.unread.byFolder[option.value] ?? 0;
    return { value: option.value, label: `${option.label} ${count}${unread ? ` · ${unread} new` : ''}` };
  });

  return (
    <MoreScreen
      title="Review submissions"
      eyebrow="Community Grimoire"
      back="/more"
      backLabel="Back to More"
      refreshControl={
        <RefreshControl
          refreshing={pulling}
          tintColor={colors.gold}
          onRefresh={async () => {
            setPulling(true);
            await refresh();
            setPulling(false);
          }}
        />
      }
    >
      <Chips label="Folder" options={options} value={filter} onChange={setFilter} />
      <Field label="Search title, writing or name" value={search} onChangeText={setSearch} autoCorrect={false} />

      {status === 'offline' && data && <Notice>Offline · showing the copy saved on this phone</Notice>}
      {!data && status !== 'offline' && <ActivityIndicator color={colors.gold} />}
      {!data && status === 'offline' && (
        <Card>
          <Text style={type.body}>Submissions couldn’t load. Check your connection and try again.</Text>
          <Button label="Try again" variant="outline" onPress={refresh} />
        </Card>
      )}
      {data && shown.length === 0 && <Text style={type.caption}>No submissions here.</Text>}

      <View style={styles.list}>
        {shown.map((row) => (
          <SubmissionCard key={row.id} row={row} unread={data?.unread.bySubmission[row.id] ?? 0} />
        ))}
      </View>
    </MoreScreen>
  );
}

function SubmissionCard({ row, unread }: { row: SubmissionRow; unread: number }) {
  const folder = row.admin_folder === 'archived' ? 'Archived' : statusLabel(row.status);
  const meta = [folder, authorName(row), communityDate(row.created_at)].filter(Boolean).join(' · ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${row.title}. ${typeLabel(row.submission_type)}. ${meta}${unread ? `. ${unread} new replies` : ''}`}
      onPress={() => router.push({ pathname: '/more/community/review/[submissionId]', params: { submissionId: row.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.cardTop}>
        <Text style={[type.eyebrow, styles.grow]}>{typeLabel(row.submission_type)}</Text>
        {unread > 0 && <Text style={styles.badge}>{unread} new</Text>}
      </View>
      <Text style={styles.title}>{row.title}</Text>
      <Text style={type.caption}>{meta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    gap: 6,
  },
  pressed: { opacity: 0.7 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  badge: { ...type.caption, color: colors.forestInk, backgroundColor: colors.gold, borderRadius: 10, paddingHorizontal: 8, overflow: 'hidden' },
  title: { ...type.cardTitle },
});
