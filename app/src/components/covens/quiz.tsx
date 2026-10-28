// Pieces of a step's test: a question to answer, and an attempt's result
// question by question with the right answers and explanations.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Field } from '../more/ui';
import { answerWords, attemptLines, choose, isWritten, rightWords, type Answer, type Attempt, type Question } from '../../lib/covens/quiz';
import { colors, fonts, radius, type } from '../../theme';

export function QuestionView({ question, number, of, answer, onAnswer }: { question: Question; number: number; of: number; answer: Answer | undefined; onAnswer: (a: Answer) => void }) {
  const multi = question.type === 'multi';
  return (
    <View style={styles.question}>
      <Text style={type.eyebrow}>
        Question {number} of {of} · {question.points} point{question.points === 1 ? '' : 's'}
        {multi ? ' · choose every right answer' : ''}
      </Text>
      <Text style={styles.prompt}>{question.prompt}</Text>
      {isWritten(question) ? (
        <Field
          label={question.type === 'long' ? 'Your answer (a few paragraphs)' : 'Your answer (a few sentences)'}
          value={typeof answer === 'string' ? answer : ''}
          onChangeText={(text) => onAnswer(text)}
          multiline
          maxLength={8000}
          style={question.type === 'long' ? styles.long : undefined}
        />
      ) : (
        <View accessibilityRole={multi ? undefined : 'radiogroup'} style={styles.options}>
          {(question.options ?? []).map((option, i) => {
            const on = Array.isArray(answer) && answer.includes(i);
            return (
              <Pressable
                key={i}
                accessibilityRole={multi ? 'checkbox' : 'radio'}
                accessibilityState={{ checked: on }}
                accessibilityLabel={option}
                onPress={() => onAnswer(choose(question, answer, i))}
                style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && styles.pressed]}
              >
                <View style={[multi ? styles.box : styles.dot, on && styles.markOn]}>{on && <Text style={styles.tick}>{multi ? '✓' : '•'}</Text>}</View>
                <Text style={[type.body, styles.flex]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

/** An attempt question by question: the answer given, whether it was right, the right answer and why. */
export function AttemptResult({ attempt, showRubric }: { attempt: Attempt; showRubric?: boolean }) {
  return (
    <View style={styles.result}>
      {attemptLines(attempt).map((line) => {
        const q = line.question;
        return (
          <View key={q.id} style={[styles.line, line.right === true && styles.right, line.right === false && styles.wrong]}>
            <Text style={type.eyebrow}>
              Question {line.number}
              {line.right === true ? ' · right' : line.right === false ? ' · not quite' : ''}
              {line.points !== null ? ` · ${line.points} of ${q.points}` : isWritten(q) ? ` · ${q.points} point${q.points === 1 ? '' : 's'}, scored by a person` : ''}
            </Text>
            <Text style={styles.prompt}>{q.prompt}</Text>
            <Text style={type.body}>
              <Text style={styles.label}>Answer given: </Text>
              {answerWords(q, line.answer)}
            </Text>
            {line.right === false && !!rightWords(q) && (
              <Text style={type.body}>
                <Text style={styles.label}>The right answer: </Text>
                {rightWords(q)}
              </Text>
            )}
            {!!line.comment && (
              <Text style={type.body}>
                <Text style={styles.label}>Comment: </Text>
                {line.comment}
              </Text>
            )}
            {!!q.explanation && <Text style={[type.body, styles.explain]}>{q.explanation}</Text>}
            {showRubric && !!q.rubric && (
              <Text style={type.caption}>
                <Text style={styles.label}>What a full answer includes: </Text>
                {q.rubric}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  question: { gap: 10 },
  prompt: { fontFamily: fonts.bodySemi, fontSize: 17, lineHeight: 25, color: colors.cream },
  long: { minHeight: 180 },
  options: { gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.tile, padding: 12, minHeight: 48 },
  optionOn: { borderColor: colors.gold, backgroundColor: 'rgba(226,195,109,0.08)' },
  pressed: { opacity: 0.8 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: colors.goldLine, alignItems: 'center', justifyContent: 'center' },
  box: { width: 22, height: 22, borderRadius: 5, borderWidth: 1, borderColor: colors.goldLine, alignItems: 'center', justifyContent: 'center' },
  markOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  tick: { color: colors.forestInk, fontFamily: fonts.bodySemi, fontSize: 13 },
  result: { gap: 12 },
  line: { gap: 6, borderLeftWidth: 3, borderLeftColor: colors.hairline, paddingLeft: 12 },
  right: { borderLeftColor: colors.fern },
  wrong: { borderLeftColor: 'rgba(243,160,110,0.85)' },
  label: { fontFamily: fonts.bodySemi, color: colors.cream },
  explain: { color: colors.muted },
});
