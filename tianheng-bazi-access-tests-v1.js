'use strict';
const fs=require('fs');
const assert=require('assert');
const access=fs.readFileSync('tianheng-bazi-access-v1.js','utf8');
const home=fs.readFileSync('index.html','utf8');
let passed=0;
function test(name,fn){try{fn();passed++;console.log('PASS',name)}catch(e){console.error('FAIL',name);throw e}}

test('進階解鎖程式不使用外部 API',()=>{
  assert.ok(access.includes("usesExternalApi:false"));
  assert.ok(!/\bfetch\s*\(/.test(access));
});
test('只保存雜湊而非可讀解鎖碼',()=>{
  const hashes=access.match(/[a-f0-9]{64}/g)||[];
  assert.strictEqual(hashes.length,30);
  assert.ok(!/TH9-[A-Z0-9]{5}-[A-Z0-9]{5}/.test(access));
});
test('解鎖限本機且有效期三十天',()=>{
  assert.ok(access.includes("VALID_DAYS=30"));
  assert.ok(access.includes('localStorage.setItem'));
});
test('首頁進階內容預設隱藏並有人工轉帳流程',()=>{
  assert.ok(home.includes('data-bazi-advanced-content hidden'));
  assert.ok(home.includes('LINE 傳截圖'));
  assert.ok(home.includes('data-bazi-unlock'));
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
test('首頁載入進階解鎖模組',()=>{
  assert.ok(home.includes('tianheng-bazi-access-v1.js?v=1.0.0'));
});

console.log(`\nRESULT ${passed}/${passed} passed`);
