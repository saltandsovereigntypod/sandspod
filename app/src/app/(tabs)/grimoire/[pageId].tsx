import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';

import { Button } from '../../../components/Button';
import { Sheet } from '../../../components/altar/Sheet';
import { GrimoirePageScreen } from '../../../components/grimoire/PageScreen';
import { MenuList, MenuRow } from '../../../components/more/ui';
import { SHARE_CHOICES, type ShareChoice } from '../../../lib/grimoire/share';

// Opening a screen once the sheet has slid away; iOS won't push over a closing Modal.
const afterSheetCloses = (open: () => void) => setTimeout(open, Platform.OS === 'ios' ? 450 : 0);

const hrefFor = (choice: ShareChoice['id'], pageId: string): Href =>
  choice === 'coven'
    ? { pathname: '/grimoire/suggest', params: { pageId } }
    : // An offering starts from the page's words (more/community/offer reads `pageId`).
      { pathname: '/grimoire/offer', params: { pageId } };

// A page of your own Grimoire. "Share…" offers both ways to share it:
// suggest it to a coven you're in, or make an offering of it to the Sanctuary.
export default function GrimoirePage() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const [sharing, setSharing] = useState<string | null>(null);
  return (
    <>
      <GrimoirePageScreen
        pageId={String(pageId ?? '')}
        extras={(page) => (
          <Button
            label="Share…"
            variant="outline"
            accessibilityHint="Suggest this page to a coven, or make an offering of it"
            onPress={() => setSharing(page.id)}
          />
        )}
      />
      {/* Kept mounted and hidden, as iOS sheets must be. */}
      <Sheet visible={!!sharing} eyebrow="Share this page" title="Share…" size="half" onClose={() => setSharing(null)}>
        <MenuList>
          {SHARE_CHOICES.map((choice, i) => (
            <MenuRow
              key={choice.id}
              label={choice.label}
              detail={choice.detail}
              icon={choice.id === 'coven' ? 'community' : 'offer'}
              last={i === SHARE_CHOICES.length - 1}
              onPress={() => {
                const id = sharing;
                setSharing(null);
                if (id) afterSheetCloses(() => router.push(hrefFor(choice.id, id)));
              }}
            />
          ))}
        </MenuList>
      </Sheet>
    </>
  );
}
