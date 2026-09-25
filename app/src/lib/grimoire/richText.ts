// The website stores block text as plain text or as a small, sanitized subset
// of HTML (b, strong, i, em, u, br, a, span — see grimoire/js/core/utils.js).
// This turns either into styled runs React Native can render. Anything that
// isn't one of those tags is dropped and only its text kept, like the site.

export type Run = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  href?: string;
};

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  '#39': "'",
};

export function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+|#39);/gi, (match, code: string) => {
    const lower = code.toLowerCase();
    if (lower in ENTITIES) return ENTITIES[lower];
    if (lower.startsWith('#x')) return String.fromCodePoint(parseInt(lower.slice(2), 16));
    if (lower.startsWith('#')) return String.fromCodePoint(parseInt(lower.slice(1), 10));
    return match;
  });
}

type Style = Omit<Run, 'text'>;

export function parseRichText(input: string | null | undefined): Run[] {
  const source = String(input ?? '');
  const runs: Run[] = [];
  const stack: { tag: string; style: Style }[] = [];
  const current = (): Style => stack.at(-1)?.style ?? {};

  const push = (text: string) => {
    if (!text) return;
    const style = current();
    const last = runs.at(-1);
    if (last && sameStyle(last, style)) last.text += text;
    else runs.push({ text, ...style });
  };

  const tagPattern = /<\s*(\/)?\s*([a-z0-9]+)([^>]*)>/gi;
  let index = 0;
  for (let match = tagPattern.exec(source); match; match = tagPattern.exec(source)) {
    push(decodeEntities(source.slice(index, match.index)));
    index = tagPattern.lastIndex;

    const closing = !!match[1];
    const tag = match[2].toLowerCase();
    const attrs = match[3] ?? '';

    if (tag === 'br') {
      push('\n');
      continue;
    }
    if (closing) {
      const at = stack.map((s) => s.tag).lastIndexOf(tag);
      if (at >= 0) stack.splice(at);
      if (tag === 'p' || tag === 'div') push('\n');
      continue;
    }
    if (attrs.trim().endsWith('/')) continue;

    const style: Style = { ...current() };
    if (tag === 'b' || tag === 'strong') style.bold = true;
    else if (tag === 'i' || tag === 'em') style.italic = true;
    else if (tag === 'u') style.underline = true;
    else if (tag === 'a') {
      const href = /href\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1];
      if (href && /^https?:\/\//i.test(href)) style.href = decodeEntities(href);
    }
    stack.push({ tag, style });
  }
  push(decodeEntities(source.slice(index)));

  // Trim leading/trailing blank lines left by block tags.
  if (runs.length) {
    runs[0].text = runs[0].text.replace(/^\n+/, '');
    const last = runs[runs.length - 1];
    last.text = last.text.replace(/\n+$/, '');
  }
  return runs.filter((run) => run.text.length > 0);
}

export function plainText(input: string | null | undefined): string {
  return parseRichText(input)
    .map((run) => run.text)
    .join('');
}

/** List blocks store one item per line. */
export function listItems(input: string | null | undefined): string[] {
  return plainText(input)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function sameStyle(a: Style, b: Style): boolean {
  return !!a.bold === !!b.bold && !!a.italic === !!b.italic && !!a.underline === !!b.underline && a.href === b.href;
}
