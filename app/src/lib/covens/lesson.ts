// Lessons: the small Markdown a coven's lessons are written in (the subset
// app/src/lib/covens/courses/types.ts describes), read the same way by the
// app (components/covens/Lesson.tsx draws the blocks) and the website
// (SaltCore.covens.lesson.toHtml). Pure.
//
//   # / ## / ###     headings
//   blank lines      paragraphs
//   - item           bulleted list      1. item   numbered list
//   **bold**  *italic*
//   > text           a callout; "**Safety:**", "**Try this:**", "**Note:**" or "**Your coven:**" first labels it
//   ---              a divider
// Anything else (tables, links, images, HTML) is shown as plain words.

export type Span = { text: string; bold?: boolean; italic?: boolean };
export type CalloutKind = 'safety' | 'try' | 'note' | 'coven' | 'plain';
export type Block =
  | { type: 'heading'; level: 1 | 2 | 3; spans: Span[] }
  | { type: 'paragraph'; spans: Span[] }
  | { type: 'list'; ordered: boolean; start: number; items: Span[][] }
  | { type: 'callout'; kind: CalloutKind; label: string | null; blocks: Block[] }
  | { type: 'divider' };

const LABELS: Record<string, CalloutKind> = { safety: 'safety', 'try this': 'try', note: 'note', 'your coven': 'coven' };

/** **bold**, *italic* and ***both*** into runs of text. Unpaired stars stay as they are. */
export function parseInline(text: string): Span[] {
  const spans: Span[] = [];
  const push = (t: string, bold = false, italic = false) => {
    if (!t) return;
    const last = spans[spans.length - 1];
    if (last && !!last.bold === bold && !!last.italic === italic) last.text += t;
    else spans.push({ text: t, ...(bold ? { bold } : {}), ...(italic ? { italic } : {}) });
  };
  const re = /\*\*\*([^*]+?)\*\*\*|\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*/g;
  let at = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    push(text.slice(at, m.index));
    if (m[1] !== undefined) push(m[1], true, true);
    else if (m[2] !== undefined) {
      // Italic inside bold: **a *b* c**
      for (const inner of parseInline(m[2])) push(inner.text, true, !!inner.italic);
    } else push(m[3], false, true);
    at = m.index + m[0].length;
  }
  push(text.slice(at));
  return spans;
}

const BULLET = /^\s*[-*+]\s+(.*)$/;
const NUMBERED = /^\s*(\d{1,3})[.)]\s+(.*)$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const DIVIDER = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;

/** A lesson's body as blocks. */
export function parseLesson(body: string | null | undefined): Block[] {
  const lines = String(body ?? '').replace(/\r\n?/g, '\n').split('\n');
  return parseLines(lines, true);
}

function parseLines(lines: string[], callouts: boolean): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; start: number; items: string[] } | null = null;
  const flushPara = () => {
    if (para.length) blocks.push({ type: 'paragraph', spans: parseInline(para.join(' ').replace(/\s+/g, ' ').trim()) });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: 'list', ordered: list.ordered, start: list.start, items: list.items.map((i) => parseInline(i.trim())) });
    list = null;
  };
  const flush = () => {
    flushPara();
    flushList();
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      flush();
      continue;
    }
    if (callouts && /^\s*>/.test(line)) {
      flush();
      const inner: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        inner.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      i -= 1;
      blocks.push(callout(inner));
      continue;
    }
    if (DIVIDER.test(line)) {
      flush();
      blocks.push({ type: 'divider' });
      continue;
    }
    const h = HEADING.exec(line);
    if (h) {
      flush();
      blocks.push({ type: 'heading', level: Math.min(3, h[1].length) as 1 | 2 | 3, spans: parseInline(h[2]) });
      continue;
    }
    const b = BULLET.exec(line);
    const n = NUMBERED.exec(line);
    if (b || n) {
      flushPara();
      const ordered = !!n;
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, start: n ? Number(n[1]) : 1, items: [] };
      }
      list.items.push(b ? b[1] : n![2]);
      continue;
    }
    if (list && /^\s{2,}\S/.test(line)) {
      // A wrapped list item carries on.
      list.items[list.items.length - 1] += ` ${line.trim()}`;
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flush();
  return blocks;
}

function callout(lines: string[]): Block {
  const first = lines.findIndex((l) => l.trim());
  let label: string | null = null;
  let kind: CalloutKind = 'plain';
  if (first >= 0) {
    const m = /^\s*\*\*([^*]{1,40}?):\*\*\s*/.exec(lines[first]) || /^\s*\*\*([^*]{1,40}?)\*\*:\s*/.exec(lines[first]);
    if (m) {
      label = m[1].trim();
      kind = LABELS[label.toLowerCase()] ?? 'plain';
      lines = [...lines];
      lines[first] = lines[first].slice(m[0].length);
    }
  }
  return { type: 'callout', kind, label, blocks: parseLines(lines, false) };
}

/** The words of a lesson, for its reading time when none is given. */
export function wordCount(body: string | null | undefined): number {
  return (String(body ?? '').match(/[A-Za-z0-9À-ɏ'’]+/g) || []).length;
}

/** "About 12 minutes": the lesson's own time, or its words at 200 a minute. */
export function readingTime(doc: { minutes?: number | null; body?: string | null }): string {
  const minutes = doc.minutes && doc.minutes > 0 ? doc.minutes : Math.max(1, Math.round(wordCount(doc.body) / 200));
  return `About ${minutes} minute${minutes === 1 ? '' : 's'}`;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function spansHtml(spans: Span[]): string {
  return spans
    .map((s) => {
      let t = esc(s.text);
      if (s.italic) t = `<em>${t}</em>`;
      if (s.bold) t = `<strong>${t}</strong>`;
      return t;
    })
    .join('');
}

/** The website's HTML for a lesson's blocks (headings start at h3, under the lesson's own title). */
export function toHtml(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'heading':
          return `<h${b.level + 2} class="ls-h ls-h${b.level}">${spansHtml(b.spans)}</h${b.level + 2}>`;
        case 'paragraph':
          return `<p>${spansHtml(b.spans)}</p>`;
        case 'list':
          return b.ordered
            ? `<ol class="ls-list"${b.start !== 1 ? ` start="${b.start}"` : ''}>${b.items.map((i) => `<li>${spansHtml(i)}</li>`).join('')}</ol>`
            : `<ul class="ls-list">${b.items.map((i) => `<li>${spansHtml(i)}</li>`).join('')}</ul>`;
        case 'callout':
          return `<aside class="ls-callout ls-callout--${b.kind}">${b.label ? `<p class="ls-callout__label">${esc(b.label)}</p>` : ''}${toHtml(b.blocks)}</aside>`;
        case 'divider':
          return '<hr class="ls-divider" />';
      }
    })
    .join('');
}

/** A lesson body straight to the website's HTML. */
export const lessonHtml = (body: string | null | undefined) => toHtml(parseLesson(body));

/** What a lesson body uses that the lessons' Markdown doesn't have (for checks on written courses). */
export function unsupported(body: string): string[] {
  const found: string[] = [];
  if (/^\s*\|.*\|\s*$/m.test(body)) found.push('a table');
  if (/!\[[^\]]*\]\(/.test(body)) found.push('an image');
  if (/\[[^\]]+\]\([^)]+\)/.test(body)) found.push('a link');
  if (/<\/?[a-z][^>]*>/i.test(body)) found.push('HTML');
  if (/^ {2,}([-+]|\d+\.)\s/m.test(body)) found.push('a nested list');
  return found;
}
