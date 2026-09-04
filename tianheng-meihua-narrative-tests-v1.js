'use strict';
const N=require('./tianheng-meihua-narrative-v1.js');
const J=require('./tianheng-meihua-judgment-v1.js');
const E=require('./tianheng-meihua-engine-v1.js');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
function input(category='事業／工作',first=7,second=8){return{question:'月底前能否收到明確回覆？',category,askedAt:'2026-09-01T08:00:00+08:00',timezone:'Asia/Taipei',method:'two_numbers',numbers:{first,second},monthZhi:'申',eventContext:{attempt:'再次嘗試／重考',eventDate:'2026-10-18',successDefinition:'正式放榜通過',knownObstacle:'法規題失分',strongestEvidence:'最近模考72分',priorResult:'上次差3分',preparation:'已加強法規題',specific:{oneLabel:'目前到哪一關',one:'完成二面',twoLabel:'誰會做最後決定',two:'部門主管'},examMetrics:{priorScore:'67',passScore:'70',mockScore:'72'}}};}
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
assert('考試證照直接回答並列出正式揭曉點',()=>{const r=E.analyze(input('考試／證照'));const text=r.result.narrative.paragraphs.map(x=>x.title+x.text).join('');return text.includes('直接回答')&&text.includes('官方成績')&&text.includes('成敗關鍵');});
assert('本次事件資料進入判讀而不改動原卦',()=>{const r=E.analyze(input('考試／證照'));const text=r.result.narrative.paragraphs.find(x=>x.title==='本次事件校正').text;return text.includes('上次差3分')&&text.includes('已加強法規題')&&r.result.narrative.eventContext.eventDate==='2026-10-18';});
assert('結果採六級方向並另列過程',()=>{const d=E.analyze(input('考試／證照')).result.narrative.decisionSummary;return ['明顯偏向達成','略偏達成','五五波／條件局','略偏未達成','明顯偏向未達成','證據不足，暫不判'].includes(d.label)&&d.processLabel&&d.probability===null;});
assert('考試分數形成獨立現實校正與具體補強',()=>{const n=E.analyze(input('考試／證照')).result.narrative;return n.decisionSummary.realitySignal.includes('高於及格門檻 2 分')&&n.paragraphs.find(x=>x.title==='具體補強目標').text.includes('三次完整計時模考');});
assert('結論另列成功標準阻力與資料完整度',()=>{const n=E.analyze(input('考試／證照')).result.narrative;const p=n.paragraphs.find(x=>x.title==='成功標準與真正阻力');return p.text.includes('正式放榜通過')&&p.text.includes('法規題失分')&&n.decisionSummary.evidenceQuality==='資料較完整'&&n.decisionSummary.probability===null;});
assert('非考試題會使用該事件的專屬進度與確認點',()=>{const n=E.analyze(input('事業／工作')).result.narrative;const text=n.paragraphs.find(x=>x.title==='本次事件校正').text;const action=n.paragraphs.find(x=>x.title==='具體補強目標').text;return text.includes('完成二面')&&text.includes('部門主管')&&action.includes('目前到哪一關');});
console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);
