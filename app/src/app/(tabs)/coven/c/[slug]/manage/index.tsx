import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { MenuList, MenuRow, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage, normalizeQuestions } from '../../../../../../lib/covens/model';
import { covenCalendarNames } from '../../../../../../lib/covens/programs';
import { type } from '../../../../../../theme';

// Manage: the coven's details, its pages and agreements, its positions and
// their powers, the questions it asks applicants, and archiving it.
export default function Manage() {
  const coven = useCoven();
  const [message, setMessage] = useState<string | null>(null);
  const snap = coven.snapshot;
  const info = snap?.coven;
  const go = (sub: string) => router.push(covenHref(coven.slug, `manage/${sub}`));
  const agreements = snap?.documents.filter((d) => d.requires_signature).length ?? 0;
  const questions = normalizeQuestions(info?.application_questions ?? []).length;
  const calendar = covenCalendarNames(info);

  const archive = () => {
    if (!info) return;
    const reopening = info.status === 'archived';
    const run = async () => {
      try {
        if (coven.perms.site) await api.moderateCoven(info.id, reopening ? 'active' : 'archived');
        else await api.updateCoven(info.id, { status: 'archived' });
        await coven.refresh();
        setMessage(reopening ? 'The coven is open again.' : 'The coven is archived.');
      } catch (error) {
        setMessage(errorMessage(error));
      }
    };
    if (reopening) return void run();
    Alert.alert('Archive this coven?', `It leaves the directory, and its chat and altars become read-only.${coven.perms.site ? '' : ' Only the site moderators can reopen it.'}`, [
      { text: 'Keep it open', style: 'cancel' },
      { text: 'Archive', style: 'destructive', onPress: () => void run() },
    ]);
  };

  return (
    <CovenScreen title="Manage" need="manage">
      {info && snap && (
        <>
          <MenuList>
            <MenuRow label="The coven" detail="Name, description, joining, directory, altar setting" icon="settings" onPress={() => go('details')} />
            <MenuRow
              label="Creed, rules and agreements"
              detail={`${snap.documents.length} ${snap.documents.length === 1 ? 'page' : 'pages'}${agreements ? `, ${agreements} to be signed` : ''}`}
              icon="library"
              onPress={() => go('pages')}
            />
            <MenuRow label="Positions" detail={`${snap.ranks.length} ${snap.ranks.length === 1 ? 'position' : 'positions'} and their powers`} icon="community" onPress={() => go('positions')} />
            <MenuRow label="Questions for applicants" detail={questions ? `${questions} ${questions === 1 ? 'question' : 'questions'}` : 'None yet'} icon="letters" onPress={() => go('questions')} />
            <MenuRow label="Practice calendar" detail={calendar.length ? calendar.join(', ') : 'The holidays the coven keeps'} icon="moon" last={!(coven.perms.manage || coven.perms.site)} onPress={() => go('calendar')} />
            {(coven.perms.manage || coven.perms.site) && <MenuRow label="Initiation & training powers" detail="Who manages programs, and who sees everyone’s progress" icon="journey" last onPress={() => go('powers')} />}
          </MenuList>
          <Section label="People">
            <MenuList>
              <MenuRow label="Review" detail="Applications and requests to advance" icon="offer" onPress={() => router.push(covenHref(coven.slug, 'review'))} />
              <MenuRow label="Initiation & training" detail="Design programs, assign them and mentors" icon="journey" onPress={() => router.push(covenHref(coven.slug, 'programs/design'))} />
              <MenuRow label="Members" detail="Positions, pauses, removing and handing on" icon="account" last onPress={() => router.push(covenHref(coven.slug, 'members'))} />
            </MenuList>
          </Section>
          {(coven.perms.site || (coven.perms.founder && info.status === 'active')) && (
            <Section label={info.status === 'archived' ? 'Reopen the coven' : 'Archive the coven'}>
              <Text style={type.caption}>An archived coven leaves the directory and becomes read-only for its members.{coven.perms.site ? '' : ' Only the site moderators can reopen it.'}</Text>
              <Button label={info.status === 'archived' ? 'Reopen the coven' : 'Archive the coven'} variant="outline" onPress={archive} />
            </Section>
          )}
          {message && <Notice>{message}</Notice>}
        </>
      )}
    </CovenScreen>
  );
}
