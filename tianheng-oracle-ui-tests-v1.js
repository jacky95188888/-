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
  test(page+' 結果後保留人工核對入口',()=>assert(html.indexOf('id="result"')<html.indexOf('id="contact-sambo"')));
  test(page+' 人工核對連到三寶爸官方 LINE',()=>assert(html.includes('https://line.me/R/ti/p/@788ldzke')));
  test(page+' 判讀按鈕直接開放且沒有開通碼欄位',()=>assert(html.includes('data-feature-analyze>')&&!html.includes('data-th-access-code')&&!html.includes('data-feature-analyze disabled')));
  test(page+' 前台不載入功能解鎖模組',()=>assert(!html.includes('tianheng-feature-access-v1.js')));
  test(page+' 結果最前方提供核心結論',()=>assert(html.includes('先看核心結論')&&html.includes('id="verdict"')));
  test(page+' 支援過去驗證且原判與實際結果分開保存',()=>assert(html.includes('id="pastValidation"')&&html.includes('originalPrediction')===false&&html.includes('tianheng_oracle_verifications_v1')));
  test(page+' 載入共用問事驗證模組',()=>assert(html.includes('tianheng-oracle-verification-v1.js?v=20260903')));
  test(page+' 沒有重複 HTML id',()=>{const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);assert.strictEqual(new Set(ids).size,ids.length)});
}
if(!process.exitCode)console.log(`\n${passed}/${passed} passed`);
