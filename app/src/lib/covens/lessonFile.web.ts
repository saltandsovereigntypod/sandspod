// The web build: pick with the browser and upload the file as it is.

import * as DocumentPicker from 'expo-document-picker';

import { FILE_TYPES, fileTypeOf, MAX_FILE_BYTES, type FileType } from './training';

export type PickedFile = { uri: string; type: FileType; name: string };

export async function pickLessonFile(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: FILE_TYPES, multiple: false });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  const type = fileTypeOf(asset.name || asset.uri, asset.mimeType);
  if (!type) throw new Error('Choose a PDF or a picture (PNG, JPEG or WebP).');
  if (asset.size != null && asset.size > MAX_FILE_BYTES) throw new Error('That file is too large. Choose one under 15 MB.');
  return { uri: asset.uri, type, name: asset.name || 'lesson' };
}

export async function lessonFileBytes(picked: PickedFile): Promise<Blob> {
  return (await fetch(picked.uri)).blob();
}
