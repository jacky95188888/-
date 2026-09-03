'use strict';
const fs=require('fs');
const assert=require('assert');
const access=fs.readFileSync('tianheng-bazi-access-v1.js','utf8');
const home=fs.readFileSync('index.html','utf8');
const admin=fs.readFileSync('tianheng-bazi-codes-admin.html','utf8');
let passed=0;
function test(name,fn){try{fn();passed++;console.log('PASS',name)}catch(e){console.error('FAIL',name);throw e}}

test('進階解鎖使用正式 Worker API',()=>{
  assert.ok(access.includes("usesExternalApi:true"));
  assert.ok(access.includes("tianheng-bazi-access.rhtm9y855y.workers.dev"));
  assert.ok(access.includes("fetch(API+'/redeem'"));
});
test('前端不再保存固定解鎖碼或雜湊清單',()=>{
  assert.ok(!access.includes('CODE_HASHES'));
  assert.ok(!/[a-f0-9]{64}/.test(access));
});
test('一碼一裝置且不傳命盤個資',()=>{
  assert.ok(access.includes("DEVICE_KEY='tianheng_bazi_device_v1'"));
  assert.ok(access.includes("JSON.stringify({code:code,device:deviceId(),feature:'bazi'})"));
  assert.ok(!/name:|birthday:|pillars:|chart:/.test(access));
});
test('保留舊裝置解鎖期限並接受後台到期日',()=>{
  assert.ok(access.includes("STORAGE_KEY='tianheng_bazi_advanced_access_v1'"));
  assert.ok(access.includes('saveAccess(data.expiresAt)'));
});
test('首頁八字進階內容直接免費開放',()=>{
  assert.ok(home.includes('data-bazi-advanced-content>'));
  assert.ok(!home.includes('data-bazi-advanced-content hidden'));
  assert.ok(!home.includes('data-bazi-access-gate'));
  assert.ok(!home.includes('data-bazi-unlock'));
});
test('首頁不顯示密碼或轉帳解鎖流程',()=>{
  assert.ok(!home.includes('輸入專屬解鎖碼'));
  assert.ok(!home.includes('LINE 傳截圖'));
  assert.ok(!home.includes('解 鎖 完 整 分 析'));
});
test('原本九維內容不在密碼區內',()=>{
  assert.ok(home.indexOf('const cardsHtml=')>home.indexOf('function render(r,info)'));
  assert.ok(home.includes('${cardsHtml}\n   ${advancedHtml}'));
});
test('長篇卡片展開不再受固定高度截斷',()=>{
  assert.ok(home.includes('.card.open .card-b{max-height:none;overflow:visible}'));
  assert.ok(home.includes('.lnopen>.lnbody{max-height:none!important;overflow:visible!important}'));
  assert.ok(!home.includes('.card.open .card-b{max-height:1400px}'));
});
test('首頁不載入進階解鎖模組',()=>{
  assert.ok(!home.includes('tianheng-bazi-access-v1.js'));
});
test('發碼台不保存管理金鑰並支援建立列表停用',()=>{
  assert.ok(admin.includes("autocomplete=\"off\""));
  assert.ok(!admin.includes('localStorage'));
  assert.ok(admin.includes("'/admin/create'"));
  assert.ok(admin.includes("'/admin/list'"));
  assert.ok(admin.includes("'/admin/revoke'"));
});
test('發碼後台可分別建立三種功能碼',()=>{
  assert.ok(admin.includes('<option value="bazi">八字進階分析</option>'));
  assert.ok(admin.includes('<option value="wenshi">六爻問事</option>'));
  assert.ok(admin.includes('<option value="meihua">梅花易數</option>'));
  assert.ok(admin.includes("feature:$('feature').value"));
});

console.log(`\nRESULT ${passed}/${passed} passed`);
