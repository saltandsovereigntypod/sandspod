// The To tend list in the app: everything you tend, loaded from where it
// lives (your altars and petition box, your covens, your journeys, your
// journal and My Apothecary), put together by gather.ts and model.ts, and
// tended by each source's own tending, so the altar, the coven and the rest
// stay in step. What the list keeps itself (rhythms, reminders, words and
// endings) is the craft collection `tend.rhythms`, synced like the practice
// tools; the website (today/tend/) reads and writes the same.

import { useCallback, useEffect, useMemo } from 'react';

import { useAltars } from '../altar/store';
import { finishPetition, PETITIONS, type Petition, type PetitionEnd } from '../altar/petitions';
import { documentFromAltar } from '../altar/snapshot';
import { useWorkshop } from '../altar/workshop';
import { addEntry, updateEntry, useCraft, type CraftEntry } from '../craft/store';
import * as api from '../covens/api';
import { changeAltarOnce } from '../covens/altarSync';
import { tendWithSeed } from '../covens/petitionAltar';
import { todayIso } from '../covens/record';
import { useGrimoire } from '../grimoire/store';
import { journeyById } from '../journeys';
import { logPractice, nextSteps, normalizeProgress } from '../journeys/progress';
import { saveProgress, useCadence, useJourneyProgress } from '../journeys/store';
import { useMoreCachedCovens } from './covens';
import { useRituals } from '../rituals/store';
import { useSession } from '../session';
import { askForTendReminders, setTendSources } from '../reminders/store';
import { gatherTendables, type CovenPart, type JourneyPart } from './gather';
import { tendAltar, type AltarTend } from './altar';
import { endingPage, newRecord, normalizeRecord, recordEnded, recordTended, TEND_COLLECTION, tendList, type ListItem, type TendEnd, type Tendable, type TendRecord } from './model';

export type RecordEntry = { id: string; record: TendRecord };

/** Your list's own choices, one per thing tended. */
export function useTendRecords(): { entries: RecordEntry[]; records: TendRecord[]; ready: boolean } {
  const { entries, ready } = useCraft<unknown>(TEND_COLLECTION);
  return useMemo(() => {
    const list: RecordEntry[] = [];
    // The newest copy of each key wins, should two devices have made one.
    for (const e of [...entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
      const record = normalizeRecord(e.data);
      if (record && !list.some((x) => x.record.key === record.key)) list.push({ id: e.id, record });
    }
    return { entries: list, records: list.map((x) => x.record), ready };
  }, [entries, ready]);
}

/** Keep the reminders asked for on the list ringing, from the moment the app opens. */
export function useTendReminderKeeper() {
  const { records } = useTendRecords();
  useEffect(() => {
    setTendSources(records);
  }, [records]);
}

export async function saveRecord(entries: RecordEntry[], record: TendRecord): Promise<void> {
  const existing = entries.find((e) => e.record.key === record.key);
  if (existing) await updateEntry<TendRecord>(TEND_COLLECTION, existing.id, record);
  else await addEntry<TendRecord>(TEND_COLLECTION, record);
}

/** The whole list, as it stands now, and what's needed to tend it. */
export function useTendList(now: Date) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const altarStore = useAltars();
  const { entries: petitionEntries } = useCraft<Petition>(PETITIONS);
  const { entries: progress } = useJourneyProgress();
  const cadence = useCadence();
  const rituals = useRituals();
  const { apothecary } = useWorkshop();
  const covens = useMoreCachedCovens(userId);
  const { entries, records, ready } = useTendRecords();

  const journeys = useMemo<JourneyPart[]>(
    () =>
      progress
        .map((e) => {
          const journey = journeyById(e.data.journeyId);
          if (!journey) return null;
          return { entryId: e.id, journeyId: journey.id, title: journey.title, steps: nextSteps(journey, normalizeProgress(e.data), now, cadence) } as JourneyPart;
        })
        .filter((j): j is JourneyPart => !!j),
    [progress, now, cadence],
  );

  const items = useMemo(
    () =>
      gatherTendables({
        now,
        altars: { altars: altarStore.altars, petitions: petitionEntries },
        covens: covens.part,
        journeys,
        journal: rituals.journal,
        apothecary,
      }),
    [now, altarStore.altars, petitionEntries, covens.part, journeys, rituals.journal, apothecary],
  );
  const list = useMemo(() => tendList(items, records, now), [items, records, now]);
  return { userId, items, list, records, entries, ready, covens, altarStore, petitionEntries, progress, refresh: covens.refresh };
}

export type TendContext = ReturnType<typeof useTendList>;

/** What happened, in a line for the screen. */
export type Outcome = { ok: boolean; message: string };

const fail = (error: unknown): Outcome => ({ ok: false, message: error instanceof Error ? error.message : String(error || 'That didn’t work. Please try again.') });

/** Tending from the list: each thing by its own source's tending. */
export function useTendActions(ctx: TendContext) {
  const grimoire = useGrimoire();
  const { entries, altarStore, petitionEntries, covens, userId } = ctx;
  const myName = covens.myName;

  const remember = useCallback(
    async (item: Tendable, change: (r: TendRecord) => TendRecord) => {
      const current = entries.find((e) => e.record.key === item.key)?.record ?? newRecord(item);
      await saveRecord(entries, change({ ...current, title: item.title, source: item.source, href: item.href }));
    },
    [entries],
  );

  const onAltar = useCallback(
    async (altarId: string, change: AltarTend) => {
      const altar = altarStore.altars.find((a) => a.id === altarId);
      if (!altar) throw new Error('That altar isn’t here any more.');
      const doc = documentFromAltar(altar);
      const next = tendAltar(doc, change, new Date().toISOString());
      if (next === doc) return;
      const saved = await altarStore.save({ id: altar.id, name: altar.name, doc: next });
      if (saved.outcome === 'failed') throw new Error('Your account didn’t take the change to the altar. It’s kept on this phone to try again.');
    },
    [altarStore],
  );

  /** Tend it: light, snuff, refresh, water, tend a coven petition, keep holding, add a word. */
  const tend = useCallback(
    async (item: ListItem, action: 'light' | 'snuff' | 'refresh' | 'water' | 'tend' | 'word', word = ''): Promise<Outcome> => {
      const now = new Date();
      const { ref } = item;
      try {
        if (item.group === 'altar') {
          if (action === 'light' || action === 'snuff') await onAltar(ref.altarId, { kind: action, objectId: item.kind === 'petition' ? ref.candleId : ref.objectId });
          if (action === 'refresh' || action === 'water') await onAltar(ref.altarId, { kind: action, objectId: ref.objectId });
          if (word.trim() && ref.objectId) await onAltar(ref.altarId, { kind: 'word', objectId: ref.objectId, text: word });
        } else if (item.kind === 'coven-petition' && action === 'tend') {
          const petition = covens.part?.petitions.find((p) => p.id === ref.petitionId);
          await api.tendPetition(ref.petitionId, word);
          // The candle in your name on its altar is a kindness, not the record: the tending stands if it can't be set.
          if (petition?.altar_id) await changeAltarOnce(petition.altar_id, tendWithSeed(petition, myName, now.toISOString(), userId ?? '')).catch(() => undefined);
          void covens.refresh();
        } else if (item.kind === 'contribution' && action === 'tend') {
          await api.tendContribution(ref.contributionId, 'held', '');
          void covens.refresh();
        }
        await remember(item, (r) => recordTended(r, now, word));
        const done: Record<string, string> = {
          light: 'The candle is lit.',
          snuff: 'The candle is resting.',
          refresh: 'A fresh offering is set out.',
          water: 'Watered.',
          tend: item.kind === 'coven-petition' ? 'You tended it. A candle burns in your name beside it.' : 'You are holding it still.',
          word: 'Your word is kept with it.',
        };
        return { ok: true, message: done[action] };
      } catch (error) {
        return fail(error);
      }
    },
    [onAltar, covens, myName, userId, remember],
  );

  /** End it (answered, closed, burned, released, let go), with "how did it go?" kept in your Grimoire if you wrote it. */
  const end = useCallback(
    async (item: ListItem, how: TendEnd, note: string, keepInGrimoire: boolean): Promise<Outcome> => {
      const now = new Date();
      const { ref } = item;
      try {
        if (item.kind === 'petition' && (how === 'burned' || how === 'buried' || how === 'released')) {
          const entry = petitionEntries.find((e) => e.id === ref.entryId) as CraftEntry<Petition> | undefined;
          if (entry) {
            await updateEntry(PETITIONS, entry.id, finishPetition(entry.data, how as PetitionEnd, now));
            await onAltar(ref.altarId, { kind: 'petition', entryId: entry.id, title: entry.data.title, candleId: entry.data.candleId, how: how as PetitionEnd });
          }
        } else if (item.kind === 'offering' && how === 'returned') {
          await onAltar(ref.altarId, { kind: 'returned', objectId: ref.objectId });
        } else if (item.kind === 'coven-petition' && (how === 'answered' || how === 'closed')) {
          await api.closePetition(ref.petitionId, how, note);
          void covens.refresh();
        } else if (item.kind === 'contribution' && (how === 'answered' || how === 'closed')) {
          await api.tendContribution(ref.contributionId, how, note);
          void covens.refresh();
        }
        let pageId: string | undefined;
        const record = entries.find((e) => e.record.key === item.key)?.record ?? null;
        if (keepInGrimoire && note.trim() && grimoire.canEdit) pageId = grimoire.actions.saveHolyPage(endingPage(item, record, how, note, now)) ?? undefined;
        await remember(item, (r) => recordEnded(r, how, note, now, pageId));
        return { ok: true, message: `${how === 'answered' ? 'Marked answered. Blessed be.' : how === 'let-go' ? 'Let go. It won’t ask to be tended again.' : 'It’s ended, with thanks.'}${pageId ? ' How it went is kept in your Grimoire.' : ''}` };
      } catch (error) {
        return fail(error);
      }
    },
    [petitionEntries, onAltar, covens, entries, grimoire, remember],
  );

  /** Write what a rite asks of you, ahead of it. */
  const write = useCallback(
    async (item: ListItem, body: string, isPrivate: boolean): Promise<Outcome> => {
      try {
        await api.saveContribution(item.ref.stepId, body, [], isPrivate, false);
        void covens.refresh();
        return { ok: true, message: isPrivate ? 'Written, and sealed: only you can read it.' : 'Written. It’s ready for the rite.' };
      } catch (error) {
        return fail(error);
      }
    },
    [covens],
  );

  /** Log a check-in with a mentee, met today. */
  const checkin = useCallback(
    async (item: ListItem, note: string): Promise<Outcome> => {
      try {
        await api.logCheckin(item.ref.covenId, item.ref.userId, todayIso(), note);
        void covens.refresh();
        await remember(item, (r) => recordTended(r, new Date()));
        return { ok: true, message: 'The check-in is logged.' };
      } catch (error) {
        return fail(error);
      }
    },
    [covens, remember],
  );

  /** A journey's practice, done for today. */
  const practice = useCallback(
    async (item: ListItem, note: string): Promise<Outcome> => {
      const entry = ctx.progress.find((e) => e.id === item.ref.entryId);
      if (!entry) return { ok: false, message: 'That journey isn’t here any more.' };
      try {
        await saveProgress(entry.id, logPractice(normalizeProgress(entry.data), item.ref.practiceId, new Date(), note));
        await remember(item, (r) => recordTended(r, new Date()));
        return { ok: true, message: 'Done for today. It’s kept with your journey.' };
      } catch (error) {
        return fail(error);
      }
    },
    [ctx.progress, remember],
  );

  /** Its rhythm and reminder. */
  const setRhythm = useCallback(
    async (item: ListItem, change: Partial<Pick<TendRecord, 'rhythm' | 'remind' | 'at'>>): Promise<Outcome> => {
      try {
        await remember(item, (r) => ({ ...r, ...change }));
        if (change.remind) {
          const permission = await askForTendReminders();
          if (permission !== 'granted') return { ok: true, message: 'Saved. Allow notifications for Salt & Sovereignty in your phone’s settings for it to ring.' };
        }
        return { ok: true, message: 'Saved.' };
      } catch (error) {
        return fail(error);
      }
    },
    [remember],
  );

  return { tend, end, write, checkin, practice, setRhythm };
}

export type { CovenPart };
