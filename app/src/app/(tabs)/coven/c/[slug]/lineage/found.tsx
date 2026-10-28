import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { CopyPicker } from '../../../../../../components/covens/lineage';
import { Card, Chips, Field, Notice, Section } from '../../../../../../components/more/ui';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { MEMBERSHIP_CHOICES, requestProblems, slugFrom, type CopyChoice, type MembershipChoice } from '../../../../../../lib/covens/lineage';
import { requestDaughter } from '../../../../../../lib/covens/lineageApi';
import { errorMessage, JOINING, type Joining } from '../../../../../../lib/covens/model';
import { type } from '../../../../../../theme';

const JOIN_OPTIONS = (Object.keys(JOINING) as Joining[]).map((value) => ({ value, label: JOINING[value].label }));
const LISTING = [
  { value: 'listed', label: 'Listed' },
  { value: 'unlisted', label: 'Unlisted (link only)' },
] as const;

// Found a daughter coven: its name and address, what carries across, and
// what becomes of your place here. The head of this coven approves (at
// once, when it's the head asking) and chooses the new coven's head.
export default function FoundDaughter() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  const head = info?.founder_id === coven.userId;
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [tagline, setTagline] = useState('');
  const [tradition, setTradition] = useState(info?.tradition ?? '');
  const [joining, setJoining] = useState<Joining>('application');
  const [visibility, setVisibility] = useState<'listed' | 'unlisted'>('listed');
  const [title, setTitle] = useState('High Priestess');
  const [copy, setCopy] = useState<Partial<Record<CopyChoice, boolean>>>({ documents: true, positions: true, programs: true, book: true, rituals: true, calendar: true });
  const [membership, setMembership] = useState<MembershipChoice>('stay');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const address = slugTouched ? slug : slugFrom(name);
  const mother = info?.name ?? 'this coven';
  const choice = MEMBERSHIP_CHOICES.find((c) => c.value === membership)!;

  const send = async () => {
    if (!info) return;
    const problems = requestProblems({ name, slug: address });
    if (problems.length) return setMessage(problems.join(' '));
    setBusy(true);
    setMessage(null);
    try {
      const made = await requestDaughter(info.id, { name: name.trim(), slug: address, tagline: tagline.trim(), tradition: tradition.trim(), joining, visibility, founder_rank: title.trim() }, copy, head ? 'stay' : membership, note);
      await coven.refresh();
      if (made.status === 'approved') {
        router.replace(covenHref(made.slug));
        return;
      }
      setMessage(`Your request is with ${coven.nameOf(info.founder_id)}, the head of ${mother}. You’ll hear when they answer.`);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  return (
    <CovenScreen title="Found a daughter coven">
      {info && coven.lineage && !coven.lineage.may_found && <Notice tone="muted">Your position doesn’t include founding a daughter coven. The head of {mother} can give it to you.</Notice>}
      {info && (
        <>
          <Text style={type.body}>
            A daughter coven hives off from {mother}: a coven of its own, with its own High Priestess running it day to day, under the final say of {mother}’s head. {head ? 'As the head, your request is approved as you send it.' : `The head of ${mother} approves it and chooses who leads it (usually you).`}
          </Text>
          <Section label="The new coven">
            <Field label="Name" value={name} onChangeText={setName} maxLength={80} />
            <Field
              label="Address"
              hint={`saltandsovereignty.com/covens/coven/?c=${address || 'your-coven'}`}
              value={address}
              onChangeText={(text) => {
                setSlugTouched(true);
                setSlug(text.toLowerCase().replace(/[^a-z0-9-]/g, ''));
              }}
              autoCapitalize="none"
              maxLength={60}
            />
            <Field label="One line about it (optional)" value={tagline} onChangeText={setTagline} maxLength={160} />
            <Field label="Tradition or path (optional)" value={tradition} onChangeText={setTradition} maxLength={80} />
            <Field label="What its head is called" value={title} onChangeText={setTitle} maxLength={60} />
            <Chips label="How witches join" options={JOIN_OPTIONS} value={joining} onChange={setJoining} />
            <Chips label="Directory" options={LISTING} value={visibility} onChange={setVisibility} />
          </Section>
          <Section label={`Carry across from ${mother}`}>
            <CopyPicker value={copy} onChange={setCopy} mother={mother} />
          </Section>
          {!head && (
            <Section label={`Your place in ${mother}`}>
              <Chips label={`Your place in ${mother}`} options={MEMBERSHIP_CHOICES.map((c) => ({ value: c.value, label: c.label }))} value={membership} onChange={setMembership} />
              <Text style={type.caption}>{choice.detail(mother)}</Text>
            </Section>
          )}
          <Card>
            <Text style={type.caption}>
              Everyone who joins the new coven is told first that it’s a daughter coven of {mother}, and that {mother}’s head has final say over it. Its member agreement says so too.
            </Text>
          </Card>
          {!head && <Field label={`A note for the head of ${mother} (optional)`} value={note} onChangeText={setNote} multiline maxLength={2000} />}
          <Button label={busy ? 'Sending…' : head ? 'Found it' : 'Ask to found it'} disabled={busy || !name.trim()} onPress={send} />
          {message && <Notice>{message}</Notice>}
        </>
      )}
    </CovenScreen>
  );
}
