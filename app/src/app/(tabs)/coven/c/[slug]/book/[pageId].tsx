import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { useReport } from '../../../../../../components/covens/ui';
import { useCovenBook } from '../../../../../../components/grimoire/covenBook';
import { GrimoirePageScreen } from '../../../../../../components/grimoire/PageScreen';
import { useGrimoireScope } from '../../../../../../components/grimoire/scope';
import { MenuList, MenuRow } from '../../../../../../components/more/ui';
import { accessSummary } from '../../../../../../lib/grimoire/access';
import { pageChain } from '../../../../../../lib/grimoire/coven';
import { shareCredit } from '../../../../../../lib/grimoire/submissions';
import { bookAttribution } from '../../../../../../lib/covens/lineage';
import { blockMetadata } from '../../../../../../lib/grimoire/structure';
import type { PageRow } from '../../../../../../lib/grimoire/types';
import { colors, radius, type } from '../../../../../../theme';

// A page of the coven's book: read as any grimoire page, with who shared it,
// who can open it, where it's used (pages that link to it, rites that read
// its words), its history for those who write in it, and suggesting changes
// for those who don't.
export default function CovenBookPage() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  return <GrimoirePageScreen pageId={String(pageId ?? '')} extras={(page) => <PageExtras page={page} />} />;
}

function PageExtras({ page }: { page: PageRow }) {
  const { coven, snapshot, canPage, href } = useCovenBook();
  const scope = useGrimoireScope();
  const report = useReport(coven.userId);
  const ranks = coven.snapshot?.ranks ?? [];
  const credit = shareCredit(page as PageRow & { shared_by?: string | null }, coven.nameOf);
  const write = canPage(page, 'write');
  const approve = canPage(page, 'approve');
  const view = canPage(page, 'view');

  // Where it's used: pages of the book that link here (only those you can open), and rites that read its words.
  const linkedFrom = (snapshot?.pages ?? []).filter(
    (p) =>
      p.id !== page.id &&
      ((snapshot?.links ?? []).some((l) => l.source_page_id === p.id && l.target_page_id === page.id) ||
        (snapshot?.blocks ?? []).some((b) => b.page_id === p.id && b.block_type === 'page_link' && blockMetadata(b).target_page_id === page.id)),
  );
  const ritualIds = new Set(coven.steps.filter((s) => (s.details as { book_page_id?: string } | null)?.book_page_id === page.id).map((s) => s.ritual_id));
  const rites = coven.rituals.filter((r) => ritualIds.has(r.id));
  const author = (page as PageRow & { user_id?: string | null }).user_id;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        {!!bookAttribution(page?.metadata) && <Text style={type.caption}>{bookAttribution(page?.metadata)}</Text>}
        {!!credit && <Text style={type.body}>{credit}</Text>}
        {!credit && !!author && <Text style={type.caption}>Begun by {coven.nameOf(author)}</Text>}
        <Text style={type.caption}>{accessSummary(pageChain(snapshot, page), ranks, coven.nameOf)}</Text>
        <View style={styles.row}>
          {approve && <Button label="Who can open it" variant="outline" onPress={() => router.push(`${href('access')}?kind=page&id=${page.id}` as never)} />}
          {write && <Button label="History" variant="outline" onPress={() => router.push(href(`history/${page.id}`) as never)} />}
          {view && !write && coven.standing.ok && <Button label="Suggest changes" variant="outline" onPress={() => router.push(`${href('suggest')}?pageId=${page.id}` as never)} />}
          {!!author && author !== coven.userId && (
            <Button label="Report" variant="text" onPress={() => report.open({ target_type: 'book_page', target_id: page.id, coven_id: coven.snapshot?.coven.id ?? '', target_user_id: author, label: 'this page' })} />
          )}
        </View>
      </View>

      {(linkedFrom.length > 0 || rites.length > 0) && (
        <View style={styles.used}>
          <Text style={type.eyebrow}>Where it’s used</Text>
          <MenuList>
            {linkedFrom.map((p, i) => (
              <MenuRow key={p.id} label={p.title} detail="A page that links here" last={i === linkedFrom.length - 1 && !rites.length} onPress={() => router.push(scope.page(p.id))} />
            ))}
            {rites.map((r, i) => (
              <MenuRow key={r.id} label={r.title} detail={r.kind === 'meeting' ? 'A meeting that reads its words' : 'A rite that reads its words'} last={i === rites.length - 1} onPress={() => router.push(`/coven/c/${coven.slug}/ritual/${r.id}` as never)} />
            ))}
          </MenuList>
        </View>
      )}
      {report.sheet}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16, paddingHorizontal: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  used: { gap: 8 },
});
