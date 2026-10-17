// Web build: the share card downloads as a PNG, as a backup does.

export const canSharePicture = async () => typeof document !== 'undefined';

export async function sharePicture(base64: string, filename: string): Promise<'shared' | 'unavailable'> {
  if (typeof document === 'undefined') return 'unavailable';
  const anchor = document.createElement('a');
  anchor.href = `data:image/png;base64,${base64}`;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return 'shared';
}
