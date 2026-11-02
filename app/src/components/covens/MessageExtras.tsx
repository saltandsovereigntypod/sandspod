import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  QUICK_REACTIONS,
  REPLY_PRESETS,
  answerTally,
  buttonsOf,
  cleanReplyButtons,
  myAnswer,
  oneEmoji,
  reactionGroups,
  reactionLabel,
  searchEmoji,
  tallyWords,
  type Answer,
  type Reaction,
  type ReplyButtons,
  type ReplyPreset,
} from '../../lib/covens/messageExtras';
import type { Message } from '../../lib/covens/model';
import { colors, fonts, radius } from '../../theme';

// Reactions and reply buttons on a coven message (lib/covens/messageExtras.ts):
// press and hold a message for the reaction row (and "More", any emoji); the
// reactions and buttons sit under it, with counts; tap a count to see who.
// The composer's "Add reply buttons" sets a message's buttons before sending.

/** Press and hold a message: the reaction row, "More" for any emoji, and the message's other actions. */
export function ReactionPicker({ message, onPick, onMore, onClose }: { message: Message | null; onPick: (emoji: string) => void; onMore: () => void; onClose: () => void }) {
  const [grid, setGrid] = useState(false);
  const [query, setQuery] = useState('');
  const [typed, setTyped] = useState('');
  const close = () => {
    setGrid(false);
    setQuery('');
    setTyped('');
    onClose();
  };
  const pick = (emoji: string) => {
    onPick(emoji);
    close();
  };
  const typedEmoji = oneEmoji(typed);
  return (
    <Modal visible={!!message} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close" accessibilityRole="button">
        <Pressable style={styles.sheet} onPress={() => {}} accessible={false}>
          <Text style={styles.sheetTitle} numberOfLines={2}>
            {message?.body.slice(0, 120)}
          </Text>
          <View style={styles.quickRow}>
            {QUICK_REACTIONS.map((e) => (
              <Pressable key={e} onPress={() => pick(e)} accessibilityRole="button" accessibilityLabel={`React with ${e}`} style={({ pressed }) => [styles.quick, pressed && styles.pressed]}>
                <Text style={styles.quickText}>{e}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setGrid((g) => !g)} accessibilityRole="button" accessibilityLabel="More emoji" accessibilityState={{ expanded: grid }} style={({ pressed }) => [styles.quick, styles.moreChip, pressed && styles.pressed]}>
              <Text style={styles.moreText}>More</Text>
            </Pressable>
          </View>
          {grid && (
            <View>
              <TextInput value={query} onChangeText={setQuery} placeholder="Search: moon, heart, herb…" placeholderTextColor={colors.tabInactive} accessibilityLabel="Search emoji" style={styles.field} />
              <ScrollView style={styles.grid} contentContainerStyle={styles.gridInner} keyboardShouldPersistTaps="handled">
                {searchEmoji(query).map((e) => (
                  <Pressable key={e} onPress={() => pick(e)} accessibilityRole="button" accessibilityLabel={`React with ${e}`} style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
                    <Text style={styles.quickText}>{e}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.typedRow}>
                <TextInput value={typed} onChangeText={setTyped} placeholder="Or type any one emoji" placeholderTextColor={colors.tabInactive} accessibilityLabel="Type any one emoji" style={[styles.field, styles.typedField]} maxLength={16} />
                <Pressable onPress={() => typedEmoji && pick(typedEmoji)} disabled={!typedEmoji} accessibilityRole="button" accessibilityLabel="React with it" style={[styles.smallButton, !typedEmoji && styles.off]}>
                  <Text style={styles.smallButtonText}>React</Text>
                </Pressable>
              </View>
            </View>
          )}
          <Pressable
            onPress={() => {
              close();
              // After the sheet has gone, so the actions can show.
              setTimeout(onMore, 350);
            }}
            accessibilityRole="button"
            style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          >
            <Text style={styles.optionText}>Remove, report or block…</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Who chose something: their names in a short list. */
function showWho(title: string, names: string[]) {
  Alert.alert(title, names.length ? names.join('\n') : 'No one yet.');
}

/** Under a message: its reactions (tap the emoji to add or take back yours, the count to see who) and its reply buttons with the tally. */
export function MessageExtrasRow({
  message,
  mine,
  me,
  reactions,
  answers,
  blocked,
  nameOf,
  onReact,
  onAnswer,
  canTalk,
}: {
  message: Message & { hidden?: boolean };
  mine: boolean;
  me: string | null;
  reactions: Reaction[];
  answers: Answer[];
  blocked: string[];
  nameOf: (id: string | null) => string;
  onReact: (message: Message, emoji: string) => void;
  onAnswer: (message: Message, choice: number) => void;
  canTalk: boolean;
}) {
  if (message.deleted_at || message.hidden) return null;
  const groups = reactionGroups(reactions, message.id, me, blocked);
  const buttons = buttonsOf(message);
  if (!groups.length && !buttons) return null;
  const tally = buttons ? answerTally(buttons, answers, message.id, me, blocked) : [];
  const current = buttons ? myAnswer(answers, message.id, me) : null;
  const names = (ids: string[]) => ids.map((id) => (id === me ? 'You' : nameOf(id)));
  return (
    <View style={[styles.extras, mine ? styles.extrasMine : styles.extrasTheirs]}>
      {buttons && (
        <View style={styles.buttonsBox}>
          <View style={styles.replyRow}>
            {buttons.labels.map((label, i) => (
              <Pressable
                key={`${i}-${label}`}
                onPress={() => onAnswer(message, i)}
                disabled={!canTalk}
                accessibilityRole="button"
                accessibilityState={{ selected: current === i, disabled: !canTalk }}
                accessibilityHint={current === i ? 'Tap again to take your answer back' : undefined}
                style={({ pressed }) => [styles.reply, current === i && styles.replyOn, pressed && styles.pressed]}
              >
                <Text style={[styles.replyText, current === i && styles.replyTextOn]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() =>
              showWho(
                'Answers',
                tally.filter((t) => t.count).map((t) => `${t.label}: ${names(t.who).join(', ')}`),
              )
            }
            accessibilityRole="button"
            accessibilityHint="Shows who answered"
          >
            <Text style={styles.tally}>{tallyWords(tally)}</Text>
          </Pressable>
        </View>
      )}
      {groups.length > 0 && (
        <View style={styles.chips}>
          {groups.map((g) => (
            <View key={g.emoji} style={[styles.chip, g.mine && styles.chipMine]}>
              <Pressable onPress={() => canTalk && onReact(message, g.emoji)} accessibilityRole="button" accessibilityLabel={reactionLabel(g)} accessibilityHint={g.mine ? 'Takes your reaction back' : 'Adds yours'} style={styles.chipEmoji}>
                <Text style={styles.chipEmojiText}>{g.emoji}</Text>
              </Pressable>
              <Pressable onPress={() => showWho(`Reacted ${g.emoji}`, names(g.who))} accessibilityRole="button" accessibilityLabel={`See who reacted with ${g.emoji}`} style={styles.chipCount}>
                <Text style={styles.chipCountText}>{g.count}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** The composer's "Add reply buttons": a preset or your own labels, and (the coven's chat) a gathering to link. */
export function ReplyButtonsPanel({
  value,
  onChange,
  gatherings,
}: {
  value: ReplyButtons | null;
  onChange: (next: ReplyButtons | null) => void;
  /** Upcoming gatherings to link to (the coven's chat only); null where none may be linked. */
  gatherings: { id: string; title: string }[] | null;
}) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<ReplyPreset>(value?.preset ?? 'gathering');
  const [custom, setCustom] = useState<string[]>(['', '', '', '']);
  const [ritual, setRitual] = useState<string | null>(value?.ritual_id ?? null);
  const apply = (p: ReplyPreset, labels: string[], ritualId: string | null) => onChange(cleanReplyButtons({ preset: p, labels, ritual_id: p === 'gathering' ? ritualId : undefined }));
  if (!open)
    return (
      <Pressable
        onPress={() => {
          setOpen(true);
          apply(preset, custom, ritual);
        }}
        accessibilityRole="button"
        style={({ pressed }) => [styles.addButtons, pressed && styles.pressed]}
      >
        <Text style={styles.addButtonsText}>Add reply buttons</Text>
      </Pressable>
    );
  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <Text style={styles.panelTitle}>Reply buttons</Text>
        <Pressable
          onPress={() => {
            setOpen(false);
            onChange(null);
          }}
          accessibilityRole="button"
          accessibilityLabel="Remove reply buttons"
        >
          <Text style={styles.addButtonsText}>Remove</Text>
        </Pressable>
      </View>
      <View style={styles.replyRow}>
        {REPLY_PRESETS.map((p) => (
          <Pressable
            key={p.value}
            onPress={() => {
              setPreset(p.value);
              apply(p.value, custom, ritual);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: preset === p.value }}
            style={[styles.reply, preset === p.value && styles.replyOn]}
          >
            <Text style={[styles.replyText, preset === p.value && styles.replyTextOn]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
      {preset === 'custom' ? (
        <View style={styles.customGrid}>
          {custom.map((label, i) => (
            <TextInput
              key={i}
              value={label}
              onChangeText={(text) => {
                const next = custom.map((l, j) => (j === i ? text : l));
                setCustom(next);
                apply('custom', next, null);
              }}
              placeholder={i < 2 ? `Button ${i + 1}` : `Button ${i + 1} (optional)`}
              placeholderTextColor={colors.tabInactive}
              maxLength={40}
              accessibilityLabel={`Button ${i + 1}`}
              style={[styles.field, styles.customField]}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.panelNote}>{REPLY_PRESETS.find((p) => p.value === preset)?.labels.join(' · ')}</Text>
      )}
      {preset === 'gathering' && gatherings && gatherings.length > 0 && (
        <>
          <Text style={styles.panelNote}>Link to a gathering (answers set people’s RSVP too):</Text>
          <View style={styles.replyRow}>
            {[{ id: '', title: 'None' }, ...gatherings].map((g) => (
              <Pressable
                key={g.id || 'none'}
                onPress={() => {
                  const id = g.id || null;
                  setRitual(id);
                  apply('gathering', custom, id);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: (ritual ?? '') === g.id }}
                style={[styles.reply, (ritual ?? '') === g.id && styles.replyOn]}
              >
                <Text style={[styles.replyText, (ritual ?? '') === g.id && styles.replyTextOn]} numberOfLines={1}>
                  {g.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {preset === 'custom' && !value && <Text style={styles.panelNote}>Give at least two buttons a label.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  off: { opacity: 0.35 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, padding: 16, paddingBottom: 28, gap: 10 },
  sheetTitle: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quick: { minWidth: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised },
  quickText: { fontSize: 22 },
  moreChip: { paddingHorizontal: 12 },
  moreText: { fontFamily: fonts.body, fontSize: 14, color: colors.gold },
  field: { borderWidth: 1, borderColor: colors.hairline, borderRadius: radius.button, paddingHorizontal: 12, paddingVertical: 8, color: colors.cream, fontFamily: fonts.body, fontSize: 15 },
  grid: { maxHeight: 220, marginTop: 8 },
  gridInner: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  typedRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  typedField: { flex: 1 },
  smallButton: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.button, backgroundColor: colors.gold },
  smallButtonText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.forestInk },
  option: { paddingVertical: 12 },
  optionText: { fontFamily: fonts.body, fontSize: 15, color: colors.cream },
  extras: { paddingHorizontal: 12, marginTop: 3, gap: 4, maxWidth: '86%' },
  extrasMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  extrasTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  buttonsBox: { gap: 4 },
  replyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  reply: { minHeight: 34, paddingHorizontal: 12, justifyContent: 'center', borderRadius: radius.chip, borderWidth: 1, borderColor: colors.goldLine, maxWidth: 220 },
  replyOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  replyText: { fontFamily: fonts.body, fontSize: 14, color: colors.cream },
  replyTextOn: { color: colors.forestInk },
  tally: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textDecorationLine: 'underline', paddingVertical: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.chip, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.hairline },
  chipMine: { borderColor: colors.gold },
  chipEmoji: { paddingLeft: 8, paddingRight: 3, paddingVertical: 3 },
  chipEmojiText: { fontSize: 15 },
  chipCount: { paddingRight: 9, paddingLeft: 3, paddingVertical: 5 },
  chipCountText: { fontFamily: fonts.body, fontSize: 12, color: colors.cream },
  addButtons: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6 },
  addButtonsText: { fontFamily: fonts.body, fontSize: 13, color: colors.gold },
  panel: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline, backgroundColor: colors.night },
  panelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.cream },
  panelNote: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  customGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  customField: { flexBasis: '48%', flexGrow: 1 },
});
