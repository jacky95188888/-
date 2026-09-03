/* 天衡・進階功能人工發碼 Worker v2
 * KV binding: BAZI_CODES
 * Secret: ADMIN_KEY
 * Var: ALLOW_ORIGIN=https://jacky95188888.github.io
 */
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }), env);
    try {
      if (url.pathname === '/health') return withCors(json({ ok: true, service: 'tianheng-feature-access', version: 2, features: ['bazi', 'wenshi', 'meihua'] }), env);
      if (url.pathname === '/redeem' && req.method === 'POST') return withCors(await redeem(req, env), env);
      if (url.pathname === '/admin/create' && req.method === 'POST') return withCors(await createCodes(req, env), env);
      if (url.pathname === '/admin/list' && req.method === 'GET') return withCors(await listCodes(req, env), env);
      if (url.pathname === '/admin/revoke' && req.method === 'POST') return withCors(await revokeCode(req, env), env);
      return withCors(json({ ok: false, error: 'not_found' }, 404), env);
    } catch (error) {
      return withCors(json({ ok: false, error: error.message || String(error) }, 500), env);
    }
  }
};

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json;charset=utf-8' } });
}
function withCors(response, env) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', env.ALLOW_ORIGIN || 'https://jacky95188888.github.io');
  headers.set('Access-Control-Allow-Headers', 'content-type,x-admin-key');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Cache-Control', 'no-store');
  return new Response(response.body, { status: response.status, headers });
}
function requireAdmin(req, env) {
  const expected = String(env.ADMIN_KEY || '');
  const actual = String(req.headers.get('x-admin-key') || '');
  return expected && actual && timingSafeEqual(expected, actual);
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
function normalize(code) { return String(code || '').trim().toUpperCase().replace(/\s+/g, ''); }
const FEATURES = new Set(['bazi', 'wenshi', 'meihua']);
function feature(value) { const normalized = String(value || 'bazi').trim().toLowerCase(); return FEATURES.has(normalized) ? normalized : ''; }
async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2, '0')).join('');
}
function randomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const part = n => Array.from(bytes.slice(n, n + 5), v => alphabet[v % alphabet.length]).join('');
  return `TH9-${part(0)}-${part(5)}`;
}
function publicRecord(record) {
  return {
    id: record.id,
    hash: record.hash,
    label: record.label || '',
    feature: record.feature || 'bazi',
    status: record.status,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    redeemedAt: record.redeemedAt || null,
    redeemedDevice: record.redeemedDevice || null,
    revokedAt: record.revokedAt || null
  };
}

async function createCodes(req, env) {
  if (!requireAdmin(req, env)) return json({ ok: false, error: 'unauthorized' }, 401);
  const body = await req.json();
  const count = Math.max(1, Math.min(50, Number(body.count) || 1));
  const days = Math.max(1, Math.min(365, Number(body.days) || 30));
  const label = String(body.label || '').slice(0, 80);
  const selectedFeature = feature(body.feature);
  if (!selectedFeature) return json({ ok: false, error: 'invalid_feature' }, 400);
  const now = Date.now();
  const codes = [];
  for (let i = 0; i < count; i += 1) {
    const code = randomCode();
    const hash = await sha256(code);
    const record = { id: hash.slice(0, 12), hash, label, feature: selectedFeature, status: 'active', createdAt: now, expiresAt: now + days * 86400000 };
    await env.BAZI_CODES.put(`code:${hash}`, JSON.stringify(record), { expirationTtl: days * 86400 });
    await env.BAZI_CODES.put(`index:${now}:${record.id}`, hash, { expirationTtl: days * 86400 });
    codes.push({ code, ...publicRecord(record) });
  }
  return json({ ok: true, codes });
}

async function redeem(req, env) {
  const body = await req.json();
  const code = normalize(body.code);
  const device = String(body.device || '').slice(0, 100);
  const requestedFeature = feature(body.feature);
  if (!requestedFeature) return json({ ok: false, error: 'invalid_feature' }, 400);
  if (!/^TH9-[A-Z2-9]{5}-[A-Z2-9]{5}$/.test(code)) return json({ ok: false, error: 'invalid_code' }, 400);
  const hash = await sha256(code);
  const key = `code:${hash}`;
  const raw = await env.BAZI_CODES.get(key);
  if (!raw) return json({ ok: false, error: 'invalid_or_expired' }, 404);
  const record = JSON.parse(raw);
  const recordFeature = record.feature || 'bazi';
  if (recordFeature !== requestedFeature) return json({ ok: false, error: 'wrong_feature', feature: recordFeature }, 403);
  const now = Date.now();
  if (record.status === 'revoked') return json({ ok: false, error: 'revoked' }, 403);
  if (now > record.expiresAt) return json({ ok: false, error: 'expired' }, 410);
  if (record.status === 'redeemed') {
    if (device && record.redeemedDevice === device) return json({ ok: true, reused: true, feature: recordFeature, expiresAt: record.expiresAt });
    return json({ ok: false, error: 'already_redeemed' }, 409);
  }
  record.status = 'redeemed';
  record.redeemedAt = now;
  record.redeemedDevice = device || 'anonymous';
  await env.BAZI_CODES.put(key, JSON.stringify(record), { expirationTtl: Math.max(60, Math.ceil((record.expiresAt - now) / 1000)) });
  return json({ ok: true, reused: false, feature: recordFeature, expiresAt: record.expiresAt });
}

async function listCodes(req, env) {
  if (!requireAdmin(req, env)) return json({ ok: false, error: 'unauthorized' }, 401);
  const listed = await env.BAZI_CODES.list({ prefix: 'index:', limit: 200 });
  const records = [];
  for (const item of listed.keys) {
    const hash = await env.BAZI_CODES.get(item.name);
    if (!hash) continue;
    const raw = await env.BAZI_CODES.get(`code:${hash}`);
    if (raw) records.push(publicRecord(JSON.parse(raw)));
  }
  records.sort((a, b) => b.createdAt - a.createdAt);
  return json({ ok: true, records });
}

async function revokeCode(req, env) {
  if (!requireAdmin(req, env)) return json({ ok: false, error: 'unauthorized' }, 401);
  const body = await req.json();
  const hash = String(body.hash || '');
  if (!/^[a-f0-9]{64}$/.test(hash)) return json({ ok: false, error: 'invalid_hash' }, 400);
  const key = `code:${hash}`;
  const raw = await env.BAZI_CODES.get(key);
  if (!raw) return json({ ok: false, error: 'not_found' }, 404);
  const record = JSON.parse(raw);
  record.status = 'revoked';
  record.revokedAt = Date.now();
  await env.BAZI_CODES.put(key, JSON.stringify(record), { expirationTtl: Math.max(60, Math.ceil((record.expiresAt - Date.now()) / 1000)) });
  return json({ ok: true, record: publicRecord(record) });
}
