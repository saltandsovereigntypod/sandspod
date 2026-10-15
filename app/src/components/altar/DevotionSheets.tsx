import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import { shortLabel } from '../../lib/altar/cabinet';
import {
  CHARGE_METHODS,
  CHARGE_PURPOSES,
  CLEANSE_METHODS,
  CLEANSE_REASONS,
  crystalDecisions,
  crystalIntention,
  crystalState,
  DEDICATION_DURATIONS,
  DEDICATION_TYPES,
  humanize,
  OFFERING_STATUSES,
  OFFERING_TYPES,
  offeringsOf,
  PRESENCE_REASONS,
  RESPONSES,
  deityState,
  defaultCleansingOf,
  defaultOfferingOf,
  slug,
  supportsOn,
  type CareInput,
  type DefaultCleansing,
  type DefaultOffering,
  type Dedication,
  type Offering,
  type OfferingInput,
  type OfferingUpdate,
  type Support,
} from '../../lib/altar/devotion';
import type { SavedObject } from '../../lib/altar/types';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

const nowIso = () => new Date().toISOString();
const shortDay = (iso: unknown) => {
  const date = typeof iso === 'string' && iso ? new Date(iso) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
};

export type CrystalMode = 'cleanse' | 'charge' | 'dedicate' | 'widget';

type CrystalProps = {
  mode: CrystalMode | null;
  /** Index of the crystal it was opened from. */
  index: number | null;
  objects: SavedObject[];
  onClose: () => void;
  onCare: (indices: number[], kind: 'cleanse' | 'charge', input: CareInput) => void;
  onDedicate: (index: number, input: Dedication) => void;
  /** Save (or clear, with null) the cleansing the home screen widget records for this crystal. */
  onDefaultCleansing: (index: number, value: DefaultCleansing | null) => void;
};

/** Cleanse, charge or dedicate a crystal, as the website's guided workflows do. */
export function CrystalSheet({ mode, index, objects, onClose, onCare, onDedicate, onDefaultCleansing }: CrystalProps) {
  const object = index != null ? objects[index] : null;
  const title = mode === 'cleanse' ? 'Cleanse' : mode === 'charge' ? 'Charge' : mode === 'widget' ? 'Widget cleansing' : 'Dedicate';
  return (
    <Sheet visible={!!mode && !!object} eyebrow={title} title={shortLabel(object?.label, 'Crystal')} onClose={onClose}>
      {mode && object && index != null && (
        mode === 'widget' ? (
          <DefaultCleansingForm key={`w-${index}`} object={object} objects={objects} onSave={(value) => onDefaultCleansing(index, value)} />
        ) : mode === 'dedicate' ? (
          <DedicateForm key={`d-${index}`} object={object} onSave={(input) => onDedicate(index, input)} />
        ) : (
          <CareForm key={`${mode}-${index}`} kind={mode} index={index} objects={objects} onCare={onCare} />
        )
      )}
    </Sheet>
  );
}

function CareForm({ kind, index, objects, onCare }: { kind: 'cleanse' | 'charge'; index: number; objects: SavedObject[]; onCare: CrystalProps['onCare'] }) {
  const now = nowIso();
  const crystals = objects.map((o, i) => ({ o, i })).filter(({ o }) => o.type === 'crystal');
  const [targets, setTargets] = useState<Set<number>>(new Set([index]));
  const anyIntention = [...targets].some((i) => !!crystalIntention(objects[i], now));
  const decisions = crystalDecisions(kind, anyIntention);
  const [decision, setDecision] = useState('');
  const [purpose, setPurpose] = useState('');
  const [methods, setMethods] = useState<string[]>([]);
  const subject = objects[index];
  const supports = supportsOn(objects, subject);
  const [picked, setPicked] = useState<string[]>([]);
  const [intention, setIntention] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'decide' | 'record'>('decide');
  const chosenDecision = decisions.includes(decision) ? decision : '';
  const newIntention = kind === 'charge' && slug(chosenDecision) === 'charge-with-one-shared-new-intention';

  if (step === 'decide') {
    return (
      <View style={styles.form}>
        <Group label={kind === 'cleanse' ? 'Which crystals' : 'Which crystals'}>
          <Text style={type.caption}>Each crystal keeps its own state and history.</Text>
          {crystals.map(({ o, i }) => {
            const state = crystalState(o, now);
            const facts = [crystalIntention(o, now) || 'No recorded intention', state.lastCleansedAt ? `cleansed ${shortDay(state.lastCleansedAt)}` : '', state.lastChargedAt ? `charged ${shortDay(state.lastChargedAt)}` : '']
              .filter(Boolean)
              .join(' · ');
            return (
              <Chip
                key={i}
                label={`${shortLabel(o.label, 'Crystal')} — ${facts}`}
                active={targets.has(i)}
                onPress={() =>
                  setTargets((prev) => {
                    const next = new Set(prev);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    return next;
                  })
                }
              />
            );
          })}
        </Group>
        <Group label={kind === 'cleanse' ? 'What happens to their intentions' : 'Charge direction'}>
          <Options options={decisions} value={chosenDecision} onChange={setDecision} />
        </Group>
        <Button
          label="Continue"
          disabled={!targets.size || !chosenDecision}
          onPress={() => {
            // "Cleanse selected first" leads into a cleansing, as on the website.
            setStep('record');
          }}
        />
        {slug(chosenDecision) === 'cleanse-selected-crystals-first' && (
          <Text style={type.caption}>You’ll record the cleansing now; charge them again afterwards.</Text>
        )}
      </View>
    );
  }

  const actualKind = slug(chosenDecision) === 'cleanse-selected-crystals-first' ? 'cleanse' : kind;
  const reasons = actualKind === 'cleanse' ? CLEANSE_REASONS : CHARGE_PURPOSES;
  const methodList = actualKind === 'cleanse' ? CLEANSE_METHODS : CHARGE_METHODS;
  const ready = !!purpose && methods.length > 0 && (!newIntention || !!intention.trim());

  return (
    <View style={styles.form}>
      <Text style={type.caption}>{`${humanize(slug(chosenDecision))}${targets.size > 1 ? ` · ${targets.size} crystals` : ''}`}</Text>
      {newIntention && (
        <Group label={targets.size > 1 ? 'Shared intention' : 'Intention'}>
          <Input value={intention} onChange={setIntention} placeholder="What should it hold?" multiline />
        </Group>
      )}
      <Group label={actualKind === 'cleanse' ? '1. Reason for cleansing' : '1. Purpose of the charge'}>
        <Options options={reasons} value={purpose} onChange={setPurpose} />
      </Group>
      <Group label={actualKind === 'cleanse' ? '2. Cleansing methods' : '2. Charging methods'}>
        <Options options={methodList} values={methods} onToggle={(m) => setMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))} />
      </Group>
      <Group label="3. Supports used">
        <Supports supports={supports} picked={picked} onChange={setPicked} />
      </Group>
      <Group label="Reflection">
        <Input value={notes} onChange={setNotes} placeholder="Optional notes or reflection" multiline />
      </Group>
      <Button
        label={actualKind === 'cleanse' ? 'Complete cleansing' : 'Complete charge'}
        disabled={!ready}
        onPress={() =>
          onCare([...targets], actualKind, {
            decision: chosenDecision,
            purpose,
            methods,
            supports: supports.filter((s) => picked.includes(s.id)),
            intention: newIntention ? intention : '',
            notes,
            occurredAt: nowIso(),
          })
        }
      />
    </View>
  );
}

function DedicateForm({ object, onSave }: { object: SavedObject; onSave: (input: Dedication) => void }) {
  const details = (crystalState(object, nowIso()).dedicationDetails ?? {}) as Record<string, string>;
  const [kind, setKind] = useState(DEDICATION_TYPES.find((t) => slug(t) === details.type) ?? '');
  const [dedicatedTo, setDedicatedTo] = useState(details.dedicatedTo ?? '');
  const [intention, setIntention] = useState(details.intention ?? '');
  const [duration, setDuration] = useState(DEDICATION_DURATIONS.find((d) => slug(d) === details.duration) ?? 'Until manually removed');
  const [reviewAt, setReviewAt] = useState((details.reviewAt ?? '').slice(0, 10));
  const [notes, setNotes] = useState(details.notes ?? '');
  const needsDate = ['until-a-chosen-date', 'ongoing-but-review-later'].includes(slug(duration));

  return (
    <View style={styles.form}>
      <Text style={type.caption}>Give this crystal an ongoing role, relationship or devotional focus.</Text>
      <Group label="1. Dedication type">
        <Options options={DEDICATION_TYPES} value={kind} onChange={setKind} />
      </Group>
      <Group label="2. Dedicated to">
        <Input value={dedicatedTo} onChange={setDedicatedTo} placeholder="Brigid, my grandmother, the hearth…" />
      </Group>
      <Group label="3. Dedication intention">
        <Input value={intention} onChange={setIntention} placeholder="What it holds" multiline />
      </Group>
      <Group label="4. Duration">
        <Options options={DEDICATION_DURATIONS} value={duration} onChange={setDuration} />
        {needsDate && <Input value={reviewAt} onChange={setReviewAt} placeholder="Review or end date (YYYY-MM-DD)" />}
      </Group>
      <Group label="5. Reflection">
        <Input value={notes} onChange={setNotes} placeholder="Optional notes" multiline />
      </Group>
      <Button
        label="Save dedication"
        disabled={!kind || (!dedicatedTo.trim() && !intention.trim())}
        onPress={() => onSave({ type: kind, entityId: details.entityId ?? '', dedicatedTo, intention, duration, reviewAt: needsDate ? reviewAt : '', notes })}
      />
    </View>
  );
}

export type DeityMode = 'offering' | 'reason' | 'widget';

type DeityProps = {
  mode: DeityMode | null;
  index: number | null;
  objects: SavedObject[];
  onClose: () => void;
  onOffer: (index: number, input: OfferingInput) => void;
  onUpdate: (index: number, offeringId: string, input: OfferingUpdate) => void;
  onReason: (index: number, reason: string, notes: string) => void;
  /** Save (or clear, with null) the offering the home screen widget records for this presence. */
  onDefaultOffering: (index: number, value: DefaultOffering | null) => void;
};

/** Record offerings and the reason for a presence on the altar. */
export function DeitySheet({ mode, index, objects, onClose, onOffer, onUpdate, onReason, onDefaultOffering }: DeityProps) {
  const object = index != null ? objects[index] : null;
  return (
    <Sheet
      visible={!!mode && !!object}
      eyebrow={mode === 'reason' ? 'Reason for presence' : mode === 'widget' ? 'Widget offering' : 'Offerings'}
      title={shortLabel(object?.label, 'Presence')}
      onClose={onClose}
    >
      {mode && object && index != null && (
        mode === 'widget' ? (
          <DefaultOfferingForm key={`w-${index}`} object={object} objects={objects} onSave={(value) => onDefaultOffering(index, value)} />
        ) : mode === 'reason' ? (
          <ReasonForm key={`r-${index}`} object={object} onSave={(reason, notes) => onReason(index, reason, notes)} />
        ) : (
          <OfferingManager key={`o-${index}`} object={object} objects={objects} onOffer={(input) => onOffer(index, input)} onUpdate={(id, input) => onUpdate(index, id, input)} />
        )
      )}
    </Sheet>
  );
}

function OfferingManager({ object, objects, onOffer, onUpdate }: { object: SavedObject; objects: SavedObject[]; onOffer: (input: OfferingInput) => void; onUpdate: (id: string, input: OfferingUpdate) => void }) {
  const offerings = offeringsOf(object, nowIso());
  const [editing, setEditing] = useState<Offering | 'new' | null>(offerings.length ? null : 'new');

  if (editing === 'new') return <NewOffering object={object} objects={objects} onSave={onOffer} />;
  if (editing) return <UpdateOffering offering={editing} onSave={(input) => onUpdate(editing.id, input)} />;
  return (
    <View style={styles.form}>
      <Button label="Record a new offering" onPress={() => setEditing('new')} />
      <Group label="Or update one">
        {offerings.map((o) => (
          <Chip
            key={o.id}
            label={`${shortDay(o.occurredAt)} · ${(o.items ?? []).map((i) => (typeof i === 'string' ? i : i.label)).join(', ') || (o.types ?? []).map(humanize).join(', ') || 'Offering'}${o.status ? ` — ${humanize(o.status)}` : ''}`}
            onPress={() => setEditing(o)}
          />
        ))}
      </Group>
    </View>
  );
}

function NewOffering({ object, objects, onSave }: { object: SavedObject; objects: SavedObject[]; onSave: (input: OfferingInput) => void }) {
  const supports = supportsOn(objects, object);
  const [types, setTypes] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [customItems, setCustomItems] = useState('');
  const [intention, setIntention] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Offered');
  const [customStatus, setCustomStatus] = useState('');
  const [response, setResponse] = useState('');
  const [responseNotes, setResponseNotes] = useState('');

  return (
    <View style={styles.form}>
      <Text style={type.caption}>Record the devotional meaning and state of this offering, without treating interpretation as fact.</Text>
      <Group label="1. Offering types">
        <Options options={OFFERING_TYPES} values={types} onToggle={(t) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))} />
      </Group>
      <Group label="2. Specific offerings">
        <Supports supports={supports} picked={picked} onChange={setPicked} />
        <Input value={customItems} onChange={setCustomItems} placeholder="Other offerings, separated by commas" />
      </Group>
      <Group label="3. Intention">
        <Input value={intention} onChange={setIntention} placeholder="Gratitude, petition, devotion, celebration…" />
        <Input value={message} onChange={setMessage} placeholder="Optional prayer or message" multiline />
      </Group>
      <Group label="4. Offering status">
        <Options options={OFFERING_STATUSES} value={status} onChange={setStatus} />
        {status === 'Custom' && <Input value={customStatus} onChange={setCustomStatus} placeholder="Custom status" />}
      </Group>
      <Group label="5. Perceived response">
        <Options options={RESPONSES} value={response} onChange={setResponse} />
        <Input value={responseNotes} onChange={setResponseNotes} placeholder="Optional personal interpretation" multiline />
      </Group>
      <Button
        label="Record offering"
        disabled={status === 'Custom' && !customStatus.trim()}
        onPress={() =>
          onSave({ types, supports: supports.filter((s) => picked.includes(s.id)), customItems, intention, message, status, customStatus, response, responseNotes, occurredAt: nowIso() })
        }
      />
    </View>
  );
}

function UpdateOffering({ offering, onSave }: { offering: Offering; onSave: (input: OfferingUpdate) => void }) {
  const known = OFFERING_STATUSES.find((s) => slug(s) === offering.status);
  const [status, setStatus] = useState(known ?? (offering.status ? 'Custom' : 'Offered'));
  const [customStatus, setCustomStatus] = useState(known ? '' : offering.status ?? '');
  const [response, setResponse] = useState(RESPONSES.find((r) => slug(r) === offering.perceivedResponse) ?? '');
  const [responseNotes, setResponseNotes] = useState(offering.responseNotes ?? '');
  const [followUpNotes, setFollowUpNotes] = useState(offering.followUpNotes ?? '');
  const [done, setDone] = useState(!!offering.completedAt);

  return (
    <View style={styles.form}>
      <Text style={type.caption}>{`Offered ${shortDay(offering.occurredAt)}${offering.intention ? ` · ${offering.intention}` : ''}`}</Text>
      <Group label="Current devotional state">
        <Options options={OFFERING_STATUSES} value={status} onChange={setStatus} />
        {status === 'Custom' && <Input value={customStatus} onChange={setCustomStatus} placeholder="Custom status" />}
      </Group>
      <Group label="Perceived response">
        <Options options={RESPONSES} value={response} onChange={setResponse} />
        <Input value={responseNotes} onChange={setResponseNotes} placeholder="Personal interpretation" multiline />
      </Group>
      <Group label="Reflection or follow-up">
        <Input value={followUpNotes} onChange={setFollowUpNotes} placeholder="Notes" multiline />
        <Chip label={done ? 'Completed or removed now ✓' : 'Mark completed or removed now'} active={done} onPress={() => setDone(!done)} />
      </Group>
      <Button
        label="Save offering update"
        disabled={status === 'Custom' && !customStatus.trim()}
        onPress={() => onSave({ status, customStatus, response, responseNotes, followUpNotes, completedAt: done ? offering.completedAt || nowIso() : '' })}
      />
    </View>
  );
}

function ReasonForm({ object, onSave }: { object: SavedObject; onSave: (reason: string, notes: string) => void }) {
  const state = deityState(object, nowIso());
  const details = (state.reasonDetails ?? {}) as Record<string, string>;
  const [reason, setReason] = useState(PRESENCE_REASONS.find((r) => slug(r) === details.reason) ?? '');
  const [notes, setNotes] = useState(details.notes ?? String(state.reasonForPresence ?? ''));
  return (
    <View style={styles.form}>
      <Text style={type.caption}>The role this presence holds on your altar.</Text>
      <Group label="Primary reason">
        <Options options={PRESENCE_REASONS} value={reason} onChange={setReason} />
      </Group>
      <Group label="Expanded notes">
        <Input value={notes} onChange={setNotes} placeholder="Optional" multiline />
      </Group>
      <Button label="Save reason" disabled={!reason} onPress={() => onSave(reason, notes)} />
    </View>
  );
}

// ─── Pieces ──────────────────────────────────────────────────────────────

/** What the home screen widget's Offer button offers to this presence. */
function DefaultOfferingForm({ object, objects, onSave }: { object: SavedObject; objects: SavedObject[]; onSave: (value: DefaultOffering | null) => void }) {
  const current = defaultOfferingOf(object, nowIso());
  const supports = supportsOn(objects, object);
  const [types, setTypes] = useState<string[]>(current?.types ?? []);
  const [picked, setPicked] = useState<string[]>((current?.supports ?? []).map((s) => s.id).filter((id) => supports.some((s) => s.id === id)));
  const [customItems, setCustomItems] = useState(current?.customItems ?? '');
  const [intention, setIntention] = useState(current?.intention ?? '');
  const [message, setMessage] = useState(current?.message ?? '');
  const chosenSupports = supports.filter((s) => picked.includes(s.id));
  const ready = types.length > 0 || chosenSupports.length > 0 || !!customItems.trim() || !!intention.trim();
  return (
    <View style={styles.form}>
      <Text style={type.caption}>
        Each tap of Offer on your home screen records this offering to {shortLabel(object.label, 'this presence')}, at the moment you tap.
      </Text>
      <Group label="1. Offering types">
        <Options options={OFFERING_TYPES} values={types} onToggle={(t) => setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))} />
      </Group>
      <Group label="2. What you offer">
        <Supports supports={supports} picked={picked} onChange={setPicked} />
        <Input value={customItems} onChange={setCustomItems} placeholder="Other offerings, separated by commas (wine, bread, honey…)" />
      </Group>
      <Group label="3. Intention">
        <Input value={intention} onChange={setIntention} placeholder="Gratitude, devotion, protection…" />
        <Input value={message} onChange={setMessage} placeholder="Optional prayer or words, recorded with each offering" multiline />
      </Group>
      <Button label="Save widget offering" disabled={!ready} onPress={() => onSave({ types, supports: chosenSupports, customItems, intention, message })} />
      {current && <Button label="Clear it" variant="outline" onPress={() => onSave(null)} />}
    </View>
  );
}

/** How the home screen widget's Cleanse button cleanses this crystal. */
function DefaultCleansingForm({ object, objects, onSave }: { object: SavedObject; objects: SavedObject[]; onSave: (value: DefaultCleansing | null) => void }) {
  const current = defaultCleansingOf(object, nowIso());
  const supports = supportsOn(objects, object);
  const [purpose, setPurpose] = useState(current?.purpose ?? 'Routine care');
  const [methods, setMethods] = useState<string[]>(current?.methods ?? []);
  const [picked, setPicked] = useState<string[]>((current?.supports ?? []).map((s) => s.id).filter((id) => supports.some((s) => s.id === id)));
  const [notes, setNotes] = useState(current?.notes ?? '');
  return (
    <View style={styles.form}>
      <Text style={type.caption}>
        Each tap of Cleanse on your home screen records this cleansing for {shortLabel(object.label, 'this crystal')}, at the moment you tap. Its intentions are kept.
      </Text>
      <Group label="1. Reason for cleansing">
        <Options options={CLEANSE_REASONS} value={purpose} onChange={setPurpose} />
      </Group>
      <Group label="2. Cleansing methods">
        <Options options={CLEANSE_METHODS} values={methods} onToggle={(m) => setMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))} />
      </Group>
      <Group label="3. Supports used">
        <Supports supports={supports} picked={picked} onChange={setPicked} />
      </Group>
      <Group label="Notes">
        <Input value={notes} onChange={setNotes} placeholder="Optional, recorded with each cleansing" multiline />
      </Group>
      <Button
        label="Save widget cleansing"
        disabled={!methods.length}
        onPress={() => onSave({ purpose, methods, supports: supports.filter((s) => picked.includes(s.id)), notes })}
      />
      {current && <Button label="Clear it" variant="outline" onPress={() => onSave(null)} />}
    </View>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={type.eyebrow}>{label}</Text>
      {children}
    </View>
  );
}

function Options({
  options,
  value,
  onChange,
  values,
  onToggle,
}: {
  options: string[];
  value?: string;
  onChange?: (v: string) => void;
  values?: string[];
  onToggle?: (v: string) => void;
}) {
  return (
    <ChipRow>
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          active={values ? values.includes(option) : value === option}
          onPress={() => (onToggle ? onToggle(option) : onChange?.(option))}
        />
      ))}
    </ChipRow>
  );
}

function Supports({ supports, picked, onChange }: { supports: Support[]; picked: string[]; onChange: (ids: string[]) => void }) {
  if (!supports.length) return <Text style={type.caption}>Place herbs, oils, incense, crystals, candles or apothecary items on the altar to choose them here.</Text>;
  return (
    <ChipRow>
      {supports.map((s) => (
        <Chip key={s.id} label={shortLabel(s.label)} active={picked.includes(s.id)} onPress={() => onChange(picked.includes(s.id) ? picked.filter((x) => x !== s.id) : [...picked, s.id])} />
      ))}
    </ChipRow>
  );
}

function Input({ value, onChange, placeholder, multiline }: { value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.tabInactive}
      accessibilityLabel={placeholder}
      multiline={multiline}
      style={[styles.input, multiline && styles.multiline]}
    />
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  group: { gap: 8 },
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ground,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
