import { router } from 'expo-router';
import { Text } from 'react-native';

import { Button } from '../../../../../components/Button';
import { covenHref, CovenScreen, openOnWebsite } from '../../../../../components/covens/CovenScreen';
import { MenuList, MenuRow, Section } from '../../../../../components/more/ui';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { occasionLabel, orderSteps, ritualGroups, riteTime, rsvpSummary, type Ritual } from '../../../../../lib/covens/model';
import { type } from '../../../../../theme';

export default function Rituals() {
  const coven = useCoven();
  const { live, upcoming, past } = ritualGroups(coven.rituals);
  const drafts = coven.rituals.filter((r) => r.status === 'draft');
  const canPlan = coven.perms.lead || coven.perms.schedule || coven.perms.site;

  const row = (r: Ritual, detail: string, last: boolean) => (
    <MenuRow key={r.id} label={r.title} detail={detail} last={last} onPress={() => router.push(covenHref(coven.slug, `ritual/${r.id}`))} />
  );
  const stepCount = (r: Ritual) => {
    const n = orderSteps(coven.steps, r.id).length;
    return `${n} ${n === 1 ? 'step' : 'steps'}`;
  };
  const answer = (r: Ritual) => {
    const { going, mine } = rsvpSummary(coven.rsvps, r.id, coven.userId);
    const you = mine === 'going' ? 'You’re going' : mine === 'maybe' ? 'You might go' : mine === 'not_going' ? 'You can’t make it' : '';
    return [riteTime(r.scheduled_for), occasionLabel(r), going.length ? `${going.length} going` : '', you].filter(Boolean).join(' · ');
  };

  return (
    <CovenScreen title="Rituals" onRefresh={coven.refreshRituals}>
      {coven.turn && (
        <Section label="Your turn">
          <MenuList>
            <MenuRow label={coven.turn.step.title} detail={coven.turn.ritual.title} icon="moon" last onPress={() => router.push(covenHref(coven.slug, `ritual/${coven.turn!.ritual.id}`))} />
          </MenuList>
        </Section>
      )}
      {live.length > 0 && (
        <Section label="Happening now">
          <MenuList>{live.map((r, i) => row(r, stepCount(r), i === live.length - 1))}</MenuList>
        </Section>
      )}
      <Section label="On the calendar">
        {upcoming.length ? <MenuList>{upcoming.map((r, i) => row(r, answer(r), i === upcoming.length - 1))}</MenuList> : <Text style={type.caption}>No rites are on the calendar yet.</Text>}
      </Section>
      {canPlan && drafts.length > 0 && (
        <Section label="Drafts">
          <MenuList>{drafts.map((r, i) => row(r, stepCount(r), i === drafts.length - 1))}</MenuList>
        </Section>
      )}
      {past.length > 0 && (
        <Section label="Past rites">
          <MenuList>{past.map((r, i) => row(r, [r.status === 'cancelled' ? 'Cancelled' : 'Done', r.scheduled_for ? riteTime(r.scheduled_for) : ''].filter(Boolean).join(' · '), i === past.length - 1))}</MenuList>
        </Section>
      )}
      {canPlan && (
        <Section label="Planning">
          <Text style={type.caption}>Write rituals, give their steps to people or positions, and put rites on the calendar on the website.</Text>
          <Button label="Plan on the website" variant="outline" onPress={() => openOnWebsite(coven.slug, 'rituals')} />
        </Section>
      )}
    </CovenScreen>
  );
}
