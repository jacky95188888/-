const TH_LINE = '/-/tianheng-v9-line.js?v=90c440619113c3bf00aab74b8b6463f7673b2271';
const TH_GATES = '/-/tianheng-v10-gates.js?v=f38ece3ab8c37d704a4a4ea9be77a001a920325c';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

/*
 * Production enhancement injection.
 * Only touch the real Tianheng entry page. Preview/debug pages are excluded so
 * they cannot be polluted by an older loader chain.
 * Payment remains disabled until Cloudflare + ECPay backend verification is live.
 */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  const u = new URL(req.url);
  if (u.origin !== self.location.origin) return;
  const isProdIndex = u.pathname === '/-/' || u.pathname === '/-/index.html';
  if (!isProdIndex) return;

  e.respondWith((async () => {
    try {
      const r = await fetch(req, { cache: 'no-store' });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.includes('text/html')) return r;
      let html = await r.text();
      const tags = [];
      if (!html.includes('tianheng-v9-line.js')) tags.push('<script src="' + TH_LINE + '"></script>');
      if (!html.includes('tianheng-v10-gates.js')) tags.push('<script src="' + TH_GATES + '"></script>');
      if (tags.length) {
        const block = '\n<!-- Tianheng live enhancements: LINE + coming-soon gates -->\n' + tags.join('\n') + '\n';
        html = html.includes('</body>') ? html.replace('</body>', block + '</body>') : html + block;
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
