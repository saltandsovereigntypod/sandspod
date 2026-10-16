// Phones: the share card is written to the cache folder as a PNG and handed
// to the share sheet (Save Image, Messages, AirDrop…). Nothing is uploaded;
// the person chooses where it goes. The web build uses shareFile.web.ts.

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Whether this device can offer the picture to other apps. */
export const canSharePicture = () => Sharing.isAvailableAsync();

/** Save a base64 PNG and open the share sheet. Resolves once the sheet closes. */
export async function sharePicture(base64: string, filename: string, title: string): Promise<'shared' | 'unavailable'> {
  if (!(await Sharing.isAvailableAsync())) return 'unavailable';
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(base64, { encoding: 'base64' });
  // Kept in the cache (the next card of the same name replaces it): some apps read it after the sheet closes.
  await Sharing.shareAsync(file.uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: title });
  return 'shared';
}
