import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, MenuList, MenuRow, MoreScreen, Notice } from '../../../../components/more/ui';
import { useMySubmissions } from '../../../../lib/community/api';
import { statusLabel, typeLabel } from '../../../../lib/community/model';
import { useSession } from '../../../../lib/session';
import { colors, type } from '../../../../theme';

export default function MySubmissions() {
  const { session } = useSession();
  const { data, status, refresh } = useMySubmissions();
  const [pulling, setPulling] = useState(false);

  if (!session) {
    return (
      <MoreScreen title="My submissions" back="/more" backLabel="Back to More">
        <Card>
          <Text style={type.body}>Sign in to see the status of your offerings and read any replies.</Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </Card>
      </MoreScreen>
    );
  }

  // Everything you've offered, Field Notes included, as the website lists it.
  const submissions = data ?? [];

  return (
    <MoreScreen
      title="My submissions"
      eyebrow="Status and replies"
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
      {status === 'offline' && data && <Notice>Offline · showing the copy saved on this device</Notice>}
      {!data && (status === 'loading' || status === 'idle') && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {!data && status === 'offline' && (
        <Card>
          <Text style={type.body}>Your submissions couldn't be loaded. Check your connection and try again.</Text>
          <Button label="Try again" variant="outline" onPress={refresh} />
        </Card>
      )}
      {data && submissions.length === 0 && (
        <Card>
          <Text style={type.body}>You have not offered anything to the Sanctuary yet.</Text>
          <Button label="Make an offering" onPress={() => router.push('/more/community/offer')} />
        </Card>
      )}
      {submissions.length > 0 && (
        <MenuList>
          {submissions.map((row, index) => (
            <MenuRow
              key={row.id}
              label={row.title}
              detail={`${typeLabel(row.submission_type)} · ${statusLabel(row.status)}`}
              last={index === submissions.length - 1}
              onPress={() =>
                router.push({ pathname: '/more/community/submission/[submissionId]', params: { submissionId: row.id } })
              }
            />
          ))}
        </MenuList>
      )}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 24 },
});
