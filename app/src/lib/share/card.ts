// Share as a card: a ritual, spell, Library entry or reading as a styled
// picture (laid out here, drawn by components/share/ShareCardSheet.tsx with
// react-native-svg), as a printable page (the web prints it with its own
// stylesheet), and as plain words for the share sheet. Pure, so it can be tested.

export type ShareCardInput = {
  /** A few words above the title: "A spell", "Living Library · Herb". */
  eyebrow: string;
  title: string;
  /** A line under the title: the intention, a date, the question. */
  subtitle?: string;
  /** Paragraphs or short lines, in order. */
  lines: string[];
  /** Small print at the foot; the app's name is added. */
  footer?: string;
};

export const SHARE_CARD = { width: 1080, height: 1350, margin: 84 } as const;
export const APP_LINE = 'Salt & Sovereignty';

/** Split text into lines of at most `max` characters, at spaces; a word longer than a line is cut. */
export function wrapText(text: string, max: number): string[] {
  const out: string[] = [];
  for (const para of text.split(/\r?\n/)) {
    let line = '';
    for (const raw of para.split(/\s+/).filter(Boolean)) {
      let word = raw;
      while (word.length > max) {
        if (line) {
          out.push(line);
          line = '';
        }
        out.push(word.slice(0, max));
        word = word.slice(max);
      }
      if (!line) line = word;
      else if (line.length + 1 + word.length <= max) line += ` ${word}`;
      else {
        out.push(line);
        line = word;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

export type CardLine = { text: string; y: number; size: number; kind: 'eyebrow' | 'title' | 'subtitle' | 'body' | 'footer' };

const clip = (lines: string[], n: number) => (lines.length > n ? [...lines.slice(0, n - 1), `${lines[n - 1].replace(/[\s,.;:]+$/, '').slice(0, 60)}…`] : lines);

/**
 * Where each line of the card goes, in a 1080 × 1350 picture: the eyebrow,
 * a title of up to three lines, the subtitle, then as much of the body as
 * fits (the last line ends in … when there's more), and the footer.
 */
export function layoutCard(input: ShareCardInput): CardLine[] {
  const { height, margin } = SHARE_CARD;
  const out: CardLine[] = [];
  let y = margin + 40;
  out.push({ text: input.eyebrow.toUpperCase(), y, size: 30, kind: 'eyebrow' });
  y += 92;
  for (const t of clip(wrapText(input.title, 24), 3)) {
    out.push({ text: t, y, size: 76, kind: 'title' });
    y += 86;
  }
  if (input.subtitle) {
    y += 6;
    for (const t of clip(wrapText(input.subtitle, 44), 3)) {
      out.push({ text: t, y, size: 36, kind: 'subtitle' });
      y += 48;
    }
  }
  y += 40;
  const footerY = height - margin;
  const room = Math.max(0, Math.floor((footerY - 80 - y) / 46));
  const body: string[] = [];
  for (const para of input.lines.map((l) => l.trim()).filter(Boolean)) {
    if (body.length) body.push('');
    body.push(...wrapText(para, 48));
  }
  for (const t of clip(body, room)) {
    if (t) out.push({ text: t, y, size: 33, kind: 'body' });
    y += t ? 46 : 22;
  }
  out.push({ text: input.footer ? `${input.footer} · ${APP_LINE}` : APP_LINE, y: footerY, size: 26, kind: 'footer' });
  return out;
}

/** The card as plain words, for the share sheet or a note. */
export function cardText(input: ShareCardInput): string {
  return [input.eyebrow, input.title, input.subtitle ?? '', '', ...input.lines.flatMap((l) => [l.trim(), '']), `${input.footer ? `${input.footer} · ` : ''}${APP_LINE}`]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** A whole page to print: the card's words on one sheet, with a print stylesheet (no page furniture, ink-friendly). */
export function printableHtml(input: ShareCardInput): string {
  const paras = input.lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `<p>${escapeHtml(l).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(input.title)}</title>
<style>
:root { color-scheme: light; }
body { margin: 0; background: #f4ecd8; color: #102118; font: 17px/1.55 Georgia, 'Source Serif 4', serif; }
main { max-width: 640px; margin: 32px auto; padding: 40px 44px; background: #fffaf0; border: 2px solid #b9a05d; border-radius: 18px; }
.eyebrow { font: 600 13px/1.2 Georgia, serif; letter-spacing: .14em; text-transform: uppercase; color: #6f8465; margin: 0 0 10px; }
h1 { font: 600 38px/1.15 'Cormorant Garamond', Georgia, serif; margin: 0 0 8px; }
.subtitle { font-style: italic; color: #4a5a4c; margin: 0 0 22px; }
p { margin: 0 0 12px; white-space: normal; }
footer { margin-top: 26px; padding-top: 12px; border-top: 1px solid #b9a05d; font-size: 13px; color: #4a5a4c; }
@media print {
  @page { margin: 18mm; }
  body { background: #fff; }
  main { margin: 0; max-width: none; border: 1.5px solid #000; border-radius: 0; background: #fff; padding: 12mm; }
  .eyebrow, .subtitle, footer { color: #333; }
  p, h1 { break-inside: avoid; }
}
</style>
</head>
<body>
<main>
<p class="eyebrow">${escapeHtml(input.eyebrow)}</p>
<h1>${escapeHtml(input.title)}</h1>
${input.subtitle ? `<p class="subtitle">${escapeHtml(input.subtitle)}</p>` : ''}
${paras}
<footer>${escapeHtml(input.footer ? `${input.footer} · ${APP_LINE}` : APP_LINE)}</footer>
</main>
</body>
</html>
`;
}

/** A file name for the picture: "salt-and-sovereignty-a-candle-for-nan.png". */
export function cardFileName(title: string): string {
  const slug = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `salt-and-sovereignty-${slug || 'card'}.png`;
}
