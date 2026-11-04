// Crystal wear in the altar editor: the look of each worn stone on the stage,
// "Something came at me" (the Tend tools, and a protective spell's card), and
// a worn or broken stone's card in the object panel with what you choose for
// a broken one. The logic is lib/altar/crystalCare.ts, shared with the
// website (altar/js/features/altar-crystal-wear.js); the setting is
// crystal_wear in your settings (Settings → Altar).

import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { shortLabel } from '../../lib/altar/cabinet';
import {
  awaitingChoice,
  BREAK_CHOICES,
  breakChoice,
  breakLine,
  chooseForBroken,
  PROTECTIVE,
  somethingCameAtMe,
  STAGE_WORDS,
  wearLine,
  wearLook,
  wearModeOf,
  wearOf,
  WEAR_SETTING,
  type BreakChoice,
  type WearContext,
  type WearLook,
  type WearMode,
} from '../../lib/altar/crystalCare';
import { removeObject, updateObjects } from '../../lib/altar/editor';
import type { AltarDocument } from '../../lib/altar/snapshot';
import type { SavedObject } from '../../lib/altar/types';
import type { SpellEntry } from '../../lib/altar/workings/spells';
import { colors, type } from '../../theme';
import { Chip, ChipRow } from './Chip';

const nowIso = () => new Date().toISOString();

type Deps = {
  doc: AltarDocument | null;
  commit: (next: (d: AltarDocument) => AltarDocument, recordUndo?: boolean) => void;
  settings: Record<string, unknown> | null;
  altarId: string | null;
  altarIntention: string;
  spells: { data: SpellEntry }[];
  minute: number;
  say: (line: string) => void;
  log: (line: string) => void;
};

export function useCrystalWear({ doc, commit, settings, altarId, altarIntention, spells, minute, say, log }: Deps) {
  const mode: WearMode = wearModeOf(settings?.[WEAR_SETTING]);
  const ctx = useMemo<WearContext>(
    () => ({
      altarIntention: altarIntention ? { text: altarIntention } : null,
      spells: spells.filter((e) => e.data?.altarId === altarId).map((e) => e.data),
    }),
    [altarIntention, spells, altarId],
  );
  const looks = useMemo(() => {
    const out: Record<string, WearLook> = {};
    if (mode === 'off') return out;
    for (const o of doc?.objects ?? []) {
      const look = o.altarObjectId && o.type === 'crystal' ? wearLook(wearOf(o, mode, minute * 60_000, ctx)) : null;
      if (look) out[String(o.altarObjectId)] = look;
    }
    return out;
  }, [doc, mode, minute, ctx]);

  const cameAtMe = () => {
    if (!doc) return;
    const at = nowIso();
    const result = somethingCameAtMe(doc.objects, mode, at, ctx);
    if (result.hit.length) commit((d) => ({ ...d, objects: somethingCameAtMe(d.objects, mode, at, ctx).objects }));
    log(result.hit.length ? result.line : 'Something came at me.');
    const broken = result.objects.find((o) => result.broke.includes(String(o.altarObjectId || '')));
    say(broken ? `${result.line} ${breakLine(shortLabel(broken.label, 'stone'))}` : result.line);
  };

  const choose = (uid: string, choice: BreakChoice) => {
    const c = breakChoice(choice);
    const index = doc?.objects.findIndex((o) => String(o.altarObjectId || '') === uid) ?? -1;
    if (!doc || !c || index < 0) return;
    const at = nowIso();
    const name = shortLabel(doc.objects[index].label, 'The stone');
    commit((d) => {
      const i = d.objects.findIndex((o) => String(o.altarObjectId || '') === uid);
      if (i < 0) return d;
      const next = updateObjects(d, [i], (o) => chooseForBroken(o, choice, at));
      return c.removes ? removeObject(next, i) : next;
    });
    const line = `${name} ${c.line}.`;
    log(line);
    say(c.removes ? `${line} Thank you, ${name.toLowerCase()}.` : line);
  };

  return { mode, ctx, looks, cameAtMe, choose };
}

/** Whether a spell's card offers "Something came at me". */
export const isProtectiveSpell = (spell: SpellEntry) => PROTECTIVE.test(`${spell.title} ${spell.intention ?? ''}`);

/** A worn or broken stone's card in the object panel. */
export function WearCard({
  object,
  mode,
  ctx,
  now,
  onChoose,
  onCameAt,
}: {
  object: SavedObject;
  mode: WearMode;
  ctx: WearContext;
  now: number;
  onChoose: (uid: string, choice: BreakChoice) => void;
  onCameAt: () => void;
}) {
  const wear = wearOf(object, mode, now, ctx);
  if (!wear) return null;
  const line = wearLine(wear);
  const uid = String(object.altarObjectId || '');
  if (!line && !wear.guard) return null;
  const waiting = awaitingChoice(object);
  return (
    <View style={styles.box} accessible={!waiting && !wear.guard} accessibilityLabel={line ? `${STAGE_WORDS[wear.stage]}. ${line}` : undefined}>
      {!!line && <Text style={[type.eyebrow, wear.stage !== 'dull' && styles.worn]}>{STAGE_WORDS[wear.stage]}</Text>}
      {waiting ? (
        <>
          <Text style={type.caption}>{breakLine(shortLabel(object.label, 'stone'))} What would you like to do with it? Nothing is taken away until you choose.</Text>
          <ChipRow>
            {BREAK_CHOICES.map((c) => (
              <Chip key={c.id} label={c.label} onPress={() => onChoose(uid, c.id)} />
            ))}
          </ChipRow>
        </>
      ) : (
        !!line && <Text style={type.caption}>{line}</Text>
      )}
      {wear.guard && !wear.broken && (
        <ChipRow>
          <Chip label="Something came at me" symbol="◈" accessibilityLabel="Something came at me: log it, and the stones doing protective work take the brunt" onPress={onCameAt} />
        </ChipRow>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 6, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  worn: { color: colors.goldDeep },
});
