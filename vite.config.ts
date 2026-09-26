import { defineConfig } from 'vitest/config';

// Emit an asset list at build time so the entire app is available offline.
export default defineConfig({
  base: './',
  plugins: [{
    name: 'offline-shell',
    generateBundle(_, bundle) {
      const files = ['./', './index.html', './manifest.webmanifest', './icons/calendar.svg',
        './icons/icon-192.png', './icons/icon-512.png',
        ...Object.keys(bundle).filter(name => /\.(js|css)$/.test(name)).map(name => `./${name}`)];
      const version = `${Date.now()}-${Object.keys(bundle).join('|')}`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: `
const PREFIX = 'koyomi-shell-' + self.registration.scope + '-';
const CACHE = PREFIX + ${JSON.stringify(version)};
const FILES = ${JSON.stringify(files)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match(new URL('./index.html', self.location).href))));
    return;
  }
  // Static, same-origin assets do not vary by Origin; module requests may carry
  // that header while install-time requests do not (Vite preview sends Vary: Origin).
  event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request, { ignoreVary: true })).then(cached => cached || fetch(event.request)));
});
` });
    },
  }],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
