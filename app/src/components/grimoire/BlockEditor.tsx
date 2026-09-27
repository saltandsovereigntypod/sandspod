import { useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { editorKind, elementLabel } from '../../lib/grimoire/elements';
import { htmlToMarkup, insertLink, normalizeUrl, wrapSelection, type Selection } from '../../lib/grimoire/markup';
import { useGrimoire } from '../../lib/grimoire/store';
import { blockMetadata, blockSource } from '../../lib/grimoire/structure';
import type { BlockRow, PageRow } from '../../lib/grimoire/types';
import { fonts, touch } from '../../theme';
import { Icon } from '../Icon';
import { BlockView, ink, Ornament } from './BlockView';
import { useDraft } from './useDraft';

type Props = {
  block: BlockRow;
  index: number;
  count: number;
  pages: PageRow[];
  /** The last focused text element shows the formatting buttons. */
  active: boolean;
  onFocus: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onRemove: () => void;
  onChooseLink: () => void;
};

export function BlockEditor({ block, index, count, pages, active, onFocus, onMove, onRemove, onChooseLink }: Props) {
  const label = elementLabel(block.block_type);
  const kind = editorKind(block.block_type);

  return (
    <View style={styles.card}>
      <View style={styles.controls}>
        <Text style={styles.kind} numberOfLines={1}>
          {label}
        </Text>
        <InkIconButton
          label={`Move ${label} up`}
          rotate="-90deg"
          disabled={index === 0}
          onPress={() => onMove('up')}
        />
        <InkIconButton
          label={`Move ${label} down`}
          rotate="90deg"
          disabled={index === count - 1}
          onPress={() => onMove('down')}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          accessibilityHint={count <= 1 ? 'A page keeps at least one element' : undefined}
          accessibilityState={{ disabled: count <= 1 }}
          disabled={count <= 1}
          onPress={onRemove}
          style={({ pressed }) => [styles.remove, (pressed || count <= 1) && styles.dim]}
        >
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </View>

      {kind === 'rich' && <RichField block={block} label={label} active={active} onFocus={onFocus} />}
      {kind === 'plain' && <PlainField block={block} label={label} onFocus={onFocus} />}
      {kind === 'divider' && <Ornament />}
      {kind === 'image' && <ImageFields block={block} onFocus={onFocus} />}
      {kind === 'page_link' && <PageLinkField block={block} pages={pages} onChoose={onChooseLink} />}
      {kind === 'unknown' && (
        <View style={styles.group}>
          <BlockView block={block} pages={pages} />
          <Text style={styles.hint}>This element can be changed on the website.</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------

function RichField({ block, label, active, onFocus }: { block: BlockRow; label: string; active: boolean; onFocus: () => void }) {
  const { actions } = useGrimoire();
  const draft = useDraft(htmlToMarkup(blockSource(block)), (value) => actions.saveBlockText(block.id, value));
  const input = useRef<TextInput>(null);
  const selection = useRef<Selection>({ start: 0, end: 0 });
  const [linking, setLinking] = useState(false);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState(false);
  const heading = block.block_type === 'heading';

  const style = (toggle: 'bold' | 'italic' | 'underline') => {
    const next = wrapSelection(draft.value, selection.current, toggle);
    selection.current = next.selection;
    draft.change(next.text);
    input.current?.focus();
  };

  const addLink = () => {
    const clean = normalizeUrl(url);
    if (!clean) {
      setUrlError(true);
      return;
    }
    draft.change(insertLink(draft.value, selection.current, clean));
    setLinking(false);
    setUrl('');
    setUrlError(false);
    input.current?.focus();
  };

  return (
    <View style={styles.group}>
      <Field
        ref={input}
        accessibilityLabel={label}
        value={draft.value}
        onChangeText={draft.change}
        onFocus={onFocus}
        onBlur={draft.flush}
        onSelectionChange={(e) => {
          selection.current = e.nativeEvent.selection;
        }}
        placeholder={heading ? 'Heading' : block.block_type === 'text' ? 'Write here…' : 'A note or a quote'}
        multiline
        submitBehavior={heading ? 'blurAndSubmit' : undefined}
        minHeight={heading ? touch : undefined}
        textStyle={heading ? styles.headingInput : undefined}
      />
      {active && !heading && (
        <View style={styles.group}>
          <View style={styles.toolbar} accessibilityRole="toolbar">
            <ToolButton label="Bold" glyph="B" glyphStyle={{ fontFamily: fonts.bodySemi }} onPress={() => style('bold')} />
            <ToolButton label="Italic" glyph="I" glyphStyle={{ fontStyle: 'italic' }} onPress={() => style('italic')} />
            <ToolButton
              label="Underline"
              glyph="U"
              glyphStyle={{ textDecorationLine: 'underline' }}
              onPress={() => style('underline')}
            />
            <ToolButton label="Add a link" glyph="Link" onPress={() => setLinking((v) => !v)} />
          </View>
          {linking ? (
            <View style={styles.group}>
              <Field
                accessibilityLabel="Link address"
                value={url}
                onChangeText={(v) => {
                  setUrl(v);
                  setUrlError(false);
                }}
                placeholder="https://"
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={addLink}
                returnKeyType="done"
              />
              {urlError && <Text style={styles.error}>That doesn't look like a web address.</Text>}
              <View style={styles.row}>
                <InkButton label="Add link" onPress={addLink} />
                <InkButton label="Cancel" quiet onPress={() => setLinking(false)} />
              </View>
            </View>
          ) : (
            <Text style={styles.hint}>**bold** · *italic* · __underline__ · [words](https://link)</Text>
          )}
        </View>
      )}
    </View>
  );
}

const PLAIN_PLACEHOLDERS: Record<string, string> = {
  correspondence: 'Planet:\nElement:\nDeities:\nUses:',
};

function PlainField({ block, label, onFocus }: { block: BlockRow; label: string; onFocus: () => void }) {
  const { actions } = useGrimoire();
  const draft = useDraft(blockSource(block), (value) => actions.saveBlockText(block.id, value));
  return (
    <Field
      accessibilityLabel={label}
      accessibilityHint={block.block_type === 'correspondence' ? undefined : 'One item per line'}
      value={draft.value}
      onChangeText={draft.change}
      onFocus={onFocus}
      onBlur={draft.flush}
      placeholder={PLAIN_PLACEHOLDERS[block.block_type] ?? 'One item per line'}
      multiline
      minHeight={120}
    />
  );
}

function ImageFields({ block, onFocus }: { block: BlockRow; onFocus: () => void }) {
  const { actions } = useGrimoire();
  const meta = blockMetadata(block);
  const initialUrl = typeof meta.url === 'string' ? meta.url : block.content ?? '';
  const url = useDraft(initialUrl, (value) => actions.saveBlockMetadata(block.id, { url: value }));
  const caption = useDraft(typeof meta.caption === 'string' ? meta.caption : '', (value) =>
    actions.saveBlockMetadata(block.id, { caption: value }),
  );
  const showPreview = /^https?:\/\/\S+$/.test(url.value.trim());

  return (
    <View style={styles.group}>
      <Field
        accessibilityLabel="Image address"
        value={url.value}
        onChangeText={url.change}
        onFocus={onFocus}
        onBlur={url.flush}
        placeholder="Image link, https://…"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Field
        accessibilityLabel="Caption"
        value={caption.value}
        onChangeText={caption.change}
        onFocus={onFocus}
        onBlur={caption.flush}
        placeholder="Caption"
      />
      {showPreview && (
        <Image source={{ uri: url.value.trim() }} style={styles.image} resizeMode="cover" accessibilityLabel={caption.value || 'Image preview'} />
      )}
    </View>
  );
}

function PageLinkField({ block, pages, onChoose }: { block: BlockRow; pages: PageRow[]; onChoose: () => void }) {
  const meta = blockMetadata(block);
  const target = pages.find((p) => p.id === meta.target_page_id);
  return (
    <View style={styles.group}>
      <Text style={styles.body}>{target ? `Turns to ${target.title || 'Untitled page'}` : 'No page linked yet.'}</Text>
      <InkButton label={target ? 'Change linked page' : 'Choose linked page'} onPress={onChoose} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Small parchment controls, shared with the page editor screen.

type FieldProps = TextInputProps & { textStyle?: StyleProp<TextStyle>; minHeight?: number; ref?: React.Ref<TextInput> };

export function Field({ textStyle, minHeight, multiline, style, ref, ...rest }: FieldProps) {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const base = minHeight ?? (multiline ? 88 : touch);
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={ink.faint}
      multiline={multiline}
      // react-native-web starts a textarea two rows tall; short fields want one.
      {...(Platform.OS === 'web' && multiline && base <= touch ? ({ rows: 1 } as object) : null)}
      textAlignVertical={multiline ? 'top' : 'center'}
      onContentSizeChange={
        multiline
          ? (e) => {
              // Native reports the text's height; the web reports the box's
              // scroll height, which already includes the padding.
              const next = Math.ceil(e.nativeEvent.contentSize.height) + (Platform.OS === 'web' ? 2 : 22);
              setHeight((prev) => (prev !== undefined && Math.abs(prev - next) < 3 ? prev : next));
            }
          : undefined
      }
      style={[styles.field, { minHeight: base }, multiline && height ? { height: Math.max(base, height) } : null, textStyle, style]}
      {...rest}
    />
  );
}

export function InkButton({ label, onPress, quiet, danger }: { label: string; onPress: () => void; quiet?: boolean; danger?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.inkButton, quiet && styles.inkButtonQuiet, pressed && styles.dim]}
    >
      <Text style={[styles.inkButtonText, danger && styles.danger]}>{label}</Text>
    </Pressable>
  );
}

function InkIconButton({ label, rotate, disabled, onPress }: { label: string; rotate: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, (pressed || disabled) && styles.dim, disabled && styles.faded]}
    >
      <View style={{ transform: [{ rotate }] }}>
        <Icon name="chevron" size={18} color={ink.soft} />
      </View>
    </Pressable>
  );
}

function ToolButton({ label, glyph, glyphStyle, onPress }: { label: string; glyph: string; glyphStyle?: StyleProp<TextStyle>; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.tool, pressed && styles.dim]}
    >
      <Text style={[styles.toolText, glyphStyle]}>{glyph}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, paddingTop: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: ink.rule },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  kind: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: ink.faint,
  },
  iconButton: { width: touch, height: touch, alignItems: 'center', justifyContent: 'center' },
  remove: { minHeight: touch, paddingHorizontal: 10, justifyContent: 'center' },
  removeText: { fontFamily: fonts.body, fontSize: 14, color: '#8a3b2a' },
  dim: { opacity: 0.6 },
  faded: { opacity: 0.35 },
  group: { gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: {
    backgroundColor: '#fbf6e9',
    borderWidth: 1,
    borderColor: ink.rule,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: ink.text,
  },
  headingInput: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 28 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tool: {
    minWidth: touch,
    height: touch,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: ink.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolText: { fontFamily: fonts.body, fontSize: 16, color: ink.text },
  hint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: ink.faint },
  error: { fontFamily: fonts.body, fontSize: 13, color: '#8a3b2a' },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: ink.text },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, backgroundColor: ink.chip },
  inkButton: {
    alignSelf: 'flex-start',
    minHeight: touch,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: ink.chip,
  },
  inkButtonQuiet: { backgroundColor: 'transparent' },
  inkButtonText: { fontFamily: fonts.bodySemi, fontSize: 14, color: ink.link },
  danger: { color: '#8a3b2a' },
});
