// Phones: backups are written to the cache folder and handed to the share
// sheet (Save to Files, AirDrop, Drive…); restores come from the document
// picker. The web build uses fileIO.web.ts instead.

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export type PickedFile = { name: string; size: number | null; text: string };

/** Offers the backup to the person. Resolves once the share sheet closes. */
export async function saveBackupFile(json: string, filename: string): Promise<void> {
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(json);
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Save your Sanctuary backup',
  });
}

export async function pickBackupFile(maxBytes: number): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  if (asset.size != null && asset.size > maxBytes) return { name: asset.name, size: asset.size, text: '' };
  const text = await new File(asset.uri).text();
  return { name: asset.name, size: asset.size ?? null, text };
}
