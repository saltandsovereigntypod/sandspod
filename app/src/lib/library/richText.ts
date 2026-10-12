// My Practice written on the website is HTML from its rich-text boxes
// (grimoire/js/app.js "book-rich-input", altar/js/features/objects.js): bold,
// italic, underline, bullet and numbered lists, quotes, and a <div> or <br>
// per line. The app has no HTML view, so this reads that markup into plain
// blocks of styled runs. Nothing is executed or fetched; unknown tags are
// dropped and only their text is kept. Pure, so it can be tested.

export type RichRun = { text: string; bold?: boolean; italic?: boolean; underline?: boolean };
export type RichBlock = { kind: 'paragraph' | 'bullet' | 'number' | 'quote'; runs: RichRun[]; number?: number };

/** Same test the website uses before showing a value as chips. */
export const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : whole;
    }
    return NAMED[code.toLowerCase()] ?? whole;
  });
}

const BLOCK_TAGS = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'pre']);

/** Rich-text HTML as blocks; plain text comes back one paragraph per line, unchanged. */
export function richTextBlocks(value: string): RichBlock[] {
  const source = String(value ?? '');
  if (!looksLikeHtml(source)) {
    return source
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => ({ kind: 'paragraph' as const, runs: [{ text: line }] }));
  }

  const blocks: RichBlock[] = [];
  const lists: { ordered: boolean; count: number }[] = [];
  let bold = 0;
  let italic = 0;
  let underline = 0;
  let quote = 0;
  let skip = 0;
  let current = null as RichBlock | null;

  const close = () => {
    if (current) {
      // Trim the block's edges, then drop it if nothing is left.
      const runs = current.runs;
      while (runs.length && !runs[0].text.trim()) runs.shift();
      while (runs.length && !runs[runs.length - 1].text.trim()) runs.pop();
      if (runs.length) {
        runs[0].text = runs[0].text.replace(/^[ \t]+/, '');
        runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/[ \t]+$/, '');
        blocks.push(current);
      }
    }
    current = null;
  };
  const open = (block: RichBlock) => {
    close();
    current = block;
  };
  const write = (text: string) => {
    if (!text) return;
    if (!current) current = { kind: quote ? 'quote' : 'paragraph', runs: [] };
    const run: RichRun = { text };
    if (bold) run.bold = true;
    if (italic) run.italic = true;
    if (underline) run.underline = true;
    const last = current.runs[current.runs.length - 1];
    if (last && !!last.bold === !!run.bold && !!last.italic === !!run.italic && !!last.underline === !!run.underline) {
      last.text += text;
    } else {
      current.runs.push(run);
    }
  };

  const tokens = source.match(/<!--[\s\S]*?-->|<\/?[a-z][^>]*>|[^<]+|</gi) ?? [];
  for (const token of tokens) {
    if (token.startsWith('<!--')) continue;
    const tag = /^<(\/?)([a-z][a-z0-9]*)/i.exec(token);
    if (!tag) {
      if (!skip) write(decodeEntities(token.replace(/\s+/g, ' ')));
      continue;
    }
    const closing = tag[1] === '/';
    const name = tag[2].toLowerCase();
    if (name === 'script' || name === 'style') {
      skip = Math.max(0, skip + (closing ? -1 : 1));
      continue;
    }
    if (skip) continue;
    const step = closing ? -1 : 1;
    if (name === 'b' || name === 'strong') bold = Math.max(0, bold + step);
    else if (name === 'i' || name === 'em') italic = Math.max(0, italic + step);
    else if (name === 'u') underline = Math.max(0, underline + step);
    else if (name === 'br') {
      // A line break inside a list item or quote stays in it; elsewhere it starts a new line.
      if (current && current.kind !== 'paragraph') write('\n');
      else close();
    } else if (name === 'ul' || name === 'ol') {
      close();
      if (closing) lists.pop();
      else lists.push({ ordered: name === 'ol', count: 0 });
    } else if (name === 'li') {
      if (closing) close();
      else {
        const list = lists[lists.length - 1];
        if (list?.ordered) open({ kind: 'number', runs: [], number: ++list.count });
        else open({ kind: 'bullet', runs: [] });
      }
    } else if (name === 'blockquote') {
      close();
      quote = Math.max(0, quote + step);
    } else if (BLOCK_TAGS.has(name)) {
      // Inside a list item a <div> or <p> just continues the item.
      if (!(current && current.kind !== 'paragraph' && current.kind !== 'quote')) close();
      if (name.startsWith('h') && !closing) bold += 1;
      else if (name.startsWith('h') && closing) bold = Math.max(0, bold - 1);
    }
  }
  close();
  return blocks;
}

/** The same blocks as plain lines: "• " for bullets, "1. " for numbered items. */
export function blocksToPlainText(blocks: RichBlock[]): string {
  return blocks
    .map((block) => {
      const text = block.runs.map((run) => run.text).join('');
      if (block.kind === 'bullet') return `• ${text}`;
      if (block.kind === 'number') return `${block.number}. ${text}`;
      return text;
    })
    .join('\n');
}

/** Rich-text HTML as readable plain text; plain text is returned as it is. */
export function richTextToPlain(value: string): string {
  const source = String(value ?? '');
  return looksLikeHtml(source) ? blocksToPlainText(richTextBlocks(source)) : source;
}
