self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

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
