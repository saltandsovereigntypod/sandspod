// Phones: the printable book is written to the cache folder as an HTML file
// and handed to the share sheet. The app can't print by itself (expo-print
// isn't part of this build), so the sheet offers what the phone can: open it
// in a browser and print or save as PDF from there, or send it on. The web
// build prints straight away (printFile.web.ts).

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const PRINTS_DIRECTLY = false;

export async function printBook(html: string, filename: string): Promise<'shared' | 'unavailable' | 'printed'> {
  if (!(await Sharing.isAvailableAsync())) return 'unavailable';
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(html);
  await Sharing.shareAsync(file.uri, { mimeType: 'text/html', UTI: 'public.html', dialogTitle: 'Your Book of Shadows' });
  return 'shared';
}
