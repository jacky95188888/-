'use strict';
const assert=require('assert');
const V=require('./tianheng-oracle-verification-v1.js');
let passed=0;
function test(name,fn){try{fn();passed++;console.log('PASS',name)}catch(error){console.error('FAIL',name,'-',error.message);process.exitCode=1}}
test('辨識民國日常寫法中的過去月日',()=>assert.strictEqual(V.modeFor('她於 8/23 去考試，會通過嗎？','2026-09-03T10:00:00+08:00').mode,'retrospective'));
test('辨識中文年月日為過去事件',()=>assert.strictEqual(V.modeFor('2026年8月23日考試結果如何？','2026-09-03T10:00:00+08:00').mode,'retrospective'));
test('未來日期維持前瞻模式',()=>assert.strictEqual(V.modeFor('9月23日前能收到通知嗎？','2026-09-03T10:00:00+08:00').mode,'prospective'));
test('沒有日期時不冒充過去驗證',()=>assert.strictEqual(V.modeFor('這次考試會通過嗎？','2026-09-03T10:00:00+08:00').mode,'prospective'));
test('四種方向都有白話核心結論',()=>['favorable','blocked','conditional','unresolved'].forEach(direction=>{const v=V.verdict({direction,confidence:'medium'});assert(v.label&&v.text)}));
test('保存資料保留原判且實際結果獨立',()=>{const input={question:'8/23考試會過嗎？'};const outcome={direction:'conditional',label:'有條件'};const record=V.makeRecord(input,outcome,{outcome:'positive',note:'收到合格通知'},'2026-09-03T10:00:00+08:00');assert.deepStrictEqual(record.originalPrediction.outcome,outcome);assert.strictEqual(record.actual.outcome,'positive');assert.notStrictEqual(record.originalPrediction,record.actual)});
if(!process.exitCode)console.log(`\n${passed}/${passed} passed`);
