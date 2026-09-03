const fs=require('fs');
const assert=require('assert');
const pages=['index.html','compat.html','ziwei.html','tianheng-wenshi-qa-v1.html','tianheng-meihua-qa-v1.html','tianheng-name-v1.html','tianheng-rename-v1.html'];
let pass=0;function t(n,f){f();pass++;console.log('PASS',n)}
const js=fs.readFileSync('tianheng-support-v1.js','utf8');
t('全站共用元件存在',()=>assert.ok(js.includes('th-support-float')&&js.includes('th-support-card')));
t('隨喜不影響功能',()=>assert.ok(js.includes('支持與否不影響任何功能')));
t('未啟用自動付款',()=>assert.ok(js.includes('未啟用自動付款')));
t('結果完成後自動顯示',()=>assert.ok(js.includes('MutationObserver')&&js.includes("insertAdjacentElement('afterend'")));
t('既有卡片不重複',()=>assert.ok(js.includes("#support.support,.support-card,[data-th-support]")));
pages.forEach(p=>t(p+' 載入共用元件',()=>assert.ok(fs.readFileSync(p,'utf8').includes('tianheng-support-v1.js'))));
t('首頁大型檔案保留',()=>assert.ok(fs.statSync('index.html').size>100000));
console.log(`RESULT ${pass}/${pass} passed`);
