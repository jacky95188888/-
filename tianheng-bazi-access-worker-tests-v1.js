const fs = require('fs');
const assert = require('assert');
const src = fs.readFileSync('tianheng-bazi-access-worker-v1.js', 'utf8');
const cfg = fs.readFileSync('tianheng-bazi-access-wrangler.jsonc', 'utf8');
const workflow = fs.readFileSync('.github/workflows/deploy-tianheng-bazi-access.yml', 'utf8');
let pass = 0;
function test(name, fn) { try { fn(); pass += 1; console.log('PASS', name); } catch (e) { console.error('FAIL', name, e.message); process.exitCode = 1; } }
test('人工發碼與金流 Worker 分離', () => assert.ok(!src.includes('ECPAY_')));
test('使用獨立 BAZI_CODES KV', () => assert.ok(src.includes('env.BAZI_CODES') && cfg.includes('"BAZI_CODES"')));
test('具備建立、列表、兌換與停用路由', () => ['/admin/create','/admin/list','/redeem','/admin/revoke'].forEach(v => assert.ok(src.includes(v))));
test('管理路由需要 ADMIN_KEY', () => assert.ok(src.includes("req.headers.get('x-admin-key')") && src.includes('env.ADMIN_KEY')));
test('一次性兌換拒絕不同裝置重複使用', () => assert.ok(src.includes("error: 'already_redeemed'") && src.includes('record.redeemedDevice === device')));
test('只保存雜湊、不在 KV 保存明碼', () => assert.ok(src.includes('code:${hash}') && !src.includes('record.code = code')));
test('期限限制在 1 至 365 天', () => assert.ok(src.includes('Math.min(365')));
test('自動部署會沿用既有 Cloudflare Token 並建立 KV', () => {
  assert.ok(workflow.includes('secrets.CLOUDFLARE_API_TOKEN'));
  assert.ok(workflow.includes('kv namespace create tianheng-bazi-access-codes'));
  assert.ok(workflow.includes('TIANHENG_BAZI_ADMIN_KEY'));
});
if (!process.exitCode) console.log(`ALL ${pass} TESTS PASSED`);
