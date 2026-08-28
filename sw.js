const TH_LIVE = '/-/tianheng-live.js?v=20260828-ziwei';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

/* Production safety net: inject one same-origin stable loader into the real entry only.
   Payment stays disabled until Cloudflare + ECPay backend verification is live. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  const u = new URL(req.url);
  if (u.origin !== self.location.origin) return;
  if (u.pathname !== '/-/' && u.pathname !== '/-/index.html') return;
  e.respondWith((async () => {
    try {
      const r = await fetch(req, { cache: 'no-store' });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.includes('text/html')) return r;
      let html = await r.text();
      if (!html.includes('tianheng-live.js')) {
        const tag = '\n<script src="' + TH_LIVE + '"></script>\n';
        html = html.includes('</body>') ? html.replace('</body>', tag + '</body>') : html + tag;
      }
      const h = new Headers(r.headers);
      h.delete('content-length');
      h.set('cache-control','no-store, max-age=0');
      return new Response(html,{status:r.status,statusText:r.statusText,headers:h});
    } catch(err) { return fetch(req); }
  })());
});

const API = 'https://tianheng-push.rhtm9y855y.workers.dev/today';
self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let d={title:'天衡',body:'今日運勢已更新',url:'/-/'};
    try{const r=await fetch(API,{cache:'no-store'});if(r.ok)d=await r.json();}catch(err){}
    await self.registration.showNotification(d.title,{body:d.body,icon:'/-/icon-192.png',badge:'/-/icon-192.png',data:{url:d.url||'/-/'}});
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url=(e.notification.data&&e.notification.data.url)||'/-/';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list)if(c.url.includes('/-/')&&'focus' in c)return c.focus();return clients.openWindow(url);}));
});
