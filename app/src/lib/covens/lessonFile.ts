// A file for a lesson (a PDF or a picture), picked from Files and read for
// upload to the coven's private folder (lessonFile.web.ts for the web build).

import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import { FILE_TYPES, fileTypeOf, MAX_FILE_BYTES, type FileType } from './training';

export type PickedFile = { uri: string; type: FileType; name: string };

/** Ask for a file. Null when cancelled; a readable message when it won't do. */
export async function pickLessonFile(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: FILE_TYPES, copyToCacheDirectory: true, multiple: false });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  const type = fileTypeOf(asset.name || asset.uri, asset.mimeType);
  if (!type) throw new Error('Choose a PDF or a picture (PNG, JPEG or WebP).');
  if (asset.size != null && asset.size > MAX_FILE_BYTES) throw new Error('That file is too large. Choose one under 15 MB.');
  return { uri: asset.uri, type, name: asset.name || 'lesson' };
}

export async function lessonFileBytes(picked: PickedFile): Promise<Uint8Array> {
  return new File(picked.uri).bytes();
}
