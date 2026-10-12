// Pictures for your own cabinet items and apothecary workings. Picks from the
// photo library when the app build has it, otherwise from Files. Signed in,
// pictures go to the `user-assets` bucket (as the website does); guests keep
// a copy on the device.

import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

import { supabase } from '../supabase';
import { newId } from './uid';

export type PickedImage = { uri: string; mimeType: string };

const TYPES = ['image/png', 'image/jpeg', 'image/webp'];
/** The website keeps pictures under a few megabytes; very large ones are refused. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type ImagePickerModule = {
  launchImageLibraryAsync: (options: Record<string, unknown>) => Promise<{
    canceled: boolean;
    assets?: { uri: string; mimeType?: string; fileSize?: number }[] | null;
  }>;
};

function imagePicker(): ImagePickerModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- only in builds that include it
    return require('expo-image-picker') as ImagePickerModule;
  } catch {
    return null;
  }
}

function mimeFor(uri: string, given?: string | null): string {
  if (given && TYPES.includes(given)) return given;
  if (/\.png$/i.test(uri)) return 'image/png';
  if (/\.webp$/i.test(uri)) return 'image/webp';
  return 'image/jpeg';
}

/** Ask for a picture. Null when cancelled. Throws a readable message when it's too large. */
export async function pickImage(): Promise<PickedImage | null> {
  const picker = imagePicker();
  if (picker) {
    try {
      const result = await picker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, allowsEditing: false });
      if (result.canceled || !result.assets?.length) return null;
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) throw new Error('That picture is too large. Choose one under 8 MB.');
      return { uri: asset.uri, mimeType: mimeFor(asset.uri, asset.mimeType) };
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('That picture')) throw e;
      // Fall back to Files below.
    }
  }
  const result = await DocumentPicker.getDocumentAsync({ type: TYPES, copyToCacheDirectory: true, multiple: false });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  if (asset.size != null && asset.size > MAX_IMAGE_BYTES) throw new Error('That picture is too large. Choose one under 8 MB.');
  return { uri: asset.uri, mimeType: mimeFor(asset.name || asset.uri, asset.mimeType) };
}

const extFor = (mime: string) => (mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg');

/** Upload to `user-assets/${userId}/${folder}/${id}.${ext}`; returns the public URL and storage path. */
export async function uploadImage(userId: string, picked: PickedImage, folder: string): Promise<{ url: string; storagePath: string }> {
  const storagePath = `${userId}/${folder}/${newId()}.${extFor(picked.mimeType)}`;
  const bytes = await new File(picked.uri).bytes();
  const { error } = await supabase.storage
    .from('user-assets')
    .upload(storagePath, bytes, { contentType: picked.mimeType, cacheControl: '31536000', upsert: false });
  if (error) throw new Error(error.message);
  return { url: supabase.storage.from('user-assets').getPublicUrl(storagePath).data.publicUrl, storagePath };
}

/** A guest's copy, kept in the app's own documents so it survives restarts. */
export async function keepImageOnDevice(picked: PickedImage, folder: string): Promise<string> {
  const dir = new Directory(Paths.document, folder);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const target = new File(dir, `${newId()}.${extFor(picked.mimeType)}`);
  await new File(picked.uri).copy(target);
  return target.uri;
}

export async function removeUploaded(paths: string[]): Promise<void> {
  if (!paths.length) return;
  await supabase.storage.from('user-assets').remove(paths).catch(() => undefined);
}
