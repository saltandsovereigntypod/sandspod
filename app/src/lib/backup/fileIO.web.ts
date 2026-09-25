// Web build: download the backup like the website does, and read restores
// through the browser's file chooser.

import * as DocumentPicker from 'expo-document-picker';

export type PickedFile = { name: string; size: number | null; text: string };

export async function saveBackupFile(json: string, filename: string): Promise<void> {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function pickBackupFile(maxBytes: number): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', '.json'], multiple: false, base64: false });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  const size = asset.file?.size ?? asset.size ?? null;
  if (size != null && size > maxBytes) return { name: asset.name, size, text: '' };
  const text = asset.file ? await asset.file.text() : await (await fetch(asset.uri)).text();
  return { name: asset.name, size, text };
}
