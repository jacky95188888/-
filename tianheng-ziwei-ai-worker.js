/* 天衡紫微斗數 AI 深度命書（Cloudflare Worker）
 * 綁定：Workers AI -> AI；Rate Limiting -> ZIWEI_RATE_LIMITER
 * 前端只傳送去識別化後的宮位與星曜，不傳姓名或出生年月日時。
 */
const SITE_ORIGIN = 'https://jacky95188888.github.io';
const MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';
const MAX_BODY_BYTES = 24 * 1024;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return preflight(request);

    try {
      if (url.pathname === '/health' && request.method === 'GET') {
        return withCors(request, json({ ok: true, service: 'tianheng-ziwei-ai', model: MODEL }));
      }
      if (url.pathname !== '/ziwei-report' || request.method !== 'POST') {
        return withCors(request, json({ ok: false, error: 'not_found' }, 404));
      }
      if (request.headers.get('origin') !== SITE_ORIGIN) {
        return json({ ok: false, error: 'origin_not_allowed' }, 403);
      }

      const clientId = request.headers.get('x-client-id') || '';
      if (!/^[0-9a-f-]{36}$/i.test(clientId)) {
        return withCors(request, json({ ok: false, error: 'invalid_client' }, 400));
      }
      const limited = await env.ZIWEI_RATE_LIMITER.limit({ key: clientId + ':ziwei-report' });
      if (!limited.success) {
        return withCors(request, json({ ok: false, error: 'rate_limited', message: '請稍候一分鐘再試。' }, 429));
      }

      const body = await readJsonLimited(request);
      const chart = validateChart(body && body.chart);
      if (!chart) return withCors(request, json({ ok: false, error: 'invalid_chart' }, 400));

      const aiResult = await env.AI.run(MODEL, {
        messages: [
          { role: 'system', content: systemPrompt() },
          { role: 'user', content: '請依下列去識別化紫微斗數命盤資料撰寫深度命書：\n' + JSON.stringify(chart) }
        ],
        max_tokens: 1800,
        temperature: 0.45,
        response_format: { type: 'json_schema', json_schema: reportSchema() }
      });
      const report = normalizeReport(aiResult && aiResult.response);
      if (!report) throw new Error('invalid_ai_response');

      console.log(JSON.stringify({ message: 'ziwei report generated', palaceCount: chart.palaces.length, model: MODEL }));
      return withCors(request, json({ ok: true, report, model: MODEL }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(JSON.stringify({ message: 'ziwei report failed', error: message, path: url.pathname }));
      const status = message === 'payload_too_large' ? 413 : 500;
      return withCors(request, json({ ok: false, error: status === 413 ? 'payload_too_large' : 'generation_failed', message: 'AI 命書暫時無法產生，請稍後再試。' }, status));
    }
  }
};

function systemPrompt() {
  return [
    '你是「天衡」的繁體中文紫微斗數文化解讀師。',
    '只根據收到的十二宮、主星、輔星、命主、身主與五行局解讀；不得假裝知道出生日期、姓名或未提供的四化資料。',
    '解讀要具體、溫和、有脈絡，說明星曜組合可能呈現的優勢、拉扯與可執行建議。',
    '使用「傾向、可能、可留意」等措辭，不宣稱宿命、保證吉凶或預測確定事件。',
    '不可提供醫療診斷、投資標的、法律結論；健康只談作息與壓力覺察，財運只談風險與資源管理。',
    '每段約 90 至 150 個繁體中文字；actions 必須是三項短而具體的行動建議。',
    '只輸出符合 JSON Schema 的內容。'
  ].join('\n');
}

function reportSchema() {
  return {
    type: 'object',
    properties: {
      overview: { type: 'string' },
      personality: { type: 'string' },
      love: { type: 'string' },
      career: { type: 'string' },
      wealth: { type: 'string' },
      wellbeing: { type: 'string' },
      actions: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 }
    },
    required: ['overview', 'personality', 'love', 'career', 'wealth', 'wellbeing', 'actions']
  };
}

async function readJsonLimited(request) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) throw new Error('payload_too_large');
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    total += part.value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error('payload_too_large');
    }
    chunks.push(part.value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(merged));
}

function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, max);
}

function cleanStars(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 16).map((item) => cleanText(item, 12)).filter(Boolean);
}

function validateChart(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.palaces) || input.palaces.length !== 12) return null;
  const palaces = input.palaces.map((palace) => ({
    name: cleanText(palace && palace.name, 8),
    branch: cleanText(palace && palace.branch, 2),
    major: cleanStars(palace && palace.major),
    minor: cleanStars(palace && palace.minor),
    bodyPalace: Boolean(palace && palace.bodyPalace)
  }));
  if (palaces.some((palace) => !palace.name || !palace.branch)) return null;
  if (new Set(palaces.map((palace) => palace.name)).size < 10) return null;
  return {
    soul: cleanText(input.soul, 12),
    body: cleanText(input.body, 12),
    fiveElementsClass: cleanText(input.fiveElementsClass, 20),
    zodiac: cleanText(input.zodiac, 8),
    sign: cleanText(input.sign, 12),
    palaces
  };
}

function normalizeReport(value) {
  let report = value;
  if (typeof report === 'string') {
    try { report = JSON.parse(report); } catch { return null; }
  }
  if (!report || typeof report !== 'object') return null;
  const keys = ['overview', 'personality', 'love', 'career', 'wealth', 'wellbeing'];
  const clean = {};
  for (const key of keys) {
    clean[key] = cleanText(report[key], 1200);
    if (!clean[key]) return null;
  }
  clean.actions = Array.isArray(report.actions) ? report.actions.slice(0, 3).map((item) => cleanText(item, 180)).filter(Boolean) : [];
  return clean.actions.length === 3 ? clean : null;
}

function preflight(request) {
  if (request.headers.get('origin') !== SITE_ORIGIN) return json({ ok: false, error: 'origin_not_allowed' }, 403);
  return withCors(request, new Response(null, { status: 204 }));
}

function withCors(request, response) {
  const headers = new Headers(response.headers);
  if (request.headers.get('origin') === SITE_ORIGIN) headers.set('access-control-allow-origin', SITE_ORIGIN);
  headers.set('access-control-allow-methods', 'GET,POST,OPTIONS');
  headers.set('access-control-allow-headers', 'content-type,x-client-id');
  headers.set('access-control-max-age', '86400');
  headers.set('vary', 'Origin');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('referrer-policy', 'no-referrer');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
