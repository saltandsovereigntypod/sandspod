// The web build: pick with the browser, upload the file as is; guests keep a data URL (as the website does).

import * as DocumentPicker from 'expo-document-picker';

import { supabase } from '../supabase';
import { newId } from './uid';

export type PickedImage = { uri: string; mimeType: string };
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function pickImage(): Promise<PickedImage | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['image/png', 'image/jpeg', 'image/webp'], multiple: false });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  if (asset.size != null && asset.size > MAX_IMAGE_BYTES) throw new Error('That picture is too large. Choose one under 8 MB.');
  return { uri: asset.uri, mimeType: asset.mimeType || 'image/png' };
}

const extFor = (mime: string) => (mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg');

export async function uploadImage(userId: string, picked: PickedImage, folder: string): Promise<{ url: string; storagePath: string }> {
  const storagePath = `${userId}/${folder}/${newId()}.${extFor(picked.mimeType)}`;
  const blob = await (await fetch(picked.uri)).blob();
  const { error } = await supabase.storage.from('user-assets').upload(storagePath, blob, { contentType: picked.mimeType, cacheControl: '31536000', upsert: false });
  if (error) throw new Error(error.message);
  return { url: supabase.storage.from('user-assets').getPublicUrl(storagePath).data.publicUrl, storagePath };
}

export async function keepImageOnDevice(picked: PickedImage, _folder: string): Promise<string> {
  if (picked.uri.startsWith('data:')) return picked.uri;
  const blob = await (await fetch(picked.uri)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Couldn’t read that picture.'));
    reader.readAsDataURL(blob);
  });
}

export async function removeUploaded(paths: string[]): Promise<void> {
  if (!paths.length) return;
  await supabase.storage.from('user-assets').remove(paths).catch(() => undefined);
}
