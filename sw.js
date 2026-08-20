/* Service Worker — 離線快取
   app shell + KaTeX + 課程內容全部快取，讓 App 真的能離線使用 */

const CACHE = 'qtrace-v3';

const SHELL = [
  './',
  'index.html',
  'style.css',
  'main.js',
  'qmath.js',
  'widget-kit.js',
  'widgets.js',
  'widgets-a.js',
  'widgets-b.js',
  'manifest.json',
  'content/index.json',
  'vendor/katex/katex.min.css',
  'vendor/katex/katex.min.js',
  'vendor/katex/auto-render.min.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // 個別加入，單一檔案失敗不會讓整個安裝失敗
      Promise.allSettled(SHELL.map((u) => c.add(u)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 課程內容：network-first（改過的課程優先），離線時退回快取
  if (url.pathname.includes('/content/')) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 字型等跨網域資源：cache-first，抓到就存起來
  if (url.origin !== location.origin) {
    e.respondWith(
      caches.match(request).then((hit) =>
        hit || fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone)).catch(() => {});
          return res;
        }).catch(() => hit)
      )
    );
    return;
  }

  // app shell + KaTeX 字型：cache-first
  e.respondWith(
    caches.match(request).then((hit) =>
      hit || fetch(request).then((res) => {
        if (res.ok && (url.pathname.includes('/vendor/') || url.pathname.includes('/icons/'))) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
    )
  );
});
