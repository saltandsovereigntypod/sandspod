import { bundledAltarAssets } from '../altar/assetManifest';

// The web app keeps working offline through public/sw.js. Once it is
// registered, tell it which built files this version uses: the scripts and
// fonts already loaded (they were fetched before the worker took over the
// page) and all bundled altar artwork, so a background or object never opened
// online still shows offline.

function altarArtworkUrls(): string[] {
  const urls: string[] = [];
  for (const { source } of Object.values(bundledAltarAssets)) {
    // In the web export a bundled image is { uri, width, height }, though it
    // is typed as the native build's asset number.
    const uri = (source as unknown as { uri?: unknown }).uri;
    if (typeof uri === 'string') urls.push(uri);
  }
  return urls;
}

function loadedFileUrls(): string[] {
  return performance
    .getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((url) => url.startsWith(location.origin));
}

let started = false;

export function registerServiceWorker() {
  if (started || __DEV__ || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  started = true;
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => Promise.all([navigator.serviceWorker.ready, document.fonts?.ready]))
    .then(([registration]) => {
      registration.active?.postMessage({ type: 'precache', urls: [...loadedFileUrls(), ...altarArtworkUrls()] });
    })
    .catch(() => {
      // Private browsing or an old browser: the app still works online.
    });
}
