import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, MenuList, MenuRow, MoreScreen, Notice, Section } from '../../../../components/more/ui';
import * as api from '../../../../lib/covens/api';
import { BADGE_LABEL, FOUNDER_MODULES, LISTING_NOTE, listingState, TRAINING_TITLE, trainingStatus, type ListingApplication, type TrainingRow } from '../../../../lib/covens/founding';
import { fetchTraining, latestListing } from '../../../../lib/covens/foundingApi';
import type { Coven } from '../../../../lib/covens/model';
import { useSession } from '../../../../lib/session';
import { colors, radius, type } from '../../../../theme';

// Leading a coven: the founder's training (seven modules, each a lesson, a
// private reflection and a short test) and, for covens you founded, where
// each stands with Find a coven. Website: covens/leading/.
export default function Leading() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [rows, setRows] = useState<TrainingRow[] | null>(null);
  const [founded, setFounded] = useState<{ coven: Coven; latest: ListingApplication | null }[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let live = true;
      void fetchTraining(userId).then((r) => live && setRows(r));
      void api
        .fetchMyCovens(userId)
        .then((covens) => Promise.all(covens.filter((c) => c.founder_id === userId).map(async (coven) => ({ coven, latest: coven.listing_approved_at ? null : await latestListing(coven.id) }))))
        .then((list) => live && setFounded(list))
        .catch(() => undefined);
      return () => {
        live = false;
      };
    }, [userId]),
  );

  const status = trainingStatus(rows);
  const back = '/coven' as Href;

  return (
    <MoreScreen title="Leading a coven" eyebrow="Covens" back={back} backLabel="Back to Covens">
      <Text style={type.body}>
        {TRAINING_TITLE}: seven short modules on holding space and consent, safeguarding, running rites in the app, conflict and endings, cultural respect, crisis signposting, and age, privacy and money. Each has a lesson, a reflection that stays private to you, and a short test.
      </Text>
      <Text style={type.caption}>Needed before a coven is listed in Find a coven; open to anyone, and worth doing for a coven kept to friends too.</Text>
      {!session && (
        <Card>
          <Text style={type.body}>Sign in to take the training and keep your progress.</Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </Card>
      )}

      {status.done && (
        <Card tone="gold">
          <View style={styles.badgeRow}>
            <View style={styles.badge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Text style={styles.badgeMark}>✦</Text>
            </View>
            <View style={styles.flex}>
              <Text style={type.cardTitle}>{BADGE_LABEL}</Text>
              <Text style={type.caption}>You have passed every module. The badge shows on your listing applications.</Text>
            </View>
          </View>
        </Card>
      )}

      <Section label={session ? status.line : 'The modules'}>
        <MenuList>
          {FOUNDER_MODULES.map((m, i) => (
            <MenuRow
              key={m.id}
              label={`${i + 1}. ${m.title}`}
              detail={status.passed.has(m.id) ? 'Passed' : status.next?.id === m.id ? 'Next' : 'Lesson, reflection and test'}
              icon="books"
              last={i === FOUNDER_MODULES.length - 1}
              onPress={() => router.push(`/coven/leading/${m.slug}` as Href)}
            />
          ))}
        </MenuList>
      </Section>

      {!!founded.length && (
        <Section label="Covens you founded">
          <MenuList>
            {founded.map(({ coven, latest }, i) => (
              <MenuRow
                key={coven.id}
                label={coven.name}
                detail={listingState(coven, latest).line}
                icon="community"
                last={i === founded.length - 1}
                onPress={() => router.push(`/coven/leading/apply?c=${coven.slug}` as Href)}
              />
            ))}
          </MenuList>
        </Section>
      )}
      <Notice tone="muted">{LISTING_NOTE}</Notice>
      <MenuList>
        <MenuRow label="Found a coven" detail="Start unlisted, by invitation" icon="offer" onPress={() => router.push('/coven/new' as Href)} />
        <MenuRow label="Support" detail="Crisis, grief and other help lines" icon="support" last onPress={() => router.push('/more/support' as Href)} />
      </MenuList>
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  badge: { width: 48, height: 48, borderRadius: radius.chip, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  badgeMark: { color: colors.gold, fontSize: 22 },
  flex: { flex: 1 },
});
