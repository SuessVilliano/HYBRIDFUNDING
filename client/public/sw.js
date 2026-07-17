/*
 * Hybrid Funding service worker.
 *
 * Caching strategy is deliberately conservative so a deploy can never be
 * pinned stale:
 *  - HTML/navigation requests always go to the network (no caching).
 *  - Hashed build assets under /assets/ are cached first (immutable by
 *    filename hash, safe forever).
 *  - Everything else passes straight through.
 *
 * Also ships web-push handlers so the site can send push notifications
 * once a push backend (VAPID keys + subscription storage) is connected.
 */

const ASSET_CACHE = "hf-assets-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop any old asset caches from previous SW versions
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== ASSET_CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only touch same-origin, GET requests for immutable hashed assets.
  const isImmutableAsset =
    event.request.method === "GET" &&
    url.origin === self.location.origin &&
    url.pathname.startsWith("/assets/");

  if (!isImmutableAsset) return; // navigation + everything else: network as usual

  event.respondWith(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    })()
  );
});

/* ── Web Push ───────────────────────────────────────────────────────────── */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Hybrid Funding";
  const options = {
    body: data.body || "",
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) await client.navigate(target);
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});
