// The four practice journals' screens: the hub, a journal, an entry and the
// form. The same screens open under the Grimoire (/grimoire/journals/…) and
// under Rituals (/rituals/journals/…); the person chooses which is home for
// each journal. The website's twin is grimoire/journals/journals.js.

import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { currentHour } from '../../lib/astro/hours';
import { useAltars } from '../../lib/altar/store';
import { fullDate, relativeDay } from '../../lib/calendar';
import { ancestorDays, formatPartial, lifespan, upcomingAnniversaries } from '../../lib/craft/hedge/ancestors';
import { DREAM_SYMBOLS } from '../../lib/craft/hedge/dreamSymbols';
import { DREAMS, normalizeDream, sortDreams } from '../../lib/craft/hedge/dreams';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../lib/craft/store';
import { DREAM_ROUTES } from '../../lib/grimoire/dreams';
import { useGrimoire } from '../../lib/grimoire/store';
import { holidayChoice } from '../../lib/holidays';
import {
  ANCESTOR_TOPICS,
  blankEntry,
  checkOnChoices,
  choiceLabel,
  deityChoices,
  deityLog,
  DEVOTION_ACTS,
  entriesAbout,
  entriesFor,
  entryMoonDisc,
  entryTitle,
  fieldsFor,
  framesFor,
  groupEntries,
  isJournalKind,
  journalDef,
  journalMoon,
  journalPlace,
  journalRoutes,
  JOURNALS,
  matchingNames,
  momentOf,
  moonSeasonOn,
  notReadyWords,
  OFFERING_TYPES,
  OMEN_KINDS,
  omensToCheck,
  OUTCOMES,
  outcomeCounts,
  PROMPTS,
  promptById,
  promptOfDay,
  readyToKeep,
  RESPONSES,
  searchEntries,
  SHADOW_NOTE,
  SHADOW_SOURCE,
  shelfLine,
  sortEntries,
  tagCounts,
  withLink,
  withoutLink,
  withTag,
  withTags,
  type JournalEntryData,
  type JournalKind,
  type OmenOutcome,
} from '../../lib/journals/journals';
import { JOURNEY_CATALOG } from '../../lib/journeys/catalog';
import { journeyForDeityRefIn } from '../../lib/journeys/lookup';
import { journeyStatus, normalizeProgress, PROGRESS_COLLECTION, progressFor, type JourneyProgress } from '../../lib/journeys/progress';
import { grimoireLibraryHref, ritualsLibraryHref } from '../../lib/library';
import { traditionalEntries } from '../../lib/library/model';
import { usePlace } from '../../lib/location';
import { myDeities } from '../../lib/patron/mine';
import { dateFromKey, localDateKey } from '../../lib/rituals/lifecycle';
import { useSession } from '../../lib/session';
import { useMySettings } from '../../lib/settings/store';
import { type } from '../../theme';
import { Button } from '../Button';
import { MoonDisc } from '../MoonDisc';
import { Body, Card, Chip, Chips, confirmAction, Field, List, Notice, Row, SectionLabel, tell, Title, ui } from '../rituals/ui';
import { SupportLink } from '../SupportLink';
import { EntryList, EntryRow, journalStyles as s, JournalShell, Part, PlaceChooser, useJournal, usePeople, useTabPlace } from './shared';

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/** The kind from the route, or null. */
export function useKind(): JournalKind | null {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  return isJournalKind(kind) ? kind : null;
}

function NoSuchJournal() {
  return (
    <JournalShell>
      <Title>Journals</Title>
      <Body>That journal couldn’t be found.</Body>
      <Button label="All journals" variant="outline" onPress={() => router.replace('/grimoire/journals' as Href)} />
    </JournalShell>
  );
}

const libraryDeities = () =>
  traditionalEntries()
    .filter((e) => e.type === 'deity')
    .map((e) => ({ id: e.id, key: e.id.split(':').pop() ?? '', name: e.name, pantheon: String(e.traditional?.Pantheon ?? '') }))
    .sort((a, b) => a.name.localeCompare(b.name));

// ---------------------------------------------------------------------------
// The hub

export function JournalsHubScreen() {
  const tab = useTabPlace();
  return (
    <JournalShell back={tab === 'journal' ? '/rituals/journal' : '/grimoire'}>
      <Title eyebrow="Your practice">Journals</Title>
      <Body muted>Four journals for the inner work of the craft. Each is private to you, kept with your account, and can be a section of your Grimoire or a journal of its own.</Body>
      {JOURNALS.map((j) => (
        <HubCard key={j.kind} kind={j.kind} />
      ))}
      <List>
        <Row icon="grimoire" title="Dreams" detail="Your dream journal, in the Grimoire" onPress={() => router.push(DREAM_ROUTES.journal as Href)} />
        <Row icon="rituals" title="Ritual journal" detail="Every ritual you’ve kept, and what worked" onPress={() => router.push('/rituals/journal' as Href)} />
        <Row icon="today" title="Your moon" detail="Patterns in your practice" last onPress={() => router.push('/rituals/journal/insights' as Href)} />
      </List>
      <SupportLink />
    </JournalShell>
  );
}

function HubCard({ kind }: { kind: JournalKind }) {
  const { def, list } = useJournal(kind);
  const { names } = usePeople();
  const { settings } = useMySettings();
  const home = journalRoutes(kind, journalPlace(settings, kind));
  return (
    <Card>
      <Text style={type.cardTitle}>{def.title}</Text>
      <Body muted>{shelfLine(kind, list, { people: names })}</Body>
      <View style={ui.actions}>
        <Button label={list.length ? 'Open' : 'Begin'} variant="outline" onPress={() => router.push(home.list as Href)} />
        <Button label={def.write} variant="text" onPress={() => router.push(home.write() as Href)} />
      </View>
      <PlaceChooserCompact kind={kind} />
    </Card>
  );
}

function PlaceChooserCompact({ kind }: { kind: JournalKind }) {
  const { settings } = useMySettings();
  return <Text style={type.caption}>{journalPlace(settings, kind) === 'grimoire' ? 'Kept in your Grimoire' : 'Kept as its own journal, under Rituals → Journal'}</Text>;
}

// ---------------------------------------------------------------------------
// A journal

export function JournalListScreen() {
  const kind = useKind();
  return kind ? <JournalList key={kind} kind={kind} /> : <NoSuchJournal />;
}

function JournalList({ kind }: { kind: JournalKind }) {
  const params = useLocalSearchParams<{ q?: string; tag?: string; deity?: string; person?: string }>();
  const { session } = useSession();
  const { def, list, ready, routes, tab } = useJournal(kind);
  const { people, names } = usePeople();
  const { settings } = useMySettings();
  const [query, setQuery] = useState(str(params.q));
  const [tag, setTag] = useState(str(params.tag));
  const [deity, setDeity] = useState(str(params.deity));
  const [person, setPerson] = useState(str(params.person));
  const now = useMemo(() => new Date(), []);

  const shown = useMemo(() => {
    let out = searchEntries(kind, list, query, { people: names });
    if (tag) out = withTag(out, tag);
    if (deity) out = out.filter((e) => (e.data.deityKey || `name:${e.data.deityName.toLowerCase()}`) === deity);
    if (person) out = entriesAbout(out, person);
    return out;
  }, [kind, list, query, tag, deity, person, names]);
  const groups = useMemo(() => groupEntries(shown), [shown]);
  const tags = useMemo(() => tagCounts(list).slice(0, 16), [list]);
  const prompt = promptOfDay(kind, now);
  const due = kind === 'omens' ? omensToCheck(list, now) : [];

  return (
    <JournalShell kind={kind} back={tab === 'journal' ? '/rituals/journal' : '/grimoire'}>
      <Title eyebrow={`${list.length} ${list.length === 1 ? def.noun : def.nouns}`}>{def.title}</Title>
      <Body muted>{def.intro}</Body>
      {kind === 'shadow' && (
        <Card>
          <Body>{SHADOW_NOTE}</Body>
          <SupportLink label="Support and crisis lines" />
        </Card>
      )}
      <Button label={def.write} onPress={() => router.push(routes.write() as Href)} />
      <Card accent>
        <SectionLabel>A prompt, if you want one</SectionLabel>
        <Body>{prompt.text}</Body>
        <Button label="Write to this prompt" variant="outline" onPress={() => router.push(routes.write({ prompt: prompt.id }) as Href)} />
      </Card>

      {due.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Did it come to pass?</SectionLabel>
          <EntryList>
            {due.map((e, i) => (
              <EntryRow key={e.id} kind={kind} entry={e} last={i === due.length - 1} href={routes.entry(e.id)} />
            ))}
          </EntryList>
        </View>
      )}

      {kind === 'devotion' && <DeityFilter list={list} value={deity} onChange={setDeity} />}
      {kind === 'ancestors' && <PeoplePart people={people} list={list} value={person} onChange={setPerson} />}
      {kind === 'ancestors' && <AncestorDays now={now} />}
      {kind === 'omens' && list.some((e) => e.data.outcome !== 'waiting') && (
        <Body muted>{`Looked back on: ${outcomeCounts(list).filter((o) => o.value !== 'waiting').map((o) => `${o.label.toLowerCase()} ${o.count}`).join(' · ')}`}</Body>
      )}

      {!ready && !list.length ? (
        <Body muted>Opening…</Body>
      ) : list.length === 0 ? (
        <Card>
          <Body>{def.empty}</Body>
        </Card>
      ) : (
        <>
          <Field label={`Search your ${def.title.toLowerCase()} journal`} value={query} onChange={setQuery} placeholder={def.search} />
          {tags.length > 0 && (
            <Chips>
              {tags.map((t) => (
                <Chip key={t.tag} label={`${t.tag} · ${t.count}`} selected={tag === t.tag} onPress={() => setTag(tag === t.tag ? '' : t.tag)} a11yLabel={`Only entries tagged ${t.tag}`} />
              ))}
            </Chips>
          )}
          {groups.length === 0 && <Text style={type.caption}>Nothing matches that.</Text>}
          {groups.map((g) => (
            <View key={g.month} style={ui.gapSmall}>
              <Text style={type.caption}>{g.month}</Text>
              <EntryList>
                {g.entries.map((e, i) => (
                  <EntryRow key={e.id} kind={kind} entry={e} names={names} last={i === g.entries.length - 1} href={routes.entry(e.id)} />
                ))}
              </EntryList>
            </View>
          ))}
        </>
      )}

      <JournalLinks kind={kind} />
      <PlaceChooser kind={kind} />
      {!session && <Notice>Kept on this phone. Sign in to keep this journal with your account and on the website.</Notice>}
      {settings && <SupportLink />}
    </JournalShell>
  );
}

function DeityFilter({ list, value, onChange }: { list: { data: JournalEntryData }[]; value: string; onChange: (v: string) => void }) {
  const log = deityLog(list as never);
  if (!log.length) return null;
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>By god or spirit</SectionLabel>
      <Chips>
        {log.map((d) => {
          const id = d.key || `name:${d.name.toLowerCase()}`;
          return <Chip key={id} label={`${d.name} · ${d.count}`} selected={value === id} onPress={() => onChange(value === id ? '' : id)} a11yLabel={`Only ${d.name}`} />;
        })}
      </Chips>
    </View>
  );
}

function usePhotos() {
  const { altars } = useAltars();
  return (id: string) => framesFor(altars as never, id)[0] ?? null;
}

function PeoplePart({ people, list, value, onChange }: { people: ReturnType<typeof usePeople>['people']; list: { data: JournalEntryData }[]; value: string; onChange: (v: string) => void }) {
  const photoOf = usePhotos();
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>Your people</SectionLabel>
      {people.length === 0 ? (
        <Body muted>The people you remember are kept in Hedge → Ancestors, with their dates and places. Add someone, then write about them here.</Body>
      ) : (
        <Chips>
          {people.map((p) => (
            <Chip
              key={p.id}
              label={`${p.data.name || 'Unnamed'} · ${list.filter((e) => e.data.people.includes(p.id)).length}`}
              selected={value === p.id}
              onPress={() => onChange(value === p.id ? '' : p.id)}
              a11yLabel={`Only entries about ${p.data.name}`}
            />
          ))}
        </Chips>
      )}
      {!!value && <PersonCard id={value} people={people} photo={photoOf(value)} />}
      <Button label="Add someone" variant="text" onPress={() => router.push('/rituals/craft/hedge/ancestors/edit' as Href)} />
    </View>
  );
}

function PersonCard({ id, people, photo }: { id: string; people: ReturnType<typeof usePeople>['people']; photo: { photo: string; aged: boolean } | null }) {
  const p = people.find((x) => x.id === id);
  if (!p) return null;
  const born = formatPartial(p.data.born);
  const died = formatPartial(p.data.died);
  return (
    <Card>
      <View style={s.people}>
        {!!photo && <Image source={{ uri: photo.photo }} style={[s.photo, photo.aged ? { opacity: 0.85 } : null]} resizeMode="cover" accessibilityLabel={`A photo of ${p.data.name}, from your altar`} />}
        <View style={s.grow}>
          <Text style={type.cardTitle}>{p.data.name}</Text>
          <Body muted>{[p.data.relation, born ? `born ${born}${p.data.bornPlace ? `, ${p.data.bornPlace}` : ''}` : p.data.bornPlace ? `born in ${p.data.bornPlace}` : null, died ? `died ${died}${p.data.diedPlace ? `, ${p.data.diedPlace}` : ''}` : p.data.diedPlace ? `rests in ${p.data.diedPlace}` : null].filter(Boolean).join(' · ')}</Body>
        </View>
      </View>
      <Button label="Their page in Hedge" variant="text" onPress={() => router.push(`/rituals/craft/hedge/ancestors/${id}` as Href)} />
    </Card>
  );
}

function AncestorDays({ now }: { now: Date }) {
  const { settings } = useMySettings();
  const { people } = usePeople();
  const days = useMemo(() => ancestorDays(holidayChoice(settings), now, 30), [settings, now]);
  const anniversaries = useMemo(() => upcomingAnniversaries(people, now, 30), [people, now]);
  if (!days.length && !anniversaries.length) return null;
  return (
    <Card>
      <SectionLabel>In the next 30 days</SectionLabel>
      {anniversaries.map((a) => (
        <Body key={`${a.id}-${a.kind}`}>{`${a.name}: ${a.kind === 'birth' ? 'their birthday' : 'the day they died'}, ${relativeDay(now, a.date)}`}</Body>
      ))}
      {days.map((d) => (
        <Body key={d.name}>{`${d.name}, ${relativeDay(now, d.date)}`}</Body>
      ))}
    </Card>
  );
}

/** Where each journal reaches out to: the rest of the practice it belongs with. */
function JournalLinks({ kind }: { kind: JournalKind }) {
  const rows: { title: string; detail: string; href: string; icon?: 'today' | 'altar' | 'samhain' | 'calendar' | 'rituals' | 'wheel' | 'grimoire' }[] =
    kind === 'shadow'
      ? [
          { title: 'Cycle & Moon', detail: 'Your inner seasons beside the moon’s', href: '/rituals/cycle', icon: 'today' },
          { title: 'The dark moon', detail: 'What the dark of the moon is for', href: '/grimoire/holy/moon-dark', icon: 'wheel' },
          { title: 'Dreams', detail: 'What your dreams have been showing you', href: DREAM_ROUTES.journal, icon: 'grimoire' },
        ]
      : kind === 'devotion'
        ? [
            { title: 'My deities', detail: 'The gods you explore, are dedicated to, or keep as patron', href: '/more/settings/deities', icon: 'rituals' },
            { title: 'Dedication journeys', detail: 'Study, practice and a rite of dedication', href: '/rituals/journeys', icon: 'rituals' },
            { title: 'Your altars', detail: 'Set out an offering from the cabinet’s Offerings drawer', href: '/altar', icon: 'altar' },
          ]
        : kind === 'ancestors'
          ? [
              { title: 'Ancestors in Hedge', detail: 'Your people, their dates and places, and a candle for each', href: '/rituals/craft/hedge/ancestors', icon: 'samhain' },
              { title: 'Ancestor Altar & Candle Evening', detail: 'A longer evening with all your dead', href: '/rituals/premade/hedge-ancestor-candle-evening', icon: 'rituals' },
              { title: 'Samhain', detail: 'The old festival of the dead', href: '/grimoire/holy/wheel-samhain', icon: 'samhain' },
              { title: 'Hekate’s Deipnon', detail: 'The meal for Hekate and the restless dead at the month’s end', href: '/grimoire/holy/hellenic_monthly-deipnon', icon: 'wheel' },
              { title: 'Your altars', detail: 'An ancestor frame with their photo, a candle, an offering', href: '/altar', icon: 'altar' },
            ]
          : [
              { title: 'Planetary hours', detail: 'Which planet rules the hour now', href: '/rituals/craft/cosmic/hours', icon: 'wheel' },
              { title: 'Dream symbols', detail: 'Common associations, as starting points', href: DREAM_ROUTES.patterns, icon: 'grimoire' },
              { title: 'Local lore', detail: 'What’s said of the creatures and places near you', href: '/rituals/craft/folk/lore', icon: 'samhain' },
            ];
  return (
    <List>
      {rows.map((r, i) => (
        <Row key={r.href} icon={r.icon} title={r.title} detail={r.detail} last={i === rows.length - 1} onPress={() => router.push(r.href as Href)} />
      ))}
    </List>
  );
}

// ---------------------------------------------------------------------------
// An entry

export function JournalEntryScreen() {
  const kind = useKind();
  return kind ? <EntryPage key={kind} kind={kind} /> : <NoSuchJournal />;
}

function EntryPage({ kind }: { kind: JournalKind }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { def, list, ready, routes, tab } = useJournal(kind);
  const { people, names } = usePeople();
  const { settings } = useMySettings();
  const photoOf = usePhotos();
  const { entries: progressRows } = useCraft<JourneyProgress>(PROGRESS_COLLECTION);
  const entry = list.find((e) => e.id === id) ?? null;
  const [busy, setBusy] = useState(false);

  if (!entry) {
    return (
      <JournalShell kind={kind}>
        <Body>{ready ? 'This entry couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </JournalShell>
    );
  }
  const d = entry.data;
  const moonAt = journalMoon(d.date, d.time);
  const disc = entryMoonDisc(d);
  const prompt = d.prompt ? promptById(kind, d.prompt) : null;
  const libraryHref = (entryId: string) => (tab === 'journal' ? ritualsLibraryHref({ id: entryId }) : grimoireLibraryHref({ id: entryId }));
  const journey = kind === 'devotion' && d.deityKey ? journeyForDeityRefIn(JOURNEY_CATALOG, `traditional/deity/${d.deityKey}`) : null;
  const progress = journey ? progressFor(progressRows, journey.id) : null;
  const status = progress ? journeyStatus(normalizeProgress({ ...progress.data, journeyId: journey!.id })) : null;
  const mine = myDeities(settings).find((m) => (d.deityKey ? m.key === d.deityKey : m.name.toLowerCase() === d.deityName.toLowerCase()));
  const startPoints =
    kind === 'omens'
      ? {
          symbols: matchingNames(`${d.what} ${d.meaning}`, DREAM_SYMBOLS, (x) => [x.symbol, ...x.also]),
          library: matchingNames(`${d.what} ${d.meaning}`, traditionalEntries(), (x) => [x.name]),
        }
      : null;

  const setOutcome = async (outcome: OmenOutcome) => {
    setBusy(true);
    try {
      await updateEntry(def.collection, entry.id, { ...d, outcome });
    } finally {
      setBusy(false);
    }
  };

  return (
    <JournalShell kind={kind} right={<Button label="Edit" variant="pill" onPress={() => router.push(routes.edit(entry.id) as Href)} />}>
      <View style={s.paper}>
        <Text style={type.eyebrow}>{def.title}</Text>
        <Text accessibilityRole="header" style={s.title}>
          {entryTitle(kind, d, { people: names })}
        </Text>
        <Text style={s.soft}>{[fullDate(d.date) ?? d.date, d.time || null].filter(Boolean).join(' · ')}</Text>

        <View style={s.moon} accessible accessibilityLabel={`The moon then: ${moonAt.moonPhase} in ${moonAt.moonSign}.`}>
          <MoonDisc size={48} illumination={disc.illumination} waxing={disc.waxing} halo={false} />
          <View style={s.grow}>
            <Text style={type.cardTitle}>{`${d.moonPhase} in ${d.moonSign}`}</Text>
            <Text style={type.caption}>{kind === 'shadow' ? `The moon’s season: ${moonSeasonOn(d.date)}` : d.hour ? `In the planetary hour of ${d.hour}` : 'The moon then'}</Text>
          </View>
        </View>

        {!!prompt && <Text style={s.soft}>{prompt.text}</Text>}

        {kind === 'devotion' && (
          <Part label={d.deityName || 'A god or spirit'}>
            <Text style={s.soft}>{[mine ? (mine.level === 'patron' ? 'Your patron' : mine.level === 'dedicated' ? 'Dedicated' : 'Exploring') : null, d.acts.map((a) => choiceLabel(DEVOTION_ACTS, a)).join(', ') || null].filter(Boolean).join(' · ')}</Text>
            {d.offerings.length > 0 && <Text style={s.body}>{`Offered: ${d.offerings.join(', ')}`}</Text>}
            {!!d.response && <Text style={s.body}>{`Response: ${d.response}`}</Text>}
          </Part>
        )}
        {kind === 'ancestors' && (
          <Part label={choiceLabel(ANCESTOR_TOPICS, d.about) || 'Ancestors'}>
            {d.people.length > 0 && (
              <View style={s.people}>
                {d.people.map((pid) => {
                  const photo = photoOf(pid);
                  return (
                    <View key={pid} style={ui.gapSmall}>
                      {!!photo && <Image source={{ uri: photo.photo }} style={s.photo} resizeMode="cover" accessibilityLabel={`A photo of ${names[pid] ?? 'them'}, from your altar`} />}
                      <Button label={names[pid] ?? 'Someone removed'} variant="text" onPress={() => router.push(`/rituals/craft/hedge/ancestors/${pid}` as Href)} />
                      {people.find((p) => p.id === pid) && <Text style={type.caption}>{lifespan(people.find((p) => p.id === pid)!.data)}</Text>}
                    </View>
                  );
                })}
              </View>
            )}
          </Part>
        )}
        {kind === 'omens' && <Text style={s.soft}>{[choiceLabel(OMEN_KINDS, d.seen), d.where || null].filter(Boolean).join(' · ')}</Text>}

        {fieldsFor(kind, d)
          .filter((f) => f.key !== 'where' || kind !== 'omens')
          .map((f) => {
            const value = d[f.key];
            return typeof value === 'string' && value ? (
              <Part key={f.key} label={f.label}>
                <Text style={s.body}>{value}</Text>
              </Part>
            ) : null;
          })}

        {d.tags.length > 0 && (
          <Chips>
            {d.tags.map((t) => (
              <Chip key={t} label={t} onPress={() => router.push(`${routes.list}?tag=${encodeURIComponent(t)}` as Href)} a11yLabel={`Entries tagged ${t}`} />
            ))}
          </Chips>
        )}
      </View>

      {kind === 'omens' && (
        <Card>
          <SectionLabel>Did it come to pass?</SectionLabel>
          {!!d.checkOn && d.outcome === 'waiting' && <Body muted>{`You asked to look back on ${fullDate(d.checkOn) ?? d.checkOn}.`}</Body>}
          <Chips>
            {OUTCOMES.map((o) => (
              <Chip key={o.value} label={o.label} selected={d.outcome === o.value} onPress={busy ? undefined : () => void setOutcome(o.value)} />
            ))}
          </Chips>
          {!!d.outcomeNote && <Body>{d.outcomeNote}</Body>}
        </Card>
      )}

      {startPoints && (startPoints.symbols.length > 0 || startPoints.library.length > 0) && (
        <View style={ui.gapSmall}>
          <SectionLabel>Places to start</SectionLabel>
          {startPoints.symbols.map((x) => (
            <Card key={x.symbol}>
              <Text style={type.cardTitle}>{x.symbol}</Text>
              <Body>{x.notes}</Body>
              <Body muted>{x.ask}</Body>
            </Card>
          ))}
          {startPoints.library.length > 0 && (
            <List>
              {startPoints.library.map((x, i) => (
                <Row key={x.id} icon="grimoire" title={x.name} detail={`In the Living Library · ${x.category}`} last={i === startPoints.library.length - 1} onPress={() => router.push(libraryHref(x.id))} />
              ))}
            </List>
          )}
          <Body muted>Your own sense of it matters most: what does it mean to you?</Body>
        </View>
      )}

      {kind === 'devotion' && (
        <List>
          {!!d.deityKey && (
            <Row icon="grimoire" title={`${d.deityName} in the Living Library`} detail="Who they are, their symbols and offerings" onPress={() => router.push(libraryHref(`traditional:deity:${d.deityKey}`))} />
          )}
          {journey && (
            <Row
              icon="rituals"
              title={journey.title}
              detail={status ? (status === 'dedicated' ? 'Dedicated · see your journey' : status === 'paused' ? 'Paused · pick it up when you’re ready' : status === 'stopped' ? 'Set down' : 'Under way · see where you are') : 'A dedication journey: study, practice and a rite'}
              onPress={() => router.push({ pathname: '/rituals/journeys/[id]', params: { id: journey.id } })}
            />
          )}
          <Row icon="rituals" title={`Everything with ${d.deityName}`} detail="This god or spirit’s log" onPress={() => router.push(`${routes.list}?deity=${encodeURIComponent(d.deityKey || `name:${d.deityName.toLowerCase()}`)}` as Href)} />
          <Row icon="altar" title="Your altars" detail="Set out an offering from the Offerings drawer" last onPress={() => router.push('/altar' as Href)} />
        </List>
      )}

      {d.links.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Linked</SectionLabel>
          <List>
            {d.links.map((l, i) => (
              <Row
                key={`${l.type}-${l.id}`}
                icon="grimoire"
                title={l.title || 'Untitled'}
                detail={l.type === 'page' ? 'Grimoire page' : l.type === 'dream' ? 'Dream' : journalDef(l.kind ?? kind).title}
                last={i === d.links.length - 1}
                onPress={() =>
                  router.push(
                    (l.type === 'page' ? `/grimoire/${l.id}` : l.type === 'dream' ? DREAM_ROUTES.dream(l.id) : journalRoutes(l.kind ?? kind, tab).entry(l.id)) as Href,
                  )
                }
              />
            ))}
          </List>
        </View>
      )}
      {kind === 'shadow' && (
        <List>
          <Row icon="today" title="Cycle & Moon" detail="Your own cycle that day, beside the moon’s season" last onPress={() => router.push('/rituals/cycle/history' as Href)} />
        </List>
      )}
      <SupportLink />
    </JournalShell>
  );
}

// ---------------------------------------------------------------------------
// The form

export function JournalEditScreen() {
  const kind = useKind();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { list, ready } = useJournal(kind ?? 'shadow');
  if (!kind) return <NoSuchJournal />;
  const existing = id ? list.find((e) => e.id === id) ?? null : null;
  if (id && !existing) {
    return (
      <JournalShell kind={kind}>
        <Body>{ready ? 'This entry couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </JournalShell>
    );
  }
  // Keyed by the entry, so the form starts from its saved copy and typing is never overwritten.
  return <EntryForm key={`${kind}-${existing?.id ?? 'new'}`} kind={kind} existingId={existing?.id ?? null} start={existing?.data ?? null} />;
}

function EntryForm({ kind, existingId, start }: { kind: JournalKind; existingId: string | null; start: JournalEntryData | null }) {
  const params = useLocalSearchParams<{ prompt?: string; deity?: string; deityName?: string; person?: string; page?: string; pageTitle?: string; dream?: string; dreamTitle?: string; about?: string; seen?: string; what?: string }>();
  const { session } = useSession();
  const { def, list, routes } = useJournal(kind);
  const { people } = usePeople();
  const { settings } = useMySettings();
  const { snapshot } = useGrimoire();
  const { entries: dreamRows } = useCraft<unknown>(DREAMS);
  const place = usePlace();
  const deities = useMemo(() => libraryDeities(), []);
  const choices = useMemo(() => deityChoices(myDeities(settings), deities), [settings, deities]);

  const [entry, setEntry] = useState<JournalEntryData>(() => {
    if (start) return start;
    const now = new Date();
    const extra: Partial<JournalEntryData> = {};
    if (params.prompt && promptById(kind, params.prompt)) extra.prompt = params.prompt;
    if (params.deity) {
      const found = choices.find((c) => c.key === params.deity);
      extra.deityKey = params.deity;
      extra.deityName = found?.name ?? str(params.deityName);
    } else if (params.deityName) extra.deityName = params.deityName;
    if (params.person) extra.people = [params.person];
    if (params.about && ANCESTOR_TOPICS.some((t) => t.id === params.about)) extra.about = params.about;
    if (params.seen && OMEN_KINDS.some((t) => t.id === params.seen)) extra.seen = params.seen;
    if (params.what) extra.what = params.what;
    const links = [];
    if (params.page) links.push({ type: 'page' as const, id: params.page, title: str(params.pageTitle) });
    if (params.dream) links.push({ type: 'dream' as const, id: params.dream, title: str(params.dreamTitle) });
    if (links.length) extra.links = links;
    if (kind === 'omens') extra.checkOn = checkOnChoices(localDateKey(now))[1].value;
    return blankEntry(kind, now, extra);
  });
  const [tagText, setTagText] = useState('');
  const [typedDate, setTypedDate] = useState('');
  const [deityQuery, setDeityQuery] = useState('');
  const [pageQuery, setPageQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);

  const set = (patch: Partial<JournalEntryData>) => setEntry((e) => ({ ...e, ...patch }));
  const setWhen = (date: string, time: string) => set({ date, time, ...journalMoon(date, time) });
  const toggle = (key: 'acts' | 'offerings' | 'people', value: string) =>
    setEntry((e) => ({ ...e, [key]: e[key].includes(value) ? e[key].filter((x) => x !== value) : [...e[key], value] }));

  const now = new Date();
  const recent = Array.from({ length: 7 }, (_, i) => localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)));
  const knownTags = tagCounts(list)
    .map((t) => t.tag)
    .filter((t) => !entry.tags.includes(t))
    .slice(0, 12);
  const prompt = entry.prompt ? promptById(kind, entry.prompt) : null;
  const q = deityQuery.trim().toLowerCase();
  const deityMatches = q ? choices.filter((c) => c.name.toLowerCase().includes(q) || c.note.toLowerCase().includes(q)).slice(0, 8) : choices.filter((c) => c.note && ['Your patron', 'Dedicated', 'Exploring'].includes(c.note)).slice(0, 8);
  const pq = pageQuery.trim().toLowerCase();
  const pageMatches = pq && snapshot ? snapshot.pages.filter((p) => (p.title || '').toLowerCase().includes(pq)).slice(0, 6) : [];
  const dreams = useMemo(() => sortDreams(dreamRows.map((e) => ({ id: e.id, createdAt: e.createdAt, data: normalizeDream(e.data) }))).slice(0, 5), [dreamRows]);

  const save = async () => {
    const hour = kind === 'omens' && place ? (currentHour(momentOf(entry.date, entry.time), place)?.planet ?? '') : entry.hour;
    const data = readyToKeep(kind, { ...entry, hour, tags: withTags(entry.tags, tagText) });
    if (!data) {
      tell('Nothing to keep yet', notReadyWords(kind, entry));
      return;
    }
    setSaving(true);
    try {
      if (existingId) {
        await updateEntry(def.collection, existingId, data);
        router.back();
      } else {
        const added = await addEntry(def.collection, data);
        router.replace(routes.entry(added.id) as Href);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existingId) return;
    if (!(await confirmAction('Delete this entry?', 'It will be removed from your journal on every device.', 'Delete'))) return;
    await removeEntry(def.collection, existingId);
    router.replace(routes.list as Href);
  };

  return (
    <JournalShell kind={kind}>
      <Title eyebrow={existingId ? 'Edit' : def.eyebrow}>{existingId ? 'Your entry' : def.write}</Title>
      {kind === 'shadow' && !existingId && <Body muted>{SHADOW_NOTE}</Body>}

      <View style={ui.gapSmall}>
        <SectionLabel>Prompt</SectionLabel>
        <Body>{prompt ? prompt.text : 'No prompt: write whatever is with you.'}</Body>
        <Chips>
          {!prompt && <Chip label="Today’s prompt" onPress={() => set({ prompt: promptOfDay(kind, now).id })} />}
          <Chip label={showPrompts ? 'Hide prompts' : 'Choose a prompt'} onPress={() => setShowPrompts(!showPrompts)} />
          {!!prompt && <Chip label="No prompt" onPress={() => set({ prompt: '' })} />}
        </Chips>
        {showPrompts &&
          PROMPTS[kind].map((p) => (
            <Chip
              key={p.id}
              label={`${p.group}: ${p.text}`}
              selected={entry.prompt === p.id}
              onPress={() => {
                set({ prompt: p.id });
                setShowPrompts(false);
              }}
            />
          ))}
      </View>

      {kind === 'devotion' && (
        <View style={ui.gapSmall}>
          <SectionLabel>{entry.deityName ? `For ${entry.deityName}` : 'Which god or spirit?'}</SectionLabel>
          <Field label="Find a deity, or name one in your own words" value={deityQuery} onChange={setDeityQuery} placeholder="Hekate, Brigid, the spirit of the river" />
          <Chips>
            {deityMatches.map((c) => (
              <Chip key={`${c.key}-${c.name}`} label={c.note ? `${c.name} · ${c.note}` : c.name} selected={entry.deityName === c.name} onPress={() => set({ deityKey: c.key, deityName: c.name })} />
            ))}
            {!!deityQuery.trim() && !choices.some((c) => c.name.toLowerCase() === q) && (
              <Chip label={`“${deityQuery.trim()}”, in my own words`} selected={entry.deityName === deityQuery.trim()} onPress={() => set({ deityKey: '', deityName: deityQuery.trim() })} />
            )}
          </Chips>
          <SectionLabel>What it was</SectionLabel>
          <Chips>
            {DEVOTION_ACTS.map((a) => (
              <Chip key={a.id} label={a.label} hint={a.hint} selected={entry.acts.includes(a.id)} onPress={() => toggle('acts', a.id)} />
            ))}
          </Chips>
          {entry.acts.includes('offering') && (
            <>
              <SectionLabel>Offerings</SectionLabel>
              <Chips>
                {OFFERING_TYPES.map((o) => (
                  <Chip key={o} label={o} selected={entry.offerings.includes(o)} onPress={() => toggle('offerings', o)} />
                ))}
              </Chips>
            </>
          )}
          {(entry.acts.includes('offering') || entry.acts.includes('sign')) && (
            <>
              <SectionLabel>How it was received</SectionLabel>
              <Chips>
                {RESPONSES.map((r) => (
                  <Chip key={r} label={r} selected={entry.response === r} onPress={() => set({ response: entry.response === r ? '' : r })} />
                ))}
              </Chips>
            </>
          )}
        </View>
      )}

      {kind === 'ancestors' && (
        <View style={ui.gapSmall}>
          <SectionLabel>What it’s about</SectionLabel>
          <Chips>
            {ANCESTOR_TOPICS.map((t) => (
              <Chip key={t.id} label={t.label} hint={t.hint} selected={entry.about === t.id} onPress={() => set({ about: t.id })} />
            ))}
          </Chips>
          <SectionLabel>Who</SectionLabel>
          {people.length ? (
            <Chips>
              {people.map((p) => (
                <Chip key={p.id} label={p.data.name || 'Unnamed'} selected={entry.people.includes(p.id)} onPress={() => toggle('people', p.id)} />
              ))}
            </Chips>
          ) : (
            <Body muted>Nobody added yet. Your people are kept in Hedge → Ancestors.</Body>
          )}
          <Button label="Add someone" variant="text" onPress={() => router.push('/rituals/craft/hedge/ancestors/edit' as Href)} />
        </View>
      )}

      {kind === 'omens' && (
        <View style={ui.gapSmall}>
          <SectionLabel>What kind of sign</SectionLabel>
          <Chips>
            {OMEN_KINDS.map((t) => (
              <Chip key={t.id} label={t.label} hint={t.hint} selected={entry.seen === t.id} onPress={() => set({ seen: t.id })} />
            ))}
          </Chips>
        </View>
      )}

      <View style={ui.gap}>
        {fieldsFor(kind, entry).map((f) => (
          <Field key={f.key} label={f.label} value={String(entry[f.key] ?? '')} onChange={(v) => set({ [f.key]: v } as Partial<JournalEntryData>)} placeholder={f.placeholder} multiline={f.multiline} />
        ))}
        <Field label="Title (optional)" value={entry.title} onChange={(title) => set({ title })} placeholder="A few words to find it by" />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>When</SectionLabel>
        <Chips>
          {recent.map((key, i) => (
            <Chip key={key} label={i === 0 ? 'Today' : i === 1 ? 'Yesterday' : (fullDate(key)?.replace(/, \d{4}$/, '') ?? key)} selected={entry.date === key} onPress={() => setWhen(key, entry.time)} />
          ))}
          {!recent.includes(entry.date) && <Chip label={fullDate(entry.date) ?? entry.date} selected />}
        </Chips>
        <Field
          label="Or another date (YYYY-MM-DD)"
          value={typedDate}
          onChange={(v) => {
            setTypedDate(v);
            if (dateFromKey(v.trim())) setWhen(v.trim(), entry.time);
          }}
          placeholder="2026-03-14"
        />
        <Field label="Time (HH:MM, optional)" value={entry.time} onChange={(v) => setWhen(entry.date, /^\d{1,2}:\d{2}$/.test(v.trim()) ? v.trim() : v)} placeholder="21:30" />
        <Body muted>{`The moon then: ${entry.moonPhase}, in ${entry.moonSign}.${kind === 'shadow' ? ` Its season: ${moonSeasonOn(entry.date)}.` : ''}${kind === 'omens' ? (place ? ' The planetary hour is worked out from your place when you keep it.' : ' Set your place on The sky today to have the planetary hour noted too.') : ''}`}</Body>
      </View>

      {kind === 'omens' && (
        <View style={ui.gapSmall}>
          <SectionLabel>Look back</SectionLabel>
          <Chips>
            {checkOnChoices(entry.date).map((c) => (
              <Chip key={c.label} label={c.label} selected={entry.checkOn === c.value} onPress={() => set({ checkOn: c.value })} />
            ))}
          </Chips>
          {!!existingId && (
            <>
              <SectionLabel>Did it come to pass?</SectionLabel>
              <Chips>
                {OUTCOMES.map((o) => (
                  <Chip key={o.value} label={o.label} selected={entry.outcome === o.value} onPress={() => set({ outcome: o.value })} />
                ))}
              </Chips>
              <Field label="What happened" value={entry.outcomeNote} onChange={(outcomeNote) => set({ outcomeNote })} placeholder="How it turned out, if it did" multiline />
            </>
          )}
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Tags</SectionLabel>
        {entry.tags.length > 0 && (
          <Chips>
            {entry.tags.map((t) => (
              <Chip key={t} label={`${t}  ×`} a11yLabel={`Remove ${t}`} onPress={() => set({ tags: entry.tags.filter((x) => x !== t) })} />
            ))}
          </Chips>
        )}
        <Field label="Add tags" value={tagText} onChange={setTagText} placeholder="grief, mother, protection (commas between)" />
        <Button
          label="Add"
          variant="outline"
          disabled={!tagText.trim()}
          onPress={() => {
            set({ tags: withTags(entry.tags, tagText) });
            setTagText('');
          }}
        />
        {knownTags.length > 0 && (
          <Chips>
            {knownTags.map((t) => (
              <Chip key={t} label={t} a11yLabel={`Add ${t}`} onPress={() => set({ tags: withTags(entry.tags, t) })} />
            ))}
          </Chips>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Link to your Grimoire</SectionLabel>
        {entry.links.length > 0 && (
          <Chips>
            {entry.links.map((l) => (
              <Chip key={`${l.type}-${l.id}`} label={`${l.title || 'Untitled'}  ×`} a11yLabel={`Unlink ${l.title}`} onPress={() => set({ links: withoutLink(entry.links, l) })} />
            ))}
          </Chips>
        )}
        {session ? (
          <>
            <Field label="Find a Grimoire page" value={pageQuery} onChange={setPageQuery} placeholder="A page title" />
            {pageMatches.length > 0 && (
              <Chips>
                {pageMatches.map((p) => (
                  <Chip
                    key={p.id}
                    label={p.title || 'Untitled page'}
                    onPress={() => {
                      set({ links: withLink(entry.links, { type: 'page', id: p.id, title: p.title || 'Untitled page' }) });
                      setPageQuery('');
                    }}
                  />
                ))}
              </Chips>
            )}
          </>
        ) : (
          <Body muted>Sign in to link Grimoire pages.</Body>
        )}
        {dreams.length > 0 && (
          <>
            <Body muted>Or a recent dream</Body>
            <Chips>
              {dreams.map((dr) => (
                <Chip key={dr.id} label={dr.data.title || 'Untitled dream'} selected={entry.links.some((l) => l.type === 'dream' && l.id === dr.id)} onPress={() => set({ links: entry.links.some((l) => l.type === 'dream' && l.id === dr.id) ? withoutLink(entry.links, { type: 'dream', id: dr.id }) : withLink(entry.links, { type: 'dream', id: dr.id, title: dr.data.title || 'Untitled dream' }) })} />
              ))}
            </Chips>
          </>
        )}
      </View>

      {!session && <Notice>Saved on this phone. Sign in to keep this journal with your account.</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Keeping it…' : existingId ? 'Save changes' : 'Keep this'} onPress={save} disabled={saving} />
        {!!existingId && <Button label="Delete this entry" variant="text" onPress={remove} />}
      </View>
      {kind === 'shadow' && <Body muted>{SHADOW_SOURCE}</Body>}
      <SupportLink />
    </JournalShell>
  );
}

// ---------------------------------------------------------------------------
// Pieces other screens use

/** A journal's shelf in the Grimoire: a line, the last few entries, and buttons. */
export function JournalShelfBody({ kind, query }: { kind: JournalKind; query: string }) {
  const { def, list, routes } = useJournal(kind);
  const { names } = usePeople();
  const searching = query.trim().length > 0;
  const shown = searching ? sortEntries(searchEntries(kind, list, query, { people: names })).slice(0, 8) : sortEntries(list).slice(0, 3);
  return (
    <>
      {!searching && <Text style={type.caption}>{shelfLine(kind, list, { people: names })}</Text>}
      {shown.length > 0 && (
        <EntryList>
          {shown.map((e, i) => (
            <EntryRow key={e.id} kind={kind} entry={e} names={names} last={i === shown.length - 1} href={routes.entry(e.id)} />
          ))}
        </EntryList>
      )}
      <View style={ui.actions}>
        {!searching && <Button label={def.write} variant="outline" onPress={() => router.push(routes.write() as Href)} />}
        <Button label={searching ? 'All that match' : 'Open the journal'} variant="outline" onPress={() => router.push((searching ? routes.search(query.trim()) : routes.list) as Href)} />
      </View>
    </>
  );
}

/** How many entries of a journal match a Grimoire search (to hide a shelf with none). */
export function useJournalMatches(kind: JournalKind, query: string) {
  const { list } = useJournal(kind);
  const { names } = usePeople();
  return { count: list.length, matches: query.trim() ? searchEntries(kind, list, query, { people: names }).length : list.length };
}

/** On a Grimoire page or a dream: the journal entries that link to it, and a way to write one that does. */
export function JournalBacklinks({ type: linkType, id, title }: { type: 'page' | 'dream'; id: string; title: string }) {
  const { settings } = useMySettings();
  const shadow = useJournal('shadow').list;
  const devotion = useJournal('devotion').list;
  const ancestors = useJournal('ancestors').list;
  const omens = useJournal('omens').list;
  const { names } = usePeople();
  const found = [
    ...shadow.map((e) => ({ kind: 'shadow' as const, e })),
    ...devotion.map((e) => ({ kind: 'devotion' as const, e })),
    ...ancestors.map((e) => ({ kind: 'ancestors' as const, e })),
    ...omens.map((e) => ({ kind: 'omens' as const, e })),
  ].filter(({ e }) => e.data.links.some((l) => l.type === linkType && l.id === id));
  const param = linkType === 'page' ? { page: id, pageTitle: title } : { dream: id, dreamTitle: title };
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>In your journals</SectionLabel>
      {found.length > 0 && (
        <List>
          {found.map(({ kind, e }, i) => (
            <Row
              key={e.id}
              icon="grimoire"
              title={entryTitle(kind, e.data, { people: names })}
              detail={`${journalDef(kind).title} · ${fullDate(e.data.date) ?? e.data.date}`}
              last={i === found.length - 1}
              onPress={() => router.push(journalRoutes(kind, journalPlace(settings, kind)).entry(e.id) as Href)}
            />
          ))}
        </List>
      )}
      <Chips>
        {JOURNALS.map((j) => (
          <Chip key={j.kind} label={`Write in ${j.title}`} onPress={() => router.push(journalRoutes(j.kind, journalPlace(settings, j.kind)).write(param) as Href)} />
        ))}
      </Chips>
    </View>
  );
}

/** For deity pages: this deity's entries in the deity journal, and a way to write. */
export function DeityJournalLink({ deityKey, name }: { deityKey: string; name: string }) {
  const { settings } = useMySettings();
  const { list } = useJournal('devotion');
  const mine = entriesFor(list, deityKey, name);
  const routes = journalRoutes('devotion', journalPlace(settings, 'devotion'));
  return (
    <List>
      <Row
        icon="rituals"
        title={mine.length ? `Your journal with ${name}` : `Keep a journal with ${name}`}
        detail={mine.length ? `${mine.length} ${mine.length === 1 ? 'entry' : 'entries'} · offerings, prayers and signs` : 'Offerings given, prayers, devotional acts and signs'}
        onPress={() => router.push((mine.length ? `${routes.list}?deity=${encodeURIComponent(deityKey)}` : routes.write({ deity: deityKey, deityName: name })) as Href)}
      />
      <Row icon="rituals" title="Write in your deity journal" detail={`An offering, a prayer or a sign from ${name}`} last onPress={() => router.push(routes.write({ deity: deityKey, deityName: name }) as Href)} />
    </List>
  );
}

/** For ancestor places (Hedge, the altar, Samhain): a link into the ancestor journal. */
export function AncestorJournalLink({ person, label }: { person?: string; label?: string }) {
  const { settings } = useMySettings();
  const { list } = useJournal('ancestors');
  const routes = journalRoutes('ancestors', journalPlace(settings, 'ancestors'));
  const about = person ? entriesAbout(list, person) : list;
  return (
    <List>
      <Row
        icon="samhain"
        title={label ?? 'Ancestor journal'}
        detail={about.length ? `${about.length} ${about.length === 1 ? 'entry' : 'entries'} · offerings, dreams, recipes and stories` : 'Offerings, dreams of them, family recipes and stories'}
        onPress={() => router.push((person ? `${routes.list}?person=${encodeURIComponent(person)}` : routes.list) as Href)}
      />
      <Row icon="samhain" title="Write in your ancestor journal" detail={person ? 'About them' : 'An offering, a dream, a recipe or a story'} last onPress={() => router.push(routes.write(person ? { person } : {}) as Href)} />
    </List>
  );
}

/** Their photo, from an ancestor frame on one of your altars linked to them; nothing when there is none. */
export function AncestorPhoto({ id, name }: { id: string; name: string }) {
  const photoOf = usePhotos();
  const photo = photoOf(id);
  if (!photo) return null;
  return (
    <View style={s.people}>
      <Image source={{ uri: photo.photo }} style={[s.photo, photo.aged ? { opacity: 0.85 } : null]} resizeMode="cover" accessibilityLabel={`A photo of ${name || 'them'}`} />
      <Text style={[type.caption, s.grow]}>{`From the ancestor frame on ${photo.altarName}.`}</Text>
    </View>
  );
}

/** For any page that wants one journal's door (Cycle & Moon, help, the altar). */
export function JournalDoor({ kind, detail }: { kind: JournalKind; detail?: string }) {
  const { settings } = useMySettings();
  const { list } = useJournal(kind);
  const { names } = usePeople();
  const routes = journalRoutes(kind, journalPlace(settings, kind));
  return (
    <List>
      <Row icon="grimoire" title={`${journalDef(kind).title} journal`} detail={detail ?? shelfLine(kind, list, { people: names })} last onPress={() => router.push(routes.list as Href)} />
    </List>
  );
}
