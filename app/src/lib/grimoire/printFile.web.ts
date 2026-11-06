// The web app: the printable book opens in a new tab and the browser's print
// dialog opens on it (print, or save as PDF). If the tab is blocked, the
// book is downloaded as an HTML file to open and print.

export const PRINTS_DIRECTLY = true;

export async function printBook(html: string, filename: string): Promise<'shared' | 'unavailable' | 'printed'> {
  const w = window.open('', '_blank');
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    // Images get a moment to load before the dialog.
    setTimeout(() => w.print(), 600);
    return 'printed';
  }
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'shared';
}
