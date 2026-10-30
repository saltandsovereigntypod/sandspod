import { router } from 'expo-router';
import { Text } from 'react-native';

import { Button } from '../../../../../components/Button';
import { useCovenMoonFor } from '../../../../../components/covens/CovenMoonCalendar';
import { covenHref, CovenScreen } from '../../../../../components/covens/CovenScreen';
import { MenuList, MenuRow, Section } from '../../../../../components/more/ui';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { occasionLabel, orderSteps, ritualGroups, riteTime, rsvpSummary, type Ritual } from '../../../../../lib/covens/model';
import { type } from '../../../../../theme';

export default function Rituals() {
  const coven = useCoven();
  const { live, upcoming, past } = ritualGroups(coven.rituals);
  const drafts = coven.rituals.filter((r) => r.status === 'draft');
  const canPlan = (coven.perms.lead && coven.standing.ok) || coven.perms.site;
  // Each gathering's date by the coven's moon count, when it differs from yours.
  const covenMoonOf = useCovenMoonFor(coven.snapshot?.coven);

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
    return [riteTime(r.scheduled_for), occasionLabel(r), covenMoonOf(r.scheduled_for), going.length ? `${going.length} going` : '', you].filter(Boolean).join(' · ');
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
          <Text style={type.caption}>Write a ritual, give its steps to people or positions, choose what each does at the altar, and put it on the calendar.</Text>
          <Button label="Plan a ritual" onPress={() => router.push(covenHref(coven.slug, 'ritual/plan'))} />
          <Text style={type.caption}>Or a meeting: an agenda, motions and votes, actions, its own chat, and minutes kept in the coven’s Book. It can be kept to the coven’s officers.</Text>
          <Button label="Plan a meeting" variant="outline" onPress={() => router.push(`${covenHref(coven.slug, 'ritual/plan')}?kind=meeting` as never)} />
        </Section>
      )}
      {(coven.perms.member || coven.perms.site) && (
        <Section label="The coven’s templates">
          <Text style={type.caption}>Rites and meetings the coven keeps to plan from. Save a copy to your own rituals{canPlan ? ', or share one with the community' : ''}.</Text>
          <Button label="The coven’s templates" variant="outline" onPress={() => router.push(covenHref(coven.slug, 'ritual/templates'))} />
        </Section>
      )}
      {(coven.perms.notices || coven.perms.site) && (
        <Section label="Gathering notifications">
          <Text style={type.caption}>Who hears on their phone when a rite or meeting goes on the calendar, moves, or comes off it.</Text>
          <Button label="Choose who hears" variant="outline" onPress={() => router.push(covenHref(coven.slug, 'manage/notices'))} />
        </Section>
      )}
    </CovenScreen>
  );
}
