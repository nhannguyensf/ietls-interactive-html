const CACHE_NAME = "ielts-practice-v7";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app/listening_test.html",
  "./app/reading_test.html",
  "./scripts/brand.js",
  "./assets/audio/vol7_test6_listening.mp3",
  "./manifest.webmanifest",
  "./assets/icons/app-icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request);
    })
  );
});
