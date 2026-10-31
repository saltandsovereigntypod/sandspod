// Mentorship's shared parts: the mentorship profile form (with its 18+ and
// boundaries confirmations), the boundaries, many-choice chips, and a listing
// with its Ask. Used by Covens → Mentorship and a coven's Mentorship page.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Card, CheckRow, Field, Notice, Section } from '../more/ui';
import { errorMessage } from '../../lib/covens/model';
import * as api from '../../lib/together/api';
import {
  ABOUT_MAX,
  BOUNDARIES,
  canAsk,
  cleanListing,
  listingLine,
  MENTOR_TOPICS,
  MENTOR_TRADITIONS,
  NOTE_MAX,
  topicLabel,
  type MentorListing,
  type MentorRole,
} from '../../lib/together/mentorship';
import { colors, fonts, radius, type } from '../../theme';

export function Boundaries() {
  return (
    <View style={styles.gap}>
      {BOUNDARIES.map((line) => (
        <Text key={line} style={type.caption}>
          {line}
        </Text>
      ))}
    </View>
  );
}

/** Choose any number: each chip toggles. */
export function ManyChips({ label, options, value, onChange }: { label: string; options: readonly { id: string; label: string }[]; value: string[]; onChange: (next: string[]) => void }) {
  return (
    <View style={styles.gap}>
      <Text style={type.caption}>{label}</Text>
      <View style={styles.chips} accessibilityLabel={label}>
        {options.map((o) => {
          const on = value.includes(o.id);
          return (
            <Pressable
              key={o.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => onChange(on ? value.filter((v) => v !== o.id) : [...value, o.id])}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Your mentorship profile: what you offer or look for, and, the first time, the confirmations. */
export function ListingForm({ userId, listing, onSaved }: { userId: string; listing: MentorListing | null; onSaved: (next: MentorListing | null) => void }) {
  const [draft, setDraft] = useState(() => cleanListing(listing ?? { in_covens: true }));
  const [adult, setAdult] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const set = (patch: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...patch }));
  const save = async () => {
    if (!listing && (!adult || !agreed)) return setMessage('Mentorship is for adults who agree to the boundaries.');
    setBusy(true);
    setMessage(null);
    try {
      onSaved(await api.saveListing(userId, cleanListing(draft), !!listing));
      setMessage('Saved.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };
  const remove = async () => {
    setBusy(true);
    try {
      await api.removeListing(userId);
      onSaved(null);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };
  return (
    <View style={styles.gap}>
      <CheckRow label="I offer to mentor" value={draft.offers} onChange={(offers) => set({ offers })} />
      <CheckRow label="I’m looking for a mentor" value={draft.seeks} onChange={(seeks) => set({ seeks })} />
      <ManyChips label="Traditions (none chosen means any)" options={MENTOR_TRADITIONS} value={draft.traditions} onChange={(traditions) => set({ traditions })} />
      <ManyChips label="Topics" options={MENTOR_TOPICS} value={draft.topics} onChange={(topics) => set({ topics })} />
      <Field label="A little about you and what you hope for (optional)" value={draft.about ?? ''} onChangeText={(about) => set({ about })} multiline maxLength={ABOUT_MAX} />
      <CheckRow label="Show me in the open directory" value={draft.in_directory} onChange={(in_directory) => set({ in_directory })} />
      <CheckRow label="Show me to members of my covens" value={draft.in_covens} onChange={(in_covens) => set({ in_covens })} />
      {!listing && (
        <Card>
          <Text style={type.cardTitle}>Boundaries</Text>
          <Boundaries />
          <CheckRow label="I am 18 or older" value={adult} onChange={setAdult} />
          <CheckRow label="I have read and agree to the boundaries" value={agreed} onChange={setAgreed} />
        </Card>
      )}
      <Button label={busy ? 'Saving…' : listing ? 'Save' : 'Set up my mentorship profile'} disabled={busy} onPress={() => void save()} />
      {listing && <Button label="Take my mentorship profile down" variant="text" disabled={busy} onPress={() => void remove()} />}
      {message && <Notice tone="muted">{message}</Notice>}
    </View>
  );
}

/** One listing, and asking them (to mentor you, or to be mentored by you). */
export function ListingCard({ listing, name, want, covenId, onAsked, onReport }: { listing: MentorListing; name: string; want: 'mentor' | 'mentee'; covenId: string | null; onAsked: () => void; onReport: () => void }) {
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // want 'mentor': you're looking for a mentor, so you'd be the mentee.
  const as: MentorRole = want === 'mentor' ? 'mentee' : 'mentor';
  const ask = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await api.askMentorship(listing.user_id, as, covenId, note);
      setAsking(false);
      setMessage('Asked. You’ll hear when they answer.');
      onAsked();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };
  return (
    <Card>
      <Text style={type.cardTitle}>{name}</Text>
      <Text style={type.caption}>{listingLine(listing)}</Text>
      {listing.topics.length > 0 && <Text style={type.caption}>{listing.topics.map(topicLabel).join(' · ')}</Text>}
      {!!listing.about && <Text style={type.body}>{listing.about}</Text>}
      {canAsk(listing, as) && !asking && <Button label={as === 'mentee' ? 'Ask them to mentor you' : 'Offer to mentor them'} variant="outline" onPress={() => setAsking(true)} />}
      {asking && (
        <>
          <Field label="A short note (optional)" value={note} onChangeText={setNote} multiline maxLength={NOTE_MAX} />
          <Button label={busy ? 'Asking…' : 'Ask'} disabled={busy} onPress={() => void ask()} />
          <Button label="Not now" variant="text" onPress={() => setAsking(false)} />
        </>
      )}
      <Button label="Report" variant="text" onPress={onReport} />
      {message && <Notice tone="muted">{message}</Notice>}
    </Card>
  );
}

export function NeedsStanding({ words, action }: { words: string; action?: { label: string; onPress: () => void } }) {
  return (
    <Section>
      <Notice>{words}</Notice>
      {action && <Button label={action.label} onPress={action.onPress} />}
    </Section>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: radius.chip, borderWidth: 1, borderColor: colors.goldLine, paddingHorizontal: 12, paddingVertical: 8, minHeight: 36, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontFamily: fonts.body, color: colors.parchment, fontSize: 14 },
  chipTextOn: { color: colors.forestInk },
});
