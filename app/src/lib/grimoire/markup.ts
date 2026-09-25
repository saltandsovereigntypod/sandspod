// Rich blocks are stored as the website's small HTML subset (b, i, u, a, br;
// see grimoire/js/core/utils.js sanitizeHtml). A phone text field can't edit
// HTML, so the editor shows a light markup instead and converts both ways:
//
//   **bold**   *italic*   __underline__   [label](https://link)
//
// Markers toggle a style on and off, so nesting in any order works. A marker
// with no partner is kept as a literal character, and a backslash keeps the
// next character literal (the converter adds these for stray * and [ ).

import { parseRichText, type Run } from './richText.ts';

type Style = Omit<Run, 'text'>;
type Toggle = 'bold' | 'italic' | 'underline';

const MARKERS: Record<Toggle, string> = { bold: '**', italic: '*', underline: '__' };
const ORDER: Toggle[] = ['underline', 'bold', 'italic'];

// ---------------------------------------------------------------------------
// HTML → markup

function escapeText(text: string, inLink: boolean): string {
  let out = text.replace(/\\/g, '\\\\').replace(/\*/g, '\\*').replace(/\[/g, '\\[');
  if (inLink) out = out.replace(/\]/g, '\\]');
  // A lone underscore is ordinary text; only pairs (and edges, which could join
  // a neighbouring __ marker) need escaping.
  out = out.replace(/_{2,}/g, (m) => '\\_'.repeat(m.length));
  out = out.replace(/^_/, '\\_').replace(/(^|[^\\])_$/, '$1\\_');
  return out;
}

function renderStyled(runs: Run[], inLink: boolean): string {
  let out = '';
  const open = new Set<Toggle>();
  for (const run of runs) {
    for (const t of ORDER) {
      const want = !!run[t];
      if (want !== open.has(t)) {
        out += MARKERS[t];
        if (want) open.add(t);
        else open.delete(t);
      }
    }
    out += escapeText(run.text, inLink);
  }
  for (const t of [...ORDER].reverse()) if (open.has(t)) out += MARKERS[t];
  return out;
}

/** Stored block HTML (or plain text) → the markup the editor shows. */
export function htmlToMarkup(html: string | null | undefined): string {
  const runs = parseRichText(html);
  let out = '';
  let i = 0;
  while (i < runs.length) {
    const href = runs[i].href;
    let j = i;
    while (j < runs.length && runs[j].href === href) j++;
    const group = runs.slice(i, j);
    out += href ? `[${renderStyled(group, true)}](${href})` : renderStyled(group, false);
    i = j;
  }
  return out;
}

// ---------------------------------------------------------------------------
// markup → runs → HTML

type Token = { kind: 'text'; text: string } | { kind: 'marker'; toggle: Toggle; raw: string } | { kind: 'link'; label: string; href: string };

const LINK = /^\[((?:\\.|[^\]\\])*)\]\((https?:\/\/[^\s)]+)\)/i;

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const text = (t: string) => {
    const last = tokens.at(-1);
    if (last?.kind === 'text') last.text += t;
    else tokens.push({ kind: 'text', text: t });
  };
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '\\' && i + 1 < source.length) {
      text(source[i + 1]);
      i += 2;
    } else if (source.startsWith('**', i)) {
      tokens.push({ kind: 'marker', toggle: 'bold', raw: '**' });
      i += 2;
    } else if (ch === '*') {
      tokens.push({ kind: 'marker', toggle: 'italic', raw: '*' });
      i += 1;
    } else if (source.startsWith('__', i)) {
      tokens.push({ kind: 'marker', toggle: 'underline', raw: '__' });
      i += 2;
    } else if (ch === '[') {
      const m = LINK.exec(source.slice(i));
      if (m) {
        tokens.push({ kind: 'link', label: m[1], href: m[2] });
        i += m[0].length;
      } else {
        text('[');
        i += 1;
      }
    } else {
      text(ch);
      i += 1;
    }
  }
  // An odd number of one kind of marker: the last one has no partner, so it's text.
  for (const toggle of ORDER) {
    const at = tokens.flatMap((t, idx) => (t.kind === 'marker' && t.toggle === toggle ? [idx] : []));
    if (at.length % 2 === 1) {
      const idx = at[at.length - 1];
      tokens[idx] = { kind: 'text', text: (tokens[idx] as { raw: string }).raw };
    }
  }
  return tokens;
}

function sameStyle(a: Style, b: Style): boolean {
  return !!a.bold === !!b.bold && !!a.italic === !!b.italic && !!a.underline === !!b.underline && a.href === b.href;
}

function parseInto(source: string, base: Style, runs: Run[]): void {
  const style: Style = { ...base };
  for (const token of tokenize(source)) {
    if (token.kind === 'marker') {
      style[token.toggle] = !style[token.toggle];
    } else if (token.kind === 'link') {
      parseInto(token.label || token.href, { ...style, href: token.href }, runs);
    } else if (token.text) {
      const clean: Style = {};
      if (style.bold) clean.bold = true;
      if (style.italic) clean.italic = true;
      if (style.underline) clean.underline = true;
      if (style.href) clean.href = style.href;
      const last = runs.at(-1);
      if (last && sameStyle(last, clean)) last.text += token.text;
      else runs.push({ text: token.text, ...clean });
    }
  }
}

export function parseMarkup(markup: string): Run[] {
  const runs: Run[] = [];
  parseInto(markup, {}, runs);
  return runs;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Runs → HTML using only tags the website's sanitizer keeps. */
export function runsToHtml(runs: Run[]): string {
  return runs
    .map((run) => {
      let html = escapeHtml(run.text).replace(/\r?\n/g, '<br>');
      if (run.italic) html = `<i>${html}</i>`;
      if (run.bold) html = `<b>${html}</b>`;
      if (run.underline) html = `<u>${html}</u>`;
      if (run.href) html = `<a href="${escapeHtml(run.href)}" rel="noopener">${html}</a>`;
      return html;
    })
    .join('');
}

export function markupToHtml(markup: string): string {
  return runsToHtml(parseMarkup(markup));
}

// ---------------------------------------------------------------------------
// Toolbar helpers

export type Selection = { start: number; end: number };

/** Wraps the selection in a style marker (or inserts a placeholder word). */
export function wrapSelection(
  text: string,
  selection: Selection,
  toggle: Toggle,
): { text: string; selection: Selection } {
  const marker = MARKERS[toggle];
  const start = Math.max(0, Math.min(selection.start, selection.end));
  const end = Math.min(text.length, Math.max(selection.start, selection.end));
  const chosen = text.slice(start, end) || { bold: 'bold', italic: 'italic', underline: 'underlined' }[toggle];
  const next = text.slice(0, start) + marker + chosen + marker + text.slice(end);
  return { text: next, selection: { start: start + marker.length, end: start + marker.length + chosen.length } };
}

/** Turns the selection into a link, or inserts the link itself. */
export function insertLink(text: string, selection: Selection, url: string): string {
  const start = Math.max(0, Math.min(selection.start, selection.end));
  const end = Math.min(text.length, Math.max(selection.start, selection.end));
  const label = (text.slice(start, end) || url).replace(/([\\\]])/g, '\\$1');
  return `${text.slice(0, start)}[${label}](${url})${text.slice(end)}`;
}

export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return /^https?:\/\/[^\s)]+\.[^\s)]+$/i.test(withScheme) ? withScheme : null;
}
