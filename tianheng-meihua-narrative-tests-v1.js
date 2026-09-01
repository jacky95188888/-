'use strict';
const N=require('./tianheng-meihua-narrative-v1.js');
const J=require('./tianheng-meihua-judgment-v1.js');
const E=require('./tianheng-meihua-engine-v1.js');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
function input(category='事業／工作',first=7,second=8){return{question:'月底前能否收到明確回覆？',category,askedAt:'2026-09-01T08:00:00+08:00',timezone:'Asia/Taipei',method:'two_numbers',numbers:{first,second},monthZhi:'申'};}
function narrative(i=input()){const j=J.analyze(i);return N.compose(j,i);}

assert('敘事層明示不使用外部 API',()=>N.usesExternalApi===false&&narrative().usesExternalApi===false);
assert('完整問題直接進入敘事而非只套題型',()=>narrative().paragraphs[0].text.includes('月底前能否收到明確回覆'));
assert('至少五段並逐段保存證據來源',()=>{const n=narrative();return n.paragraphs.length>=5&&n.paragraphs.every(x=>x.title&&x.text.length>35&&x.evidenceRefs.length);});
assert('動爻位置改變會改寫具體過程',()=>narrative(input('事業／工作',7,8)).paragraphs[0].text!==narrative(input('事業／工作',7,9)).paragraphs[0].text);
assert('相同卦局換題型會改寫現實語境',()=>narrative(input('事業／工作')).paragraphs.map(x=>x.text).join('')!==narrative(input('感情／人際')).paragraphs.map(x=>x.text).join(''));
assert('近期做法包含題型節點與原始規則建議',()=>{const n=narrative();return n.advice.canDo.length>=2&&n.advice.verify.join('').includes('正式通知');});
assert('同一輸入重跑敘事完全一致',()=>JSON.stringify(narrative())===JSON.stringify(narrative()));
assert('敘事不修改原始判斷結果',()=>{const i=input();const j=J.analyze(i);const before=JSON.stringify(j);N.compose(j,i);return JSON.stringify(j)===before;});
assert('總引擎同時保存原判斷與新敘事',()=>{const r=E.analyze(input());return r.result.explanation&&r.result.narrative&&r.layers.originalAdvice&&r.layers.narrative;});
assert('敘事層不覆蓋舊引擎',()=>N.legacyOverride===false&&E.analyze(input()).legacyOverride===false);
console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);
