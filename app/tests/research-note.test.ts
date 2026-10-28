// A note on our research: the owner's note, the "Send a note" mailto that
// names the page, and the footer on every researched page type.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { HELP } from '../src/lib/help/index.ts';
import { SUPPORT_EMAIL as CONTACT } from '../src/lib/community/model.ts';
import {
  RESEARCH_CARD,
  RESEARCH_CARD_SEEN_KEY,
  RESEARCH_LINE,
  RESEARCH_NOTE,
  RESEARCH_NOTE_HREF,
  researchNoteUrl,
  researchSubject,
  SUPPORT_EMAIL,
} from '../src/lib/research.ts';

const src = (file: string) => readFileSync(join(import.meta.dirname, '..', 'src', file), 'utf8');

const subjectOf = (url: string) => decodeURIComponent(url.split('subject=')[1].split('&')[0]);

test('the note uses the app’s own contact address (More → Contact us)', () => {
  assert.equal(SUPPORT_EMAIL, CONTACT);
  assert.ok(RESEARCH_NOTE.join(' ').includes(CONTACT));
  assert.match(src('app/(tabs)/more/index.tsx'), /mailto:\$\{SUPPORT_EMAIL\}/);
});

test('Send a note names the page in its subject', () => {
  const url = researchNoteUrl('Hekate', 'Deity');
  assert.ok(url.startsWith(`mailto:${CONTACT}?`));
  assert.equal(subjectOf(url), 'Note on: Hekate');
  assert.match(decodeURIComponent(url.split('body=')[1]), /about Hekate \(Deity\)/);
  assert.equal(researchSubject('  The   Fool '), 'Note on: The Fool');
  assert.equal(subjectOf(researchNoteUrl('Closed & living traditions')), 'Note on: Closed & living traditions');
});

test('the note as a whole has its own subject', () => {
  assert.equal(subjectOf(researchNoteUrl()), 'Note on: our research');
  assert.equal(researchSubject(null), 'Note on: our research');
});

test('the words are warm, first person and in the house voice', () => {
  for (const text of [...RESEARCH_NOTE, RESEARCH_LINE, RESEARCH_CARD]) {
    assert.doesNotMatch(text, /!/);
    assert.doesNotMatch(text, /\p{Extended_Pictographic}/u);
  }
  assert.match(RESEARCH_NOTE.join(' '), /to the best of my ability/);
  assert.match(RESEARCH_NOTE.join(' '), /I read everything/);
  assert.ok(RESEARCH_CARD_SEEN_KEY);
});

test('the full note has a screen, reached from More', () => {
  assert.ok(existsSync(join(import.meta.dirname, '..', 'src', `app/(tabs)${RESEARCH_NOTE_HREF}.tsx`)));
  assert.match(src('app/(tabs)/more/index.tsx'), /A note on our research[\s\S]*?\/more\/research/);
});

test('the Living Library opens with the research card the first time', () => {
  // The Library lives in the Grimoire (grimoire/library); More's old route redirects there.
  assert.match(src('components/library/LibraryBrowser.tsx'), /<ResearchCard \/>/);
  assert.match(src('app/(tabs)/grimoire/library/index.tsx'), /<LibraryBrowser/);
  assert.match(src('app/(tabs)/more/library/index.tsx'), /<Redirect href="\/grimoire\/library" \/>/);
  const component = src('components/ResearchNote.tsx');
  assert.match(component, /AsyncStorage\.getItem\(RESEARCH_CARD_SEEN_KEY\)/);
  assert.match(component, /AsyncStorage\.setItem\(RESEARCH_CARD_SEEN_KEY/);
});

test('every researched page type ends with the Send a note footer', () => {
  const pages: Record<string, RegExp> = {
    'components/library/LibraryEntryView.tsx': /<ResearchFooter page=\{entry\.name\}/, // herbs, crystals, deities, candles…
    'app/(tabs)/grimoire/divination/[kind]/[id].tsx': /<ResearchFooter page=\{entry\.name\}/, // tarot, runes, ogham
    'app/(tabs)/today/holy/[ref].tsx': /<ResearchFooter page=\{page\.title\}/, // holidays and festivals
    'app/(tabs)/rituals/journeys/[id].tsx': /<ResearchFooter page=\{journey\.title\}/, // dedication journeys
    'app/(tabs)/rituals/journeys/patron.tsx': /<ResearchFooter page=\{guide\.title\}/, // patron deities
    'app/(tabs)/more/library/closed/index.tsx': /<ResearchFooter page=\{CLOSED_GUIDE_TITLE\}/,
    'app/(tabs)/more/library/closed/[id].tsx': /<ResearchFooter page=\{tradition\.name\}/,
  };
  for (const [file, pattern] of Object.entries(pages)) {
    const text = src(file);
    assert.match(text, /import \{ ResearchFooter \} from '[./]+\/(?:components\/)?ResearchNote'/, file);
    assert.match(text, pattern, file);
  }
  // Every Library entry route shows the same view, so the footer is on all of them.
  for (const tab of ['more', 'today', 'rituals', 'grimoire', 'altar']) {
    assert.match(src(`app/(tabs)/${tab}/library/[entryId].tsx`), /LibraryEntryView/, tab);
  }
});

test('How to explains sending a correction', () => {
  const topic = HELP.flatMap((s) => s.topics).find((t) => t.id === 'send-a-correction');
  assert.ok(topic);
  assert.equal(topic.href, RESEARCH_NOTE_HREF);
  assert.match(topic.steps.join(' '), /Send a note/);
});
