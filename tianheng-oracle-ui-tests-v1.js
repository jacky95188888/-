const fs=require('fs');
const assert=require('assert');
const pages=['tianheng-wenshi-qa-v1.html','tianheng-meihua-qa-v1.html'];
let passed=0;
function test(name,fn){try{fn();passed++;console.log('PASS',name)}catch(e){console.error('FAIL',name,'-',e.message);process.exitCode=1}}
for(const page of pages){
  const html=fs.readFileSync(page,'utf8');
  test(page+' 採四步式輸入',()=>{for(let i=1;i<=4;i++)assert(html.includes(`<b>${i}</b>`))});
  test(page+' 提供四種時間範圍',()=>assert.strictEqual((html.match(/<input type="radio" name="horizon"/g)||[]).length,4));
  test(page+' 保存時間範圍證據',()=>assert(html.includes('timeHorizon:')));
  test(page+' 功能介紹後才出現開通入口',()=>assert(html.indexOf('id="result"')<html.indexOf('id="contact-sambo"')));
  test(page+' 開通連到三寶爸官方 LINE',()=>assert(html.includes('https://line.me/R/ti/p/@788ldzke')));
  test(page+' 判讀按鈕預設鎖定並提供開通碼欄位',()=>assert(html.includes('data-th-access-code')&&html.includes('data-feature-analyze disabled')));
  test(page+' 載入共用功能解鎖模組',()=>assert(html.includes('tianheng-feature-access-v1.js?v=20260903')));
  test(page+' 沒有重複 HTML id',()=>{const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);assert.strictEqual(new Set(ids).size,ids.length)});
}
if(!process.exitCode)console.log(`\n${passed}/${passed} passed`);
