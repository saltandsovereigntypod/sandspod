import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Card, CheckRow, Field, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage, normalizeQuestions, type Question } from '../../../../../../lib/covens/model';
import { type } from '../../../../../../theme';

export default function ManageQuestions() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  return <CovenScreen title="Questions for applicants" need="manage">{info && <QuestionsForm key={info.id} initial={normalizeQuestions(info.application_questions ?? [])} />}</CovenScreen>;
}

function QuestionsForm({ initial }: { initial: Question[] }) {
  const coven = useCoven();
  // Questions keep their ids, so answers people already gave stay matched to them.
  const [list, setList] = useState<Question[]>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const change = (index: number, next: Partial<Question>) => setList((prev) => prev.map((q, i) => (i === index ? { ...q, ...next } : q)));

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await api.updateCoven(coven.snapshot!.coven.id, { application_questions: normalizeQuestions(list) });
      await coven.refresh();
      setMessage('Saved.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  return (
    <>
      <Text style={type.caption}>Up to 20. Applicants answer these after signing the agreements. Empty questions are left out.</Text>
      {list.map((q, i) => (
        <Card key={q.id || `new-${i}`}>
          <Field label={`Question ${i + 1}`} value={q.prompt} onChangeText={(prompt) => change(i, { prompt })} maxLength={300} multiline />
          <CheckRow label="Required" value={q.required} onChange={(required) => change(i, { required })} />
          <Button label="Remove" variant="text" onPress={() => setList((prev) => prev.filter((_, j) => j !== i))} />
        </Card>
      ))}
      <View style={styles.row}>
        {list.length < 20 && <Button label="Add a question" variant="outline" onPress={() => setList((prev) => [...prev, { id: '', prompt: '', required: false }])} />}
        <Button label={busy ? 'Saving…' : 'Save questions'} onPress={save} disabled={busy} />
      </View>
      {message && <Notice>{message}</Notice>}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
