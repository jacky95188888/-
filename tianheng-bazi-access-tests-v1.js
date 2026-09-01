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
  assert.ok(access.includes("JSON.stringify({code:code,device:deviceId()})"));
  assert.ok(!/name:|birthday:|pillars:|chart:/.test(access));
});
test('保留舊裝置解鎖期限並接受後台到期日',()=>{
  assert.ok(access.includes("STORAGE_KEY='tianheng_bazi_advanced_access_v1'"));
  assert.ok(access.includes('saveAccess(data.expiresAt)'));
});
test('首頁進階內容預設隱藏並有人工轉帳流程',()=>{
  assert.ok(home.includes('data-bazi-advanced-content hidden'));
  assert.ok(home.includes('LINE 傳截圖'));
  assert.ok(home.includes('data-bazi-unlock'));
});
test('首頁說明不傳姓名生日四柱命盤',()=>{
  assert.ok(home.includes('不會傳送姓名、生日、四柱或命盤資料'));
  assert.ok(home.includes('一碼一裝置驗證'));
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
test('首頁載入進階解鎖模組 v2',()=>{
  assert.ok(home.includes('tianheng-bazi-access-v1.js?v=2.0.0'));
});
test('發碼台不保存管理金鑰並支援建立列表停用',()=>{
  assert.ok(admin.includes("autocomplete=\"off\""));
  assert.ok(!admin.includes('localStorage'));
  assert.ok(admin.includes("'/admin/create'"));
  assert.ok(admin.includes("'/admin/list'"));
  assert.ok(admin.includes("'/admin/revoke'"));
});

console.log(`\nRESULT ${passed}/${passed} passed`);
