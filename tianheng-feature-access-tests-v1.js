const fs=require('fs');
const assert=require('assert');
const access=fs.readFileSync('tianheng-feature-access-v1.js','utf8');
const worker=fs.readFileSync('tianheng-bazi-access-worker-v1.js','utf8');
let passed=0;
function test(name,fn){try{fn();passed++;console.log('PASS',name)}catch(e){console.error('FAIL',name,'-',e.message);process.exitCode=1}}
test('只傳碼、功能與隨機裝置識別',()=>{assert(access.includes("JSON.stringify({code:code,feature:feature,device:deviceId()})"));assert(!/birthday|pillars|chart/.test(access))});
test('六爻與梅花分開保存解鎖狀態',()=>assert(access.includes("'tianheng_feature_access_'+feature+'_v1'")));
test('不同功能碼不能混用',()=>assert(access.includes("wrong_feature:'這組碼不是用來開通此功能。'")&&worker.includes("recordFeature !== requestedFeature")));
test('未解鎖時停用判讀按鈕',()=>assert(access.includes('target.disabled=true')));
test('驗證成功才開啟判讀',()=>assert(access.includes('target.disabled=false')));
test('舊八字碼向後相容',()=>assert(worker.includes("record.feature || 'bazi'")));
if(!process.exitCode)console.log(`\n${passed}/${passed} passed`);
