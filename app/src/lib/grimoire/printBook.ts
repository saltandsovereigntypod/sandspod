// A printable Book of Shadows: the books, sections and pages you choose from
// your Grimoire, laid out for paper as one HTML document with a title page,
// a contents list and each page starting on a fresh sheet. The same document
// is printed (or saved as a PDF) from the browser, and handed to a phone's
// share sheet as a file to open and print. Pure, so it can be tested and
// shared with the website (js/core/spirit.js).

import { parseRichText, type Run } from './richText.ts';
import { blockMetadata, blockSource, pageBlocks, tableOfContents } from './structure.ts';
import type { BlockRow, GrimoireSnapshot, PageRow } from './types.ts';

export type PrintOptions = {
  title: string;
  subtitle: string;
  /** Whose book it is, for the title page; blank leaves it off. */
  owner: string;
  contents: boolean;
  /** Printed on the title page: "Printed 6 November 2026". */
  printedOn: string;
};

export type PrintPage = { page: PageRow; section: string | null; book: string };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Every page of every book, in reading order, with its section and book, for choosing. */
export function printablePages(snapshot: GrimoireSnapshot): PrintPage[] {
  const out: PrintPage[] = [];
  for (const book of snapshot.books) {
    for (const group of tableOfContents(snapshot, book.id)) {
      for (const page of group.pages) out.push({ page, section: group.section?.title ?? null, book: book.title });
    }
  }
  return out;
}

/** Ids chosen by book or section: every page under them. */
export function pagesUnder(snapshot: GrimoireSnapshot, by: { bookId?: string; sectionId?: string }): string[] {
  return snapshot.pages.filter((p) => (by.bookId ? p.book_id === by.bookId : true) && (by.sectionId ? p.section_id === by.sectionId : true)).map((p) => p.id);
}

function runsHtml(runs: Run[]): string {
  return runs
    .map((r) => {
      let t = esc(r.text).replace(/\n/g, '<br>');
      if (r.bold) t = `<strong>${t}</strong>`;
      if (r.italic) t = `<em>${t}</em>`;
      if (r.underline) t = `<u>${t}</u>`;
      return t;
    })
    .join('');
}

const lines = (source: string) =>
  parseRichText(source)
    .map((r) => r.text)
    .join('')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

function blockHtml(block: BlockRow, titleOf: (id: string) => string | null): string {
  const source = blockSource(block);
  const meta = blockMetadata(block);
  switch (block.block_type) {
    case 'heading':
      return `<h3>${runsHtml(parseRichText(source))}</h3>`;
    case 'quote':
      return `<blockquote>${runsHtml(parseRichText(source))}</blockquote>`;
    case 'callout':
      return `<aside>${runsHtml(parseRichText(source))}</aside>`;
    case 'divider':
      return '<hr>';
    case 'bulleted_list':
    case 'ingredient_list':
      return `<ul>${lines(source).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
    case 'numbered_list':
      return `<ol>${lines(source).map((l) => `<li>${esc(l)}</li>`).join('')}</ol>`;
    case 'checklist':
      return `<ul class="check">${lines(source).map((l) => `<li>${esc(l.replace(/^\[( |x)\]\s*/i, ''))}</li>`).join('')}</ul>`;
    case 'image': {
      const src = typeof meta.url === 'string' ? meta.url : lines(source).join('');
      const caption = typeof meta.caption === 'string' ? meta.caption : '';
      if (meta.sigil) return `<p class="see">A sigil${caption ? `: ${esc(caption)}` : ''} (drawn in the app; not printed).</p>`;
      if (!/^https?:\/\//.test(src)) return '';
      const alt = typeof meta.alt === 'string' ? meta.alt : caption;
      return `<figure><img src="${esc(src)}" alt="${esc(alt)}">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
    }
    case 'page_link': {
      const target = typeof meta.target_page_id === 'string' ? titleOf(meta.target_page_id) : null;
      const label = typeof meta.label === 'string' && meta.label ? meta.label : target;
      return label ? `<p class="see">See: ${esc(label)}</p>` : '';
    }
    default: {
      if (!source || source.startsWith('data:')) return '';
      const runs = parseRichText(source);
      return runs.length ? `<p>${runsHtml(runs)}</p>` : '';
    }
  }
}

const CSS = `
@page { size: A4; margin: 22mm 20mm; }
* { box-sizing: border-box; }
html { background: #fff; }
body { margin: 0; color: #1d1a16; font: 11.5pt/1.55 "Source Serif 4", Georgia, "Times New Roman", serif; }
main { max-width: 170mm; margin: 0 auto; padding: 12mm 0; }
h1, h2, h3 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 600; line-height: 1.2; break-after: avoid; }
.title { min-height: 230mm; display: flex; flex-direction: column; justify-content: center; text-align: center; }
.title h1 { font-size: 34pt; margin: 0 0 6mm; }
.title .sub { font-style: italic; font-size: 14pt; margin: 0 0 14mm; }
.title .mark { font-size: 20pt; letter-spacing: 0.4em; color: #8a7136; }
.title .small { font-size: 10pt; color: #5c554b; }
.contents h2, .page h2 { font-size: 22pt; margin: 0 0 2mm; }
.contents ol { list-style: none; padding: 0; }
.contents li { display: flex; gap: 2mm; padding: 1mm 0; border-bottom: 0.2mm dotted #b9a05d; }
.contents .sec { margin-top: 4mm; font-weight: 600; border: 0; }
.contents .bk { margin-top: 6mm; font-family: "Cormorant Garamond", Georgia, serif; font-size: 15pt; border: 0; }
.page, .contents { break-before: page; page-break-before: always; }
.where { color: #6b6357; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 6mm; }
h3 { font-size: 15pt; margin: 6mm 0 2mm; }
p { margin: 0 0 3mm; orphans: 3; widows: 3; }
blockquote { margin: 4mm 6mm; font-style: italic; border-left: 0.6mm solid #b9a05d; padding-left: 4mm; }
aside { margin: 4mm 0; padding: 3mm 4mm; border: 0.3mm solid #b9a05d; border-radius: 2mm; break-inside: avoid; }
hr { border: 0; text-align: center; margin: 6mm 0; }
hr::after { content: "✶  ✶  ✶"; color: #8a7136; }
ul.check { list-style: none; padding-left: 0; }
ul.check li::before { content: "☐ "; }
figure { margin: 4mm 0; text-align: center; break-inside: avoid; }
img { max-width: 100%; max-height: 180mm; }
figcaption { font-size: 9.5pt; color: #5c554b; }
.see { font-style: italic; color: #5c554b; }
.empty { color: #6b6357; font-style: italic; }
@media screen { body { background: #f4efe4; } main { background: #fff; padding: 16mm 18mm; margin: 8mm auto; box-shadow: 0 0 0 1px #ddd2b8; } .page, .contents { border-top: 1px dashed #ccc; padding-top: 10mm; margin-top: 10mm; } }
`;

/**
 * The book as one HTML document, the pages in the order chosen ids appear in
 * the Grimoire (books, then sections, then their own order).
 */
export function printableHtml(snapshot: GrimoireSnapshot, chosen: string[], options: PrintOptions): string {
  const want = new Set(chosen);
  const pages = printablePages(snapshot).filter((p) => want.has(p.page.id));
  const titleOf = (id: string) => snapshot.pages.find((p) => p.id === id)?.title ?? null;
  const books = new Set(pages.map((p) => p.book));
  const showBook = books.size > 1;
  const title = options.title.trim() || 'Book of Shadows';

  const contents: string[] = [];
  let lastBook = '';
  let lastSection: string | null = null;
  pages.forEach((p, i) => {
    if (showBook && p.book !== lastBook) {
      contents.push(`<li class="bk">${esc(p.book)}</li>`);
      lastSection = null;
    }
    if (p.section && p.section !== lastSection) contents.push(`<li class="sec">${esc(p.section)}</li>`);
    lastBook = p.book;
    lastSection = p.section;
    contents.push(`<li><a href="#p${i + 1}">${esc(p.page.title || 'Untitled page')}</a></li>`);
  });

  const body = pages
    .map((p, i) => {
      const blocks = pageBlocks(snapshot, p.page.id)
        .map((b) => blockHtml(b, titleOf))
        .filter(Boolean)
        .join('\n');
      const where = [showBook ? p.book : '', p.section ?? ''].filter(Boolean).join(' · ');
      return `<section class="page" id="p${i + 1}"><h2>${esc(p.page.title || 'Untitled page')}</h2>${where ? `<p class="where">${esc(where)}</p>` : ''}${blocks || '<p class="empty">This page is blank.</p>'}</section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><style>${CSS}</style></head>
<body><main>
<section class="title"><p class="mark">☾ ✶ ☽</p><h1>${esc(title)}</h1>${options.subtitle.trim() ? `<p class="sub">${esc(options.subtitle.trim())}</p>` : ''}${options.owner.trim() ? `<p>${esc(options.owner.trim())}</p>` : ''}<p class="small">${esc(options.printedOn)} · ${pages.length} ${pages.length === 1 ? 'page' : 'pages'}</p></section>
${options.contents && pages.length > 1 ? `<section class="contents"><h2>Contents</h2><ol>${contents.join('')}</ol></section>` : ''}
${body}
</main></body></html>`;
}

/** A file name for the book: "book-of-shadows-2026-11-06.html". */
export function printFileName(title: string, dateKey: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `${slug || 'book-of-shadows'}-${dateKey}.html`;
}
