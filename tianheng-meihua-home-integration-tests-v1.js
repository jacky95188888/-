'use strict';
const fs=require('fs');
const home=fs.readFileSync('index.html','utf8');
const meihua=fs.readFileSync('tianheng-meihua-qa-v1.html','utf8');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}

assert('完整首頁核心結構仍存在',()=>['id="app"','class="hero"','id="form"','PERSONAL DESTINY MATRIX'].every(x=>home.includes(x)));
assert('今日運勢入口保留',()=>home.includes('id="dailyEntry"')&&home.includes('今日運勢'));
assert('雙人合度入口保留',()=>home.includes('href="compat.html"')&&home.includes('雙人合度'));
assert('六爻問事入口保留',()=>home.includes('./tianheng-wenshi-qa-v1.html?v=20260901-narrative1')&&home.includes('六爻問事'));
assert('梅花易數入口已加入主頁',()=>home.includes('./tianheng-meihua-qa-v1.html?v=20260901-narrative1')&&home.includes('梅花易數'));
assert('主頁階段標示包含雙問事公開驗證',()=>home.includes('雙問事開放驗證'));
assert('首頁視覺入口分成主功能與快捷功能',()=>home.includes('class="gateway-feature"')&&home.includes('class="gateway-grid"'));
assert('梅花頁能返回正式主頁',()=>meihua.includes('href="./?v=20260901-meihua-home"'));
assert('梅花頁仍明示公開驗證而非準確率宣稱',()=>meihua.includes('正式入口・公開驗證中')&&meihua.includes('不宣稱正式準確率'));
assert('主頁未加入付款或舊引擎覆蓋指令',()=>!home.includes('legacyOverride=true')&&!home.includes('tianheng-meihua-payment'));

console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);
