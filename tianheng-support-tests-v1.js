const fs=require('fs');
const assert=require('assert');
const pages=['index.html','compat.html','ziwei.html','tianheng-wenshi-qa-v1.html','tianheng-meihua-qa-v1.html','tianheng-name-v1.html','tianheng-rename-v1.html'];
let pass=0;function t(n,f){f();pass++;console.log('PASS',n)}
const js=fs.readFileSync('tianheng-support-v1.js','utf8');
t('全站共用新版元件存在',()=>assert.ok(js.includes('th2-float')&&js.includes('th2-card')));
t('隨喜不影響功能',()=>assert.ok(js.includes('不支持也不影響任何免費功能與分析結果')));
t('金額選擇僅揭示轉帳資訊',()=>assert.ok(js.includes("acc.classList.add('show')")&&js.includes('複製帳號')&&!/checkout|paymentIntent/.test(js)));
t('結果完成後自動顯示',()=>assert.ok(js.includes('MutationObserver')&&js.includes("insertAdjacentElement('afterend'")));
t('既有新版卡片與浮鈕不重複',()=>assert.ok(js.includes("document.querySelector('[data-th-support-v2]')")&&js.includes("if(document.querySelector('.th2-float'))return")));
t('無結果容器的頁面仍可開啟支持',()=>assert.ok(js.includes("document.querySelector('main')||document.body")));
t('統計寫入錯誤不產生未處理拒絕',()=>assert.ok(js.includes('return Promise.all(writes)')&&js.includes('統計失敗不影響')));
t('所有載入共用元件的頁面會補上閱讀樣式',()=>assert.ok(js.includes('tianheng-readability.css?v=20260910-quality2')&&js.includes('data-th-readability')));
pages.forEach(p=>t(p+' 載入共用元件',()=>assert.ok(fs.readFileSync(p,'utf8').includes('tianheng-support-v1.js'))));
t('首頁大型檔案保留',()=>assert.ok(fs.statSync('index.html').size>100000));
console.log(`RESULT ${pass}/${pass} passed`);
