import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { SupportLink } from '../../../../../../components/SupportLink';
import { JournalPrompt, journeyStyles, JourneyWaiting, lessonHref, Paragraphs, STAGE_WORDS } from '../../../../../../components/journeys/parts';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../../components/rituals/ui';
import { findLesson, nextLesson } from '../../../../../../lib/journeys/lookup';
import { journeyStatus, markRead, markUnread } from '../../../../../../lib/journeys/progress';
import { startJourney, useJourney } from '../../../../../../lib/journeys/store';
import { ritualsLibraryHref } from '../../../../../../lib/library';
import { libraryItem } from '../../../../../../lib/rituals/planner';
import { premadeById } from '../../../../../../lib/rituals/premade';
import { type } from '../../../../../../theme';

/** "traditional/deity/hekate" → the Library's id and a name to show. */
function libraryLink(ref: string) {
  const name = libraryItem(ref)?.name ?? (ref.split('/').pop() ?? ref).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return { id: ref.replace(/\//g, ':'), name };
}

// A calm reading view: the lesson, what the evidence shows, how people practise it, and questions to sit with.
export default function LessonView() {
  const { journeyId, lessonId } = useLocalSearchParams<{ journeyId: string; lessonId: string }>();
  const { journey, progress, change, textState, retry } = useJourney(journeyId);
  const found = findLesson(journey, lessonId);

  if (!journey && textState !== 'missing') return <JourneyWaiting state={textState} retry={retry} back="Journey" />;
  if (!journey || !found) {
    return (
      <RitualScreen back="Journey">
        <Title>Not found</Title>
        <Body>This lesson isn’t here any more.</Body>
      </RitualScreen>
    );
  }

  const { lesson, stage } = found;
  const going = progress && journeyStatus(progress) !== 'stopped' ? progress : null;
  const read = going?.lessonsRead[lesson.id];
  const after = nextLesson(journey, lesson.id);
  const premade = (lesson.premade ?? []).map(premadeById).filter((p) => !!p);

  const toggleRead = async () => {
    if (!going) {
      await startJourney(journey.id);
      return;
    }
    await change((p) => (read ? markUnread(p, lesson.id) : markRead(p, lesson.id, new Date())));
  };

  return (
    <RitualScreen back={stage.title}>
      <Title eyebrow={`${journey.title} · ${STAGE_WORDS[stage.kind]} · about ${lesson.minutes} min`}>{lesson.title}</Title>
      <Text style={journeyStyles.heading}>{lesson.summary}</Text>

      {lesson.sections.map((section, i) => (
        <View key={`${section.heading}-${i}`} style={ui.gap}>
          <Text accessibilityRole="header" style={journeyStyles.heading}>
            {section.heading}
          </Text>
          <Paragraphs text={section.body} />
        </View>
      ))}

      <Card accent>
        <SectionLabel>What we know</SectionLabel>
        <Paragraphs text={lesson.knowAndDont.known} />
        <SectionLabel>What we don’t</SectionLabel>
        <Paragraphs text={lesson.knowAndDont.unknown} />
      </Card>

      <Card>
        <SectionLabel>In practice</SectionLabel>
        <Paragraphs text={lesson.inPractice} />
      </Card>

      {lesson.reflect.length > 0 && (
        <View style={ui.gap}>
          <SectionLabel>To reflect on</SectionLabel>
          {lesson.reflect.map((prompt, i) => (
            <JournalPrompt key={i} prompt={prompt} title={`${journey.title}: ${lesson.title}`} intention={`Reflection on ${lesson.title}`} />
          ))}
        </View>
      )}

      {premade.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Put it into practice</SectionLabel>
          <List>
            {premade.map((p, i) => (
              <Row
                key={p.id}
                icon="rituals"
                title={p.title}
                detail={p.summary}
                last={i === premade.length - 1}
                onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: p.id } })}
              />
            ))}
          </List>
        </View>
      )}

      {!!lesson.library?.length && (
        <View style={ui.gapSmall}>
          <SectionLabel>In the Living Library</SectionLabel>
          <List>
            {lesson.library.map((ref, i, all) => {
              const link = libraryLink(ref);
              return (
                <Row
                  key={ref}
                  icon="grimoire"
                  title={link.name}
                  last={i === all.length - 1}
                  label={`${link.name}. Open in the Library`}
                  onPress={() => router.push(ritualsLibraryHref({ id: link.id }))}
                />
              );
            })}
          </List>
        </View>
      )}

      {!!lesson.further?.length && (
        <Card>
          <SectionLabel>Further reading</SectionLabel>
          {lesson.further.map((f, i) => (
            <Text key={i} style={journeyStyles.bullet}>{`• ${f}`}</Text>
          ))}
        </Card>
      )}

      <View style={ui.actions}>
        {read ? (
          <>
            <Body muted>Marked as read.</Body>
            {after ? (
              <Button label={`Next: ${after.title}`} onPress={() => router.replace(lessonHref(journey.id, after.id))} />
            ) : (
              <Button label={`Back to ${stage.title}`} onPress={() => router.back()} />
            )}
            <Button label="Mark as not read" variant="text" onPress={toggleRead} />
          </>
        ) : going ? (
          <Button label="Mark as read" onPress={toggleRead} />
        ) : (
          <>
            <Body muted>Begin the journey to keep track of what you’ve read.</Body>
            <Button label="Begin this journey" variant="outline" onPress={toggleRead} />
          </>
        )}
      </View>
      {!read && going && <Text style={type.caption}>Read it in more than one sitting if you like. It keeps.</Text>}
      <SupportLink />
    </RitualScreen>
  );
}
