// Book of Shadows links for altar objects: a picker sheet to choose a page,
// and the panel row that opens the linked page. The link itself is kept in
// the object's livingState.app.pageId (lib/altar/connect/grimoire).

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { pageChoices, pageLinkOf, resolvePageLink } from '../../../lib/altar/connect/grimoire';
import { shortLabel } from '../../../lib/altar/cabinet';
import type { SavedObject } from '../../../lib/altar/types';
import { useGrimoire } from '../../../lib/grimoire/store';
import { type } from '../../../theme';
import { Chip, ChipRow } from '../Chip';
import { Sheet } from '../Sheet';
import { connectStyles, Eyebrow, Field, PanelSection, Row } from './common';

type SheetProps = {
  visible: boolean;
  object: SavedObject | null;
  onClose: () => void;
  /** Link it (commit updateObjects with withPageLink(o, page, now)). */
  onLink: (page: { id: string; title: string }) => void;
  /** Take the link away (withoutPageLink). */
  onUnlink: () => void;
};

/** Choose the Book of Shadows page an object belongs to. */
export function GrimoireLinkSheet({ visible, object, onClose, onLink, onUnlink }: SheetProps) {
  const grimoire = useGrimoire();
  const [query, setQuery] = useState('');
  const label = shortLabel(object?.label, 'this object');
  const choices = useMemo(() => pageChoices(grimoire.snapshot, label, query), [grimoire.snapshot, label, query]);
  const current = pageLinkOf(object);
  const suggested = choices.filter((c) => c.suggested);
  const rest = choices.filter((c) => !c.suggested);

  return (
    <Sheet
      visible={visible}
      eyebrow="Book of Shadows"
      title={`A page for ${label}`}
      onClose={onClose}
      header={
        grimoire.snapshot ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
            <Field label="Search your pages" value={query} onChangeText={setQuery} placeholder="Search your pages…" autoCorrect={false} returnKeyType="search" />
          </View>
        ) : undefined
      }
    >
      {!grimoire.snapshot ? (
        <Text style={connectStyles.body}>
          {grimoire.status === 'loading' ? 'Opening your Book of Shadows…' : 'Your Book of Shadows lives with your account. Sign in, and its pages can be linked to things on your altar.'}
        </Text>
      ) : choices.length === 0 ? (
        <Text style={connectStyles.body}>{query ? 'No page has that in its title.' : 'Your Book of Shadows has no pages yet. Write one in the Grimoire tab, then link it here.'}</Text>
      ) : (
        <>
          {current && (
            <ChipRow>
              <Chip
                label="Remove the link"
                tone="danger"
                onPress={() => {
                  onUnlink();
                  onClose();
                }}
              />
            </ChipRow>
          )}
          {suggested.length > 0 && (
            <View style={connectStyles.gap}>
              <Eyebrow>Might belong</Eyebrow>
              {suggested.map((c) => (
                <PageRow key={c.id} title={c.title} section={c.section} selected={current?.pageId === c.id} onPress={() => (onLink({ id: c.id, title: c.title }), onClose())} />
              ))}
            </View>
          )}
          <View style={connectStyles.gap}>
            {suggested.length > 0 && <Eyebrow>Your pages</Eyebrow>}
            {rest.map((c) => (
              <PageRow key={c.id} title={c.title} section={c.section} selected={current?.pageId === c.id} onPress={() => (onLink({ id: c.id, title: c.title }), onClose())} />
            ))}
          </View>
        </>
      )}
    </Sheet>
  );
}

function PageRow({ title, section, selected, onPress }: { title: string; section: string; selected: boolean; onPress: () => void }) {
  return <Row title={title} detail={[section, selected ? 'linked now' : ''].filter(Boolean).join(' · ') || undefined} selected={selected} onPress={onPress} />;
}

/** The panel row: the linked page (tap to open it), or an offer to link one. */
export function GrimoirePageLink({ object, onPick }: { object: SavedObject; onPick: () => void }) {
  const grimoire = useGrimoire();
  const link = pageLinkOf(object);
  const resolved = resolvePageLink(link, grimoire.snapshot);
  return (
    <PanelSection title="Book of Shadows">
      {link && resolved ? (
        <>
          <Text style={connectStyles.value}>{resolved.title}</Text>
          {resolved.exists === false && <Text style={type.caption}>That page has been deleted from your Book of Shadows.</Text>}
          <ChipRow>
            {resolved.exists !== false && <Chip label="Open the page" symbol="❧" onPress={() => router.push({ pathname: '/grimoire/[pageId]', params: { pageId: link.pageId } })} />}
            <Chip label="Change" onPress={onPick} />
          </ChipRow>
        </>
      ) : (
        <ChipRow>
          <Chip label="Link a page" symbol="❧" accessibilityLabel="Link a page from your Book of Shadows" onPress={onPick} />
        </ChipRow>
      )}
    </PanelSection>
  );
}
