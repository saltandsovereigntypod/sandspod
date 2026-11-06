import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../components/Button';
import { Body, Card, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, tell, ui } from '../../../components/rituals/ui';
import { fullDate } from '../../../lib/calendar';
import { printableHtml, printablePages, printFileName } from '../../../lib/grimoire/printBook';
import { printBook, PRINTS_DIRECTLY } from '../../../lib/grimoire/printFile';
import { useGrimoire } from '../../../lib/grimoire/store';
import { localDateKey } from '../../../lib/rituals/lifecycle';

// A printable Book of Shadows: choose books, sections and pages, then print or save as PDF.
export default function PrintBook() {
  const { snapshot, status } = useGrimoire();
  const all = useMemo(() => (snapshot ? printablePages(snapshot) : []), [snapshot]);
  const [chosen, setChosen] = useState<Set<string> | null>(null);
  const picked = chosen ?? new Set(all.map((p) => p.page.id));
  const [title, setTitle] = useState('Book of Shadows');
  const [subtitle, setSubtitle] = useState('');
  const [owner, setOwner] = useState('');
  const [contents, setContents] = useState(true);
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => {
    const out: { key: string; label: string; ids: string[] }[] = [];
    for (const p of all) {
      const key = `${p.book}|${p.section ?? ''}`;
      let g = out.find((x) => x.key === key);
      if (!g) out.push((g = { key, label: [snapshot && snapshot.books.length > 1 ? p.book : '', p.section ?? 'Not in a section'].filter(Boolean).join(' · '), ids: [] }));
      g.ids.push(p.page.id);
    }
    return out;
  }, [all, snapshot]);

  const toggle = (ids: string[], on: boolean) => {
    const next = new Set(picked);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    setChosen(next);
  };

  const print = async () => {
    if (!snapshot || !picked.size) return;
    setBusy(true);
    try {
      const today = localDateKey(new Date());
      const html = printableHtml(snapshot, [...picked], { title, subtitle, owner, contents, printedOn: `Printed ${fullDate(today)}` });
      const result = await printBook(html, printFileName(title, today));
      if (result === 'unavailable') tell('Can’t share from this phone', 'Open the Grimoire on the website (saltandsovereignty.com/grimoire) to print it.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <RitualScreen back="Grimoire">
      <Title eyebrow="Grimoire">Print your Book of Shadows</Title>
      <Body muted>Choose the pages to print. They come out in the Grimoire’s own order, with a title page, a contents list, and each page on a fresh sheet.</Body>
      {!snapshot ? (
        <Body muted>{status === 'loading' ? 'Opening your Grimoire…' : 'Sign in and open your Grimoire first; its pages are kept with your account.'}</Body>
      ) : all.length === 0 ? (
        <Card>
          <Body>There are no pages to print yet.</Body>
        </Card>
      ) : (
        <>
          <View style={ui.gap}>
            <Field label="Title" value={title} onChange={setTitle} />
            <Field label="Under the title (optional)" value={subtitle} onChange={setSubtitle} placeholder="The workings of the hearth, 2026" />
            <Field label="Whose book (optional)" value={owner} onChange={setOwner} placeholder="Your name or craft name" />
            <Toggle label="A contents list" value={contents} onChange={setContents} />
          </View>
          <View style={ui.actions}>
            <Button label="Every page" variant="outline" onPress={() => setChosen(new Set(all.map((p) => p.page.id)))} />
            <Button label="None" variant="text" onPress={() => setChosen(new Set())} />
          </View>
          {groups.map((g) => {
            const on = g.ids.filter((id) => picked.has(id)).length;
            return (
              <View key={g.key} style={ui.gapSmall}>
                <SectionLabel>{`${g.label} · ${on} of ${g.ids.length}`}</SectionLabel>
                <Chips>
                  <Chip label={on === g.ids.length ? 'All in this section ✓' : 'All in this section'} onPress={() => toggle(g.ids, on !== g.ids.length)} />
                  {g.ids.map((id) => {
                    const page = all.find((p) => p.page.id === id)!.page;
                    return <Chip key={id} label={page.title || 'Untitled page'} selected={picked.has(id)} onPress={() => toggle([id], !picked.has(id))} />;
                  })}
                </Chips>
              </View>
            );
          })}
          <Button label={busy ? 'Preparing…' : PRINTS_DIRECTLY ? `Print or save as PDF (${picked.size})` : `Share to print or save (${picked.size})`} onPress={() => void print()} disabled={busy || !picked.size} />
          <Notice>
            {PRINTS_DIRECTLY
              ? 'Your browser’s print window opens with the book. Choose a printer, or “Save as PDF”.'
              : 'Phones hand the book over as a web page: open it in your browser, then use Share → Print (or Save as PDF). For the fullest control, print from the website.'}
          </Notice>
          <Body muted>Sigils drawn in the app and private notes stay out of print; images print when they’re online.</Body>
        </>
      )}
      <Button label="Back to the Grimoire" variant="text" onPress={() => router.back()} />
    </RitualScreen>
  );
}
