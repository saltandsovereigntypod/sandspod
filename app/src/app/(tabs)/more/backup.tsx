import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, MoreScreen, Notice, Section } from '../../../components/more/ui';
import { countSummary, type Backup, type Validation } from '../../../lib/backup/format';
import {
  applyRestore,
  exportBackup,
  pickAndValidate,
  planAdditions,
  planConflicts,
  planRestore,
  type Plan,
} from '../../../lib/backup/run';
import { useGrimoire } from '../../../lib/grimoire/store';
import { useLibrary } from '../../../lib/library';
import { useSession } from '../../../lib/session';
import { reloadMySettings } from '../../../lib/settings/store';
import { colors, fonts, type } from '../../../theme';

type Stage =
  | { step: 'idle' }
  | { step: 'invalid'; name: string; validation: Validation }
  | { step: 'checked'; name: string; backup: Backup; warnings: string[] }
  | { step: 'planned'; name: string; backup: Backup; plan: Plan }
  | { step: 'done'; message: string };

export default function BackupScreen() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const grimoire = useGrimoire();
  const library = useLibrary();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Nothing is uploaded until you choose and confirm a valid backup.');
  const [stage, setStage] = useState<Stage>({ step: 'idle' });

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
    } finally {
      setBusy(false);
    }
  };

  const save = (kind: 'complete' | 'book') =>
    run(async () => {
      const result = await exportBackup(userId, setStatus, kind);
      setStatus(
        result.ok
          ? `Your backup includes ${countSummary(result.backup)}. ${result.backup.manifest.assetCount} embedded images.`
          : result.message,
      );
    });

  const choose = () =>
    run(async () => {
      setStage({ step: 'idle' });
      setStatus('Choose a Sanctuary backup file…');
      try {
        const picked = await pickAndValidate();
        if (picked.kind === 'cancelled') {
          setStatus('No file chosen. Nothing was changed.');
          return;
        }
        if (picked.kind === 'too-large') {
          setStatus('That backup is larger than the supported 25 MB limit.');
          return;
        }
        const { validation, name } = picked;
        if (!validation.valid || !validation.backup) {
          setStage({ step: 'invalid', name, validation });
          setStatus(
            `${validation.errors.length} blocking issue${validation.errors.length === 1 ? '' : 's'} must be resolved before restore. Nothing was changed.`,
          );
          return;
        }
        setStage({ step: 'checked', name, backup: validation.backup, warnings: validation.warnings });
        setStatus('Backup checked. Save a safety backup of what you have now before merging.');
      } catch {
        setStatus('That backup could not be checked. Nothing was changed.');
      }
    });

  const safety = () =>
    run(async () => {
      if (stage.step !== 'checked') return;
      const result = await exportBackup(userId, setStatus, 'safety');
      if (!result.ok) {
        setStatus(result.message);
        return;
      }
      try {
        const plan = await planRestore(stage.backup, userId);
        setStage({ step: 'planned', name: stage.name, backup: stage.backup, plan });
        setStatus('Safety backup saved and the merge is ready. Review it, then merge when you are ready.');
      } catch {
        setStatus('The safety backup saved, but a safe merge plan could not be prepared. Nothing was changed.');
      }
    });

  const merge = () =>
    run(async () => {
      if (stage.step !== 'planned') return;
      setStatus('Merging…');
      try {
        const result = await applyRestore(stage.plan, stage.backup, userId, setStatus);
        setStatus(result.message);
        if (result.ok) {
          setStage({ step: 'done', message: result.message });
          grimoire.refresh();
          library.refresh();
          reloadMySettings();
        }
      } catch {
        setStatus('Restore stopped safely. Existing work was not deleted; you can try again.');
      }
    });

  return (
    <MoreScreen title="Backup and restore" eyebrow="Keep your Sanctuary safe" back="/more" backLabel="Back to More">
      <Section label="Back up">
        <Card>
          <Text style={type.body}>
            {userId
              ? 'Save a copy of everything this account keeps in the Sanctuary: settings, altars, Book of Shadows, Library, rituals and your offerings.'
              : 'Guest work lives only on this device unless you take a backup with you.'}
          </Text>
          <Button
            label={userId ? 'Save complete backup' : 'Save guest backup'}
            disabled={busy}
            onPress={() => save('complete')}
          />
          <Button label="Export Book of Shadows" variant="outline" disabled={busy} onPress={() => save('book')} />
          <Text style={type.caption}>
            Backup files can hold names, spiritual writing, ritual records and images. Keep them somewhere private. The
            same file restores on the website.
          </Text>
        </Card>
      </Section>

      <Section label="Restore">
        <Card>
          <Text style={type.body}>
            Restoring merges: it adds what isn't here yet and keeps your current copy of anything that matches. Nothing
            is replaced or deleted.
          </Text>
          <Button label="Choose a backup file" variant="outline" disabled={busy} onPress={choose} />

          {stage.step === 'invalid' && (
            <View style={styles.report}>
              <Text style={styles.reportTitle}>{stage.name} can't be restored</Text>
              {stage.validation.errors.slice(0, 8).map((error) => (
                <Text key={error} style={type.caption}>
                  • {error}
                </Text>
              ))}
              {stage.validation.errors.length > 8 && (
                <Text style={type.caption}>…and {stage.validation.errors.length - 8} more.</Text>
              )}
            </View>
          )}

          {(stage.step === 'checked' || stage.step === 'planned') && (
            <View style={styles.report}>
              <Text style={styles.reportTitle}>Ready to merge {stage.name}</Text>
              <Text style={type.caption}>
                {countSummary(stage.backup)}. {stage.backup.manifest.assetCount} embedded images. Made{' '}
                {new Date(stage.backup.createdAt).toLocaleDateString()}.
              </Text>
              {stage.step === 'checked' &&
                stage.warnings.slice(0, 5).map((warning) => (
                  <Text key={warning} style={type.caption}>
                    • {warning}
                  </Text>
                ))}
              {stage.step === 'planned' && (
                <Text style={type.caption}>
                  {planAdditions(stage.plan)} {stage.plan.scope === 'guest' ? 'sections' : 'records'} to add;{' '}
                  {planConflicts(stage.plan)} matching {planConflicts(stage.plan) === 1 ? 'record keeps' : 'records keep'} your
                  current copy.
                </Text>
              )}
            </View>
          )}

          {stage.step === 'checked' && (
            <Button label="1 · Save a safety backup first" disabled={busy} onPress={safety} />
          )}
          {stage.step === 'planned' && <Button label="2 · Merge with my Sanctuary" disabled={busy} onPress={merge} />}
        </Card>
      </Section>

      <Notice>{status}</Notice>
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  report: {
    gap: 4,
    borderLeftWidth: 2,
    borderLeftColor: colors.goldLine,
    paddingLeft: 12,
  },
  reportTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
});
