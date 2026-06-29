const CACHE_NAME = "salt-sovereignty-v1";

const CORE_ASSETS = [
  "/sandspod/",
  "/sandspod/index.html",
  "/sandspod/css/styles.css",
  "/sandspod/css/threshold.css",
  "/sandspod/css/blog.css",
  "/sandspod/altar/altar.css",
  "/sandspod/script.js",
  "/sandspod/altar/altar.js",
  "/sandspod/posts.json",
  "/sandspod/manifest.webmanifest",
  "/sandspod/assets/headshot.png",
  "/sandspod/assets/the-sound-of-your-undoing-cover.png",
  "/sandspod/assets/altar/backgrounds/forest-scene.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});
