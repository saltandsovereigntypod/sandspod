import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Card, Chip, Chips, Field, List, Notice, RitualScreen, Row, SectionLabel, SignInCard, Title, Toggle, ui } from '../../../../components/rituals/ui';
import type { LibraryRow } from '../../../../lib/covens/api';
import { SUBMISSION_TERMS } from '../../../../lib/community/model';
import { PATH_TRADITIONS } from '../../../../lib/library/traditions';
import {
  COMMUNITY_DIFFICULTIES,
  COMMUNITY_KINDS,
  COMMUNITY_MOONS,
  contentFromCovenTemplate,
  contentFromShared,
  contentFromTemplate,
  RITUAL_GUIDELINES,
  SHARE_AS,
  shareArgs,
  splitList,
  type CommunityContent,
  type CommunityStep,
  type ShareAs,
} from '../../../../lib/rituals/community';
import { fetchCovenTemplates, fetchShared, shareRitual, useCovensILead, type LeadCoven } from '../../../../lib/rituals/communityApi';
import { CLOSED_GUIDE_TITLE, closedMentions, mentionLine } from '../../../../lib/rituals/communityClosed';
import { useRituals } from '../../../../lib/rituals/store';
import { useSession } from '../../../../lib/session';
import { getMySettings } from '../../../../lib/settings/store';
import { type } from '../../../../theme';

type Source = { kind: 'template'; id: string } | { kind: 'coven'; coven: LeadCoven; item: LibraryRow } | { kind: 'edit'; id: string } | { kind: 'update'; id: string };

// "Share with the community": one of your templates, or a coven's (for its
// head and those who lead its rituals), offered to Community Rituals for
// review. Opened from a template (?templateId=), a coven's template
// (?covenId=&itemId=), one waiting or returned (?edit=) or a published one
// to update (?update=); otherwise it starts by asking which.
export default function ShareRitual() {
  const params = useLocalSearchParams<{ templateId?: string; covenId?: string; itemId?: string; edit?: string; update?: string }>();
  const { session } = useSession();
  const rituals = useRituals();
  const covens = useCovensILead();
  const [source, setSource] = useState<Source | null>(null);
  const [content, setContent] = useState<CommunityContent | null>(null);
  const [covenId, setCovenId] = useState<string | null>(null);
  const [shareAs, setShareAs] = useState<ShareAs>('preferred_name');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [covenTemplates, setCovenTemplates] = useState<{ coven: LeadCoven; items: LibraryRow[] }[]>([]);

  // Where it starts from, once.
  useEffect(() => {
    if (content || !session) return;
    let off = false;
    void (async () => {
      try {
        if (params.edit || params.update) {
          const row = await fetchShared((params.edit || params.update)!);
          if (off || !row) return;
          setContent(contentFromShared(row));
          setCovenId(row.coven_id);
          setShareAs(row.share_as === 'coven' ? 'coven' : row.share_as === 'anonymous' ? 'anonymous' : 'preferred_name');
          setSource(params.edit ? { kind: 'edit', id: row.id } : { kind: 'update', id: row.id });
        } else if (params.templateId) {
          const template = rituals.templates.find((t) => t.id === params.templateId);
          if (!template || off) return;
          setContent(contentFromTemplate(template));
          setSource({ kind: 'template', id: template.id });
        } else if (params.covenId && params.itemId) {
          const coven = (covens.data ?? []).find((c) => c.id === params.covenId);
          if (!coven) return;
          const item = (await fetchCovenTemplates(coven.id)).find((t) => t.id === params.itemId);
          if (!item || off) return;
          setContent(contentFromCovenTemplate(item.title, item.body));
          setCovenId(coven.id);
          setShareAs('coven');
          setSource({ kind: 'coven', coven, item });
        }
      } catch (e) {
        if (!off) setProblem(e instanceof Error ? e.message : 'Please try again.');
      }
    })();
    return () => {
      off = true;
    };
  }, [content, session, params.edit, params.update, params.templateId, params.covenId, params.itemId, rituals.templates, covens.data]);

  // The chooser lists the templates of covens you lead.
  const leadIds = (covens.data ?? []).map((c) => c.id).join(',');
  useEffect(() => {
    if (content || !leadIds) return;
    let off = false;
    void Promise.all((covens.data ?? []).map(async (coven) => ({ coven, items: await fetchCovenTemplates(coven.id).catch(() => [] as LibraryRow[]) }))).then((list) => {
      if (!off) setCovenTemplates(list.filter((x) => x.items.length));
    });
    return () => {
      off = true;
    };
  }, [leadIds, content, covens.data]);

  const mentions = useMemo(() => (content ? closedMentions(content) : []), [content]);

  if (!session) {
    return (
      <RitualScreen back="Community Rituals">
        <Title>Share a ritual</Title>
        <SignInCard title="Sign in to share" body="Your templates, and the covens you lead, are kept with your account." />
      </RitualScreen>
    );
  }

  if (sent) {
    return (
      <RitualScreen back="Community Rituals">
        <Title eyebrow="Community Rituals">Thank you</Title>
        <Card>
          <Body>
            {source?.kind === 'update'
              ? 'Your update has been sent for review. The published version stays up until the update is published.'
              : 'Your ritual has been sent for review. You’ll see where it stands under My shared rituals, with any note from the moderators.'}
          </Body>
          <Button label="My shared rituals" onPress={() => router.replace('/rituals/community/mine')} />
          <Button label="Back to Community Rituals" variant="text" onPress={() => router.replace('/rituals/community')} />
        </Card>
      </RitualScreen>
    );
  }

  // ── Which ritual ────────────────────────────────────────────────────────
  if (!content) {
    return (
      <RitualScreen back="Community Rituals">
        <Title eyebrow="Community Rituals">Share a ritual</Title>
        <Body>Choose one of your templates, or a template of a coven whose rituals you lead. You can change anything before you send it.</Body>
        {!!problem && <Notice>{problem}</Notice>}
        <View style={ui.gapSmall}>
          <SectionLabel>Your templates</SectionLabel>
          {rituals.templates.length ? (
            <List>
              {rituals.templates.map((t, i) => (
                <Row
                  key={t.id}
                  title={t.title}
                  detail={t.intention}
                  last={i === rituals.templates.length - 1}
                  onPress={() => {
                    setContent(contentFromTemplate(t));
                    setSource({ kind: 'template', id: t.id });
                  }}
                />
              ))}
            </List>
          ) : (
            <Body muted>No templates yet. Save a ritual as a template first, from a premade working, a ritual you’ve done, or the template editor.</Body>
          )}
        </View>
        {covenTemplates.map(({ coven, items }) => (
          <View key={coven.id} style={ui.gapSmall}>
            <SectionLabel>{`${coven.name}’s templates`}</SectionLabel>
            <List>
              {items.map((item, i) => (
                <Row
                  key={item.id}
                  icon="coven"
                  title={item.title}
                  last={i === items.length - 1}
                  onPress={() => {
                    setContent(contentFromCovenTemplate(item.title, item.body));
                    setCovenId(coven.id);
                    setShareAs('coven');
                    setSource({ kind: 'coven', coven, item });
                  }}
                />
              ))}
            </List>
          </View>
        ))}
      </RitualScreen>
    );
  }

  // ── The form ───────────────────────────────────────────────────────────
  const set = (patch: Partial<CommunityContent>) => setContent((c) => (c ? { ...c, ...patch } : c));
  const setStep = (index: number, patch: Partial<CommunityStep>) => set({ steps: content.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) });
  const moveStep = (index: number, by: number) => {
    const steps = [...content.steps];
    const [step] = steps.splice(index, 1);
    steps.splice(index + by, 0, step);
    set({ steps });
  };
  const covenName = source?.kind === 'coven' ? source.coven.name : (covens.data ?? []).find((c) => c.id === covenId)?.name;
  const credits = SHARE_AS.filter((o) => o.value !== 'coven' || !!covenId);

  const send = async () => {
    setProblem(null);
    const settings = await getMySettings(session.user.id).catch(() => ({}));
    const args = shareArgs(content, {
      id: source?.kind === 'edit' ? source.id : null,
      replaces: source?.kind === 'update' ? source.id : null,
      shareAs,
      names: settings as Record<string, unknown>,
      covenId,
      source: covenId ? 'coven_template' : source?.kind === 'template' ? 'template' : 'other',
      agreed,
    });
    if (!args.ok) {
      setProblem(args.message);
      return;
    }
    setBusy(true);
    try {
      await shareRitual(args.value);
      setSent(true);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'It couldn’t be sent. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <RitualScreen back="Community Rituals">
      <Title eyebrow={source?.kind === 'update' ? 'Send an update' : source?.kind === 'edit' ? 'Change and send again' : 'Share with the community'}>
        {content.title || 'Your ritual'}
      </Title>
      <Body muted>
        {covenName
          ? `From ${covenName}’s templates. Only the rite itself is shared: never the coven’s roles, members or notes.`
          : 'A copy is shared: your template stays yours, and your altar and Grimoire links stay with you.'}
      </Body>

      <Card>
        <Field label="Title" value={content.title} onChange={(title) => set({ title })} />
        <View style={ui.gapSmall}>
          <Body muted>Kind</Body>
          <Chips>
            {COMMUNITY_KINDS.map((k) => (
              <Chip key={k.value} label={k.label} selected={content.kind === k.value} onPress={() => set({ kind: k.value })} />
            ))}
          </Chips>
        </View>
        <Field label="What it’s for" value={content.summary} onChange={(summary) => set({ summary })} multiline placeholder="A sentence or two about the ritual and its purpose" />
        <Field label="Tradition or path" value={content.tradition} onChange={(tradition) => set({ tradition })} placeholder="Wicca, Hellenic, folk, eclectic…" />
        <Chips>
          {PATH_TRADITIONS.slice(0, 10).map((p) => (
            <Chip key={p.id} label={p.name} selected={content.tradition === p.name} onPress={() => set({ tradition: content.tradition === p.name ? '' : p.name })} />
          ))}
        </Chips>
        <Field label="Deities (separated by commas)" value={content.deities.join(', ')} onChange={(v) => set({ deities: splitList(v) })} placeholder="Optional" />
        <Field label="Occasion or holiday" value={content.occasion} onChange={(occasion) => set({ occasion })} placeholder="Samhain, a new home, a birthday…" />
        <View style={ui.gapSmall}>
          <Body muted>Moon phase</Body>
          <Chips>
            {COMMUNITY_MOONS.map((m) => (
              <Chip key={m.value} label={m.label} selected={content.moon_phase === m.value} onPress={() => set({ moon_phase: content.moon_phase === m.value ? '' : m.value })} />
            ))}
          </Chips>
        </View>
        <Field
          label="About how many minutes?"
          value={content.duration_minutes ? String(content.duration_minutes) : ''}
          onChange={(v) => set({ duration_minutes: Number(v.replace(/[^0-9]/g, '')) || null })}
          keyboardType="numeric"
          placeholder="Optional"
        />
        <View style={ui.gapSmall}>
          <Body muted>Who it suits</Body>
          <Chips>
            {COMMUNITY_DIFFICULTIES.map((d) => (
              <Chip key={d.value} label={d.label} selected={content.difficulty === d.value} onPress={() => set({ difficulty: content.difficulty === d.value ? '' : d.value })} />
            ))}
          </Chips>
        </View>
      </Card>

      <Card>
        <SectionLabel>What it needs</SectionLabel>
        <Field label="Materials (one per line, or separated by commas)" value={content.materials.join('\n')} onChange={(v) => set({ materials: splitList(v) })} multiline />
        <Field label="Preparation" value={content.preparation} onChange={(preparation) => set({ preparation })} multiline />
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Steps</SectionLabel>
        {content.steps.map((step, i) => (
          <Card key={i}>
            <Text style={type.eyebrow}>{`Step ${i + 1}`}</Text>
            <Field label="Step title" value={step.title} onChange={(title) => setStep(i, { title })} />
            <Field label="What to do" value={step.instructions} onChange={(instructions) => setStep(i, { instructions })} multiline />
            <Field label="Words to speak (optional)" value={step.spoken_text} onChange={(spoken_text) => setStep(i, { spoken_text })} multiline />
            <Field
              label="Minutes (optional)"
              value={step.minutes ? String(step.minutes) : ''}
              onChange={(v) => setStep(i, { minutes: Number(v.replace(/[^0-9.]/g, '')) || null })}
              keyboardType="decimal-pad"
            />
            <Chips>
              {i > 0 && <Chip label="Move up" onPress={() => moveStep(i, -1)} />}
              {i < content.steps.length - 1 && <Chip label="Move down" onPress={() => moveStep(i, 1)} />}
              <Chip label="Remove" onPress={() => set({ steps: content.steps.filter((_, x) => x !== i) })} />
            </Chips>
          </Card>
        ))}
        <Button
          label="Add a step"
          variant="outline"
          onPress={() => set({ steps: [...content.steps, { title: '', instructions: '', spoken_text: '', minutes: null }] })}
        />
      </View>

      <Card>
        <Field label="Closing" value={content.closing} onChange={(closing) => set({ closing })} multiline />
        <Field label="Notes for those who do it" value={content.notes} onChange={(notes) => set({ notes })} multiline placeholder="Substitutions, what you noticed, what to try" />
        <Field label="Take care (safety notes)" value={content.safety_notes} onChange={(safety_notes) => set({ safety_notes })} multiline placeholder="Fire, herbs or oils on skin, pets, pregnancy…" />
        <Field
          label="Its roots (where it comes from)"
          value={content.cultural_note}
          onChange={(cultural_note) => set({ cultural_note })}
          multiline
          placeholder="Your own, a folk custom, a tradition you were taught in…"
        />
        <Field label="Tags (separated by commas)" value={content.tags.join(', ')} onChange={(v) => set({ tags: splitList(v) })} placeholder="Optional" />
      </Card>

      {mentions.length > 0 && (
        <Card accent>
          <SectionLabel>Before you share</SectionLabel>
          <Body>This ritual names a tradition the {CLOSED_GUIDE_TITLE} guide describes as not open to everyone:</Body>
          {mentions.map((m) => (
            <Body key={m.id} muted>
              {mentionLine(m)}
            </Body>
          ))}
          <Body>Share it only if it’s yours to share, say where it comes from under “Its roots”, and never present a closed practice as open.</Body>
          <Button label={`Read ${CLOSED_GUIDE_TITLE}`} variant="text" onPress={() => router.push('/grimoire/library/closed')} />
        </Card>
      )}

      <Card>
        <SectionLabel>Credit it to</SectionLabel>
        <Chips>
          {credits.map((o) => (
            <Chip key={o.value} label={o.value === 'coven' && covenName ? covenName : o.label} selected={shareAs === o.value} onPress={() => setShareAs(o.value)} />
          ))}
        </Chips>
        <Body muted>
          {shareAs === 'coven'
            ? 'Shown as shared by the coven. Only its head and those who lead its rituals can share or change it.'
            : shareAs === 'anonymous'
              ? 'Shown as Anonymous. No one else can see who shared it.'
              : 'Shown with that name from More → Settings → Identity.'}
        </Body>
      </Card>

      <Card>
        <SectionLabel>Community guidelines</SectionLabel>
        {RITUAL_GUIDELINES.map((line) => (
          <Body key={line}>{`• ${line}`}</Body>
        ))}
        <Body muted>{SUBMISSION_TERMS[1]}</Body>
        <Toggle label="I agree to the Submission Terms and these guidelines" value={agreed} onChange={setAgreed} />
        <Button label="Read the Submission Terms" variant="text" onPress={() => router.push('/more/community/terms')} />
      </Card>

      {!!problem && <Notice>{problem}</Notice>}
      <View style={ui.actions}>
        <Button label={busy ? 'Sending…' : source?.kind === 'update' ? 'Send the update for review' : 'Send for review'} disabled={busy} onPress={send} />
        <Button label="Cancel" variant="text" onPress={() => (router.canGoBack() ? router.back() : router.replace('/rituals/community'))} />
      </View>
    </RitualScreen>
  );
}
