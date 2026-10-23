import { useState } from 'react';
import { Text } from 'react-native';

import { Button } from '../../../../../../../components/Button';
import { CovenScreen } from '../../../../../../../components/covens/CovenScreen';
import { Chips, Field, Notice, Section } from '../../../../../../../components/more/ui';
import { ALTAR_ARTWORK } from '../../../../../../../lib/altar/artworkData';
import * as api from '../../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../../lib/covens/CovenContext';
import { errorMessage, JOINING, parseTags, validateCoven, type Coven, type Joining } from '../../../../../../../lib/covens/model';
import { type } from '../../../../../../../theme';

const JOIN_OPTIONS = (Object.keys(JOINING) as Joining[]).map((value) => ({ value, label: JOINING[value].label }));
const LISTING = [
  { value: 'listed', label: 'Listed' },
  { value: 'unlisted', label: 'Unlisted (link only)' },
] as const;
const BACKGROUNDS = [{ value: '', label: 'Candlelit dark' }, ...ALTAR_ARTWORK.backgrounds.map((b) => ({ value: b.id, label: b.name }))];

export default function ManageDetails() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  return <CovenScreen title="The coven" need="manage">{info && <DetailsForm key={info.id} info={info} />}</CovenScreen>;
}

function DetailsForm({ info }: { info: Coven }) {
  const coven = useCoven();
  const [name, setName] = useState(info.name);
  const [tagline, setTagline] = useState(info.tagline ?? '');
  const [description, setDescription] = useState(info.description ?? '');
  const [tradition, setTradition] = useState(info.tradition ?? '');
  const [rhythm, setRhythm] = useState(info.meeting_rhythm ?? '');
  const [tags, setTags] = useState((info.tags ?? []).join(', '));
  const [joining, setJoining] = useState<Joining>(info.joining);
  const [visibility, setVisibility] = useState<'listed' | 'unlisted'>(info.visibility);
  const [limit, setLimit] = useState(info.member_limit ? String(info.member_limit) : '');
  const [background, setBackground] = useState(info.altar_background ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    const errors = validateCoven({ name, slug: info.slug, tagline, description, joining, visibility });
    const max = limit.trim() ? Number(limit) : null;
    if (max !== null && (!Number.isInteger(max) || max < 2 || max > 1000)) errors.push('The most members is a number from 2 to 1,000, or empty for no limit.');
    if (errors.length) return setMessage(errors.join(' '));
    setBusy(true);
    setMessage(null);
    try {
      await api.updateCoven(info.id, {
        name: name.trim(),
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        tradition: tradition.trim() || null,
        meeting_rhythm: rhythm.trim() || null,
        tags: parseTags(tags),
        joining,
        visibility,
        member_limit: max,
        altar_background: background || null,
      });
      await coven.refresh();
      setMessage('Saved.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  return (
    <>
      <Field label="Name" value={name} onChangeText={setName} maxLength={80} />
      <Field label="One line about the coven" value={tagline} onChangeText={setTagline} maxLength={160} />
      <Field label="Who you are and how you practise" value={description} onChangeText={setDescription} multiline maxLength={5000} />
      <Field label="Tradition or path" value={tradition} onChangeText={setTradition} maxLength={80} />
      <Field label="When you gather" value={rhythm} onChangeText={setRhythm} maxLength={160} />
      <Field label="Tags, separated by commas" value={tags} onChangeText={setTags} />
      <Chips label="How witches join" options={JOIN_OPTIONS} value={joining} onChange={setJoining} />
      <Chips label="Directory" options={LISTING} value={visibility} onChange={setVisibility} />
      <Field label="Most members (leave empty for no limit)" value={limit} onChangeText={(text) => setLimit(text.replace(/[^0-9]/g, ''))} keyboardType="number-pad" maxLength={4} />
      <Section label="Altar setting">
        <Chips label="Altar setting" options={BACKGROUNDS} value={background} onChange={setBackground} />
      </Section>
      <Text style={type.caption}>The coven’s address ({info.slug}) can’t change, so links to it keep working.</Text>
      <Button label={busy ? 'Saving…' : 'Save'} onPress={save} disabled={busy} />
      {message && <Notice>{message}</Notice>}
    </>
  );
}
