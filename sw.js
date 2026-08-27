const TH_LOADER = '/-/tianheng-v3.js?v=b83d292197d659f66b4ffb07478cdd76ff2834dc';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

/*
 * Production safety net:
 * the current index.html contains the legacy Tianheng logic inline and does not
 * reliably include the external enhancement loader. For navigations under /-/,
 * inject the version-pinned loader once before </body>. This keeps V4–V8 active
 * without duplicating them and avoids raw/main cache drift.
 */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  const u = new URL(req.url);
  if (u.origin !== self.location.origin || !u.pathname.startsWith('/-/')) return;

  e.respondWith((async () => {
    try {
      const r = await fetch(req, { cache: 'no-store' });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.includes('text/html')) return r;
      let html = await r.text();
      if (!html.includes('tianheng-v3.js')) {
        const tag = '<script src="' + TH_LOADER + '"></script>';
        html = html.includes('</body>') ? html.replace('</body>', tag + '\n</body>') : html + tag;
      }
      const h = new Headers(r.headers);
      h.delete('content-length');
      h.set('cache-control', 'no-store, max-age=0');
      return new Response(html, { status: r.status, statusText: r.statusText, headers: h });
    } catch (err) {
      return fetch(req);
    }
  })());
});

const API = 'https://tianheng-push.rhtm9y855y.workers.dev/today';

self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let d = { title: '天衡', body: '今日運勢已更新', url: '/-/' };
    try {
      const r = await fetch(API, { cache: 'no-store' });
      if (r.ok) d = await r.json();
    } catch (err) {}
    await self.registration.showNotification(d.title, {
      body: d.body,
      icon: '/-/icon-192.png',
      badge: '/-/icon-192.png',
      data: { url: d.url || '/-/' }
    });
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/-/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) if (c.url.includes('/-/') && 'focus' in c) return c.focus();
      return clients.openWindow(url);
    })
  );
});
