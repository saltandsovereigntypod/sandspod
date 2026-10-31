import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { LessonView } from '../../../../../components/covens/Lesson';
import { LinkChips, moonHref } from '../../../../../components/year/parts';
import { Body, Card, RitualScreen, Row, List, Title, Toggle } from '../../../../../components/rituals/ui';
import { loadCourseCatalog } from '../../../../../lib/covens/courseCatalog';
import type { CourseDoc } from '../../../../../lib/covens/courses/index';
import { readingTime } from '../../../../../lib/covens/lesson';
import { READINGS, readKey, setDone } from '../../../../../lib/yearday';
import { useYear } from '../../../../../lib/yearday/store';
import { colors } from '../../../../../theme';

// A lesson of A Year and a Day: one of the coven courses' lessons, fetched
// with the courses (lib/covens/courseCatalog.ts) and read here, alone.
export default function YearLesson() {
  const { docId, moon } = useLocalSearchParams<{ docId: string; moon?: string }>();
  const { progress, change } = useYear();
  const [doc, setDoc] = useState<CourseDoc | null | undefined>(undefined);

  useEffect(() => {
    let live = true;
    loadCourseCatalog().then((catalog) => {
      if (!live) return;
      const found = catalog.programs.flatMap((p) => p.docs).find((d) => d.id === docId) ?? null;
      setDoc(found);
    });
    return () => {
      live = false;
    };
  }, [docId]);

  const known = READINGS[docId ?? ''];
  const title = doc?.title ?? known?.title ?? 'Lesson';
  const read = !!progress?.done[readKey(docId ?? '')];

  return (
    <RitualScreen back={moon ? `Moon ${moon}` : 'A Year and a Day'}>
      <Title eyebrow={doc ? readingTime(doc) : known ? `About ${known.minutes} minutes` : 'A lesson from the courses'}>{title}</Title>
      {doc === undefined && <ActivityIndicator color={colors.gold} />}
      {doc === null && (
        <Card>
          <Body>This lesson couldn’t be fetched. The lessons come from the website, so please check your connection and try again.</Body>
        </Card>
      )}
      {!!doc && (
        <>
          <Body muted>{doc.summary}</Body>
          <LessonView body={doc.body} />
          {!!doc.links?.length && <LinkChips links={doc.links} />}
          <Body muted>From the coven courses, read here for practising alone. Where a lesson speaks of a coven, a mentor or a test, take what helps you.</Body>
        </>
      )}
      {!!progress && <Toggle label="I’ve read this" value={read} onChange={(on) => change((p) => setDone(p, readKey(docId ?? ''), on, new Date()))} />}
      {!!moon && (
        <List>
          <Row icon="calendar" title={`Back to moon ${moon}`} last onPress={() => (router.canGoBack() ? router.back() : router.replace(moonHref(Number(moon))))} />
        </List>
      )}
    </RitualScreen>
  );
}
