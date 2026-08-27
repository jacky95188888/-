const TH_ASSETS = [
  '/-/tianheng-v9-line.js?v=20260827-0225',
  '/-/tianheng-v10-gates.js?v=20260827-0225'
];

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

/*
 * Tianheng production bootstrap.
 * Keep the production page on the existing stable inline engine, then inject
 * only the same-origin V9 LINE entry and V10 four-gate preview. V11 payment is
 * intentionally NOT injected until the Cloudflare/ECPay backend is deployed
 * and verified end-to-end. This avoids raw.githubusercontent.com cache/CORS
 * drift and keeps support as voluntary (隨喜) in the meantime.
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
      const tags = [];
      for (const src of TH_ASSETS) {
        const base = src.split('?')[0];
        if (!html.includes(base)) tags.push('<script src="' + src + '"></script>');
      }
      if (tags.length) {
        const block = '\n<!-- Tianheng production enhancements -->\n' + tags.join('\n') + '\n';
        html = html.includes('</body>') ? html.replace('</body>', block + '</body>') : html + block;
      }
      const h = new Headers(r.headers);
      h.delete('content-length');
      h.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
      h.set('pragma', 'no-cache');
      h.set('expires', '0');
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
