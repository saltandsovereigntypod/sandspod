// Web build: the card's page goes into a hidden frame and the browser's
// print dialog opens on it, with the page's own print stylesheet.

export const canPrint = typeof document !== 'undefined';

export async function printPage(html: string): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return false;
  }
  doc.open();
  doc.write(html);
  doc.close();
  await new Promise((resolve) => setTimeout(resolve, 250));
  win.focus();
  win.print();
  setTimeout(() => frame.remove(), 60_000);
  return true;
}
