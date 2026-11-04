import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Card, Chips, Notice, Section } from '../../../../../components/more/ui';
import { copyText } from '../../../../../lib/copyText';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { fetchYearInput } from '../../../../../lib/covens/sharedApi';
import { yearReview, yearReviewText, type YearReviewInput } from '../../../../../lib/covens/yearReview';
import { type } from '../../../../../theme';

// The coven's year in review (lib/covens/yearReview.ts): gatherings held,
// rites by kind and sabbat, attendance highlights, new members, pages added,
// what went on the altars most. Worked out from what you can already see, so
// everyone's attendance shows only to those who keep the coven's record;
// nothing comes from anyone's journal. Shared as plain text.

type Input = Omit<YearReviewInput, 'year' | 'userId' | 'seesAllAttendance'>;

export default function CovenYear() {
  const coven = useCoven();
  const params = useLocalSearchParams<{ year?: string }>();
  const thisYear = new Date().getFullYear();
  const asked = Number(params.year);
  const [year, setYear] = useState(Number.isInteger(asked) && asked > 2000 && asked <= thisYear ? asked : new Date().getMonth() === 0 ? thisYear - 1 : thisYear);
  const covenId = coven.snapshot?.coven.id;
  const covenName = coven.snapshot?.coven.name ?? 'The coven';
  const { userId, loadNames, nameOf } = coven;
  const seesAll = coven.perms.lead || coven.perms.founder || coven.perms.manage;
  const [input, setInput] = useState<{ key: string; data: Input | null } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const key = `${covenId}-${year}-${seesAll}`;

  useEffect(() => {
    if (!covenId) return;
    let off = false;
    fetchYearInput(covenId, year, userId, seesAll)
      .then((data) => {
        if (off) return;
        setInput({ key, data });
        void loadNames([...data.members.map((m) => m.user_id)]);
      })
      .catch(() => !off && setInput({ key, data: null }));
    return () => {
      off = true;
    };
  }, [covenId, year, userId, seesAll, key, loadNames]);

  const data = input?.key === key ? input.data : undefined;
  const review = useMemo(() => (data ? yearReview({ ...data, year, userId, seesAllAttendance: seesAll }) : null), [data, year, userId, seesAll]);
  const text = review ? yearReviewText(review, covenName, nameOf) : '';
  const share = async () => {
    try {
      await Share.share({ message: text });
    } catch {
      setMessage((await copyText(text)) ? 'Copied.' : 'Couldn’t share it just now.');
    }
  };

  return (
    <CovenScreen title="Year in review" eyebrow={covenName}>
      <Chips
        label="Year"
        options={[thisYear, thisYear - 1, thisYear - 2].map((y) => ({ value: String(y), label: String(y) }))}
        value={String(year)}
        onChange={(v) => setYear(Number(v))}
      />
      {data === undefined ? (
        <Text style={type.caption}>Gathering the year…</Text>
      ) : !review ? (
        <Notice tone="muted">The year couldn’t be gathered just now. Please try again.</Notice>
      ) : (
        <>
          <Card tone="gold">
            <Text style={type.eyebrow}>{`Your ${review.year} together`}</Text>
            <Text style={type.cardTitle}>{review.held ? `${review.held} ${review.held === 1 ? 'gathering' : 'gatherings'}` : 'No gatherings held'}</Text>
            {review.held > 0 && <Text style={type.body}>{`${review.rites} ${review.rites === 1 ? 'rite' : 'rites'}${review.meetings ? `, ${review.meetings} ${review.meetings === 1 ? 'meeting' : 'meetings'}` : ''}`}</Text>}
            {!!review.busiestMonth && <Text style={type.caption}>{`Busiest month: ${review.busiestMonth.month}`}</Text>}
            {!!review.longestMinutes && <Text style={type.caption}>{`Longest rite: ${review.longestMinutes} minutes`}</Text>}
          </Card>
          {review.byOccasion.length > 0 && (
            <Section label="Rites">
              {review.byOccasion.map((o) => (
                <Text key={o.label} style={type.body}>{`${o.label}: ${o.count}`}</Text>
              ))}
              {review.sabbats.length > 0 && <Text style={type.caption}>{`Sabbats kept: ${review.sabbats.join(', ')}`}</Text>}
            </Section>
          )}
          {(review.attendance.best || review.attendance.mine || review.attendance.steadfast.length > 0) && (
            <Section label="In the circle">
              {!!review.attendance.best && <Text style={type.body}>{`Best attended: ${review.attendance.best.title} (${review.attendance.best.count} there)`}</Text>}
              {!!review.attendance.average && <Text style={type.body}>{`On average ${review.attendance.average} in the circle`}</Text>}
              {review.attendance.steadfast.length > 0 && <Text style={type.body}>{`At every gathering: ${review.attendance.steadfast.map(nameOf).join(', ')}`}</Text>}
              {!!review.attendance.mine && <Text style={type.caption}>{`You were there for ${review.attendance.mine.came} of ${review.attendance.mine.of}.`}</Text>}
              {!seesAll && <Text style={type.caption}>Everyone’s attendance shows only to those who keep the coven’s record.</Text>}
            </Section>
          )}
          <Section label="The coven">
            <Text style={type.body}>{review.newMembers.length ? `Welcomed: ${review.newMembers.map(nameOf).join(', ')}` : 'No new members this year.'}</Text>
            <Text style={type.body}>{`${review.pages.count} ${review.pages.count === 1 ? 'page' : 'pages'} added to the coven’s books`}</Text>
            {review.pages.titles.length > 0 && <Text style={type.caption}>{review.pages.titles.join(' · ')}</Text>}
            {review.petitions > 0 && <Text style={type.body}>{`${review.petitions} ${review.petitions === 1 ? 'petition' : 'petitions'} held by the circle`}</Text>}
            {review.shelfAdded > 0 && <Text style={type.body}>{`${review.shelfAdded} ${review.shelfAdded === 1 ? 'thing' : 'things'} added to the shared shelf`}</Text>}
          </Section>
          {review.altarTop.length > 0 && (
            <Section label="Most often on the altar">
              {review.altarTop.map((t) => (
                <Text key={t.label} style={type.body}>{`${t.label} (${t.count})`}</Text>
              ))}
            </Section>
          )}
          <View style={styles.row}>
            <Button label="Share as text" onPress={() => void share()} />
            <Button label="Copy" variant="outline" onPress={() => void copyText(text).then((ok) => setMessage(ok ? 'Copied.' : 'Couldn’t copy it.'))} />
          </View>
          {message && <Notice>{message}</Notice>}
        </>
      )}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
