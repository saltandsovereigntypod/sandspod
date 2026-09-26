// Embeds images referenced by a backup as data URLs, like the website's
// SanctuaryBackup.collectAssets. Remote images are fetched without cookies;
// anything missing, blocked or too large becomes a warning instead.

import { findAssetReferences, MAX_ASSET_BYTES, MAX_ASSETS, stripSignedParams, type BackupAsset } from './format';
import { sha256 } from './sha256';

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function collectAssets(data: unknown): Promise<{ assets: BackupAsset[]; warnings: string[] }> {
  const assets: BackupAsset[] = [];
  const warnings: string[] = [];
  for (const url of findAssetReferences(data)) {
    if (assets.length >= MAX_ASSETS) {
      warnings.push(`Only the first ${MAX_ASSETS} supported assets were embedded.`);
      break;
    }
    if (url.startsWith('data:')) {
      if (url.length <= MAX_ASSET_BYTES * 1.4)
        assets.push({ id: await sha256(url), source: 'embedded', mediaType: url.slice(5, url.indexOf(';')), dataUrl: url });
      else warnings.push('One embedded image exceeded the backup size limit.');
      continue;
    }
    try {
      const response = await fetch(url, { credentials: 'omit' });
      const type = response.headers.get('content-type') || '';
      if (!response.ok || !/^image\/(?:png|jpeg|webp)$/i.test(type)) throw new Error('Unsupported asset response.');
      const blob = await response.blob();
      if (blob.size > MAX_ASSET_BYTES) throw new Error('Asset too large.');
      const dataUrl = await readAsDataUrl(blob);
      const source = stripSignedParams(url).split('?')[0].split('#')[0];
      assets.push({ id: await sha256(url), source, mediaType: type, dataUrl });
    } catch {
      warnings.push(`Remote asset could not be embedded: ${url}`);
    }
  }
  return { assets, warnings };
}
