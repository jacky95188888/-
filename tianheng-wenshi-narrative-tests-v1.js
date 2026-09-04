'use strict';
const N=require('./tianheng-wenshi-narrative-v1.js');
const S=require('./tianheng-wenshi-liuyao-synthesis-v1.js');
const E=require('./tianheng-wenshi-engine-v1.js');
let pass=0,fail=0;
function assert(name,fn){try{if(!fn())throw new Error('assert false');console.log('PASS',name);pass++;}catch(e){console.error('FAIL',name,'::',e.message);fail++;}}
function input(topic='career_job',casts=[7,7,7,7,7,7]){const labels={career_job:'事業／工作',exam_certification:'考試／證照',relationship:'感情／人際',finance_income:'財務／交易'};return{question:'月底前能否收到明確回覆？',category:labels[topic]||'選擇／決策',topic,askedAt:'2026-09-01T08:00:00+08:00',timezone:'Asia/Taipei',eventContext:{attempt:'再次嘗試／重考',eventDate:'2026-10-18',successDefinition:'正式放榜通過',knownObstacle:'法規題失分',strongestEvidence:'最近模考72分',priorResult:'上次差3分',preparation:'已加強法規題',specific:{oneLabel:'目前到哪一關',one:'完成二面',twoLabel:'誰會做最後決定',two:'部門主管'},examMetrics:{priorScore:'67',passScore:'70',mockScore:'72'}},casts,calendar:{monthZhi:'申',dayGan:'甲',dayZhi:'子',source:'敘事固定測試'}};}
function narrative(i=input()){const s=S.analyze(i);return N.compose(s,i);}

assert('六爻敘事層不使用外部 API',()=>N.usesExternalApi===false&&narrative().usesExternalApi===false);
assert('完整提問與主變卦進入第一段',()=>{const p=narrative().paragraphs[0].text;return p.includes('月底前能否收到明確回覆')&&p.includes('主卦')&&p.includes('變卦');});
assert('至少六段且每段可追溯證據',()=>{const n=narrative();return n.paragraphs.length>=6&&n.paragraphs.every(x=>x.title&&x.text.length>25&&x.evidenceRefs.length);});
assert('用神爻位旺衰與日沖進入個案敘事',()=>{const t=narrative().paragraphs.find(x=>x.title==='用神落點').text;return t.includes('第4爻')&&t.includes('囚')&&t.includes('日沖');});
assert('事業與感情使用不同節點和行動語境',()=>JSON.stringify(narrative(input('career_job')).advice)!==JSON.stringify(narrative(input('relationship')).advice));
assert('動爻不同會改寫動變段落',()=>narrative(input('career_job',[7,7,7,7,7,7])).paragraphs.find(x=>x.title==='動變過程').text!==narrative(input('career_job',[7,7,7,9,7,7])).paragraphs.find(x=>x.title==='動變過程').text);
assert('支持阻力文字由實際證據代碼生成',()=>{const n=narrative();return n.evidenceTrace.includes('SEASON_WEAK')&&n.paragraphs.find(x=>x.title==='阻力與未定處').text.includes('失令');});
assert('同一輸入重跑敘事完全一致',()=>JSON.stringify(narrative())===JSON.stringify(narrative()));
assert('敘事不修改原始六爻綜合資料',()=>{const i=input();const s=S.analyze(i);const before=JSON.stringify(s);N.compose(s,i);return JSON.stringify(s)===before;});
assert('總引擎保存原建議與新敘事兩層',()=>{const r=E.analyze(input());return r.result.explanation&&r.result.narrative&&r.layers.originalAdvice&&r.layers.narrative;});
assert('六爻敘事不覆蓋其他引擎',()=>N.legacyOverride===false&&E.analyze(input()).legacyOverride===false);
assert('考試證照直接回答並列出正式揭曉點',()=>{const r=E.analyze(input('exam_certification'));const text=r.result.narrative.paragraphs.map(x=>x.title+x.text).join('');return text.includes('直接回答')&&text.includes('官方成績')&&text.includes('成敗關鍵');});
assert('本次事件資料進入判讀且與卦象分開',()=>{const r=E.analyze(input('exam_certification'));const p=r.result.narrative.paragraphs.find(x=>x.title==='本次事件校正');return p.text.includes('上次差3分')&&p.text.includes('已加強法規題')&&r.result.narrative.eventContext.eventDate==='2026-10-18';});
assert('結果採六級方向並另列過程',()=>{const d=E.analyze(input('exam_certification')).result.narrative.decisionSummary;return ['明顯偏向達成','略偏達成','五五波／條件局','略偏未達成','明顯偏向未達成','證據不足，暫不判'].includes(d.label)&&d.processLabel&&d.probability===null;});
assert('考試分數形成獨立現實校正與具體補強',()=>{const n=E.analyze(input('exam_certification')).result.narrative;return n.decisionSummary.realitySignal.includes('高於及格門檻 2 分')&&n.paragraphs.find(x=>x.title==='具體補強目標').text.includes('三次完整計時模考');});
assert('結論另列成功標準阻力與資料完整度',()=>{const n=E.analyze(input('exam_certification')).result.narrative;const p=n.paragraphs.find(x=>x.title==='成功標準與真正阻力');return p.text.includes('正式放榜通過')&&p.text.includes('法規題失分')&&n.decisionSummary.evidenceQuality==='資料較完整'&&n.decisionSummary.probability===null;});
assert('非考試題會使用該事件的專屬進度與確認點',()=>{const n=E.analyze(input('career_job')).result.narrative;const text=n.paragraphs.find(x=>x.title==='本次事件校正').text;const action=n.paragraphs.find(x=>x.title==='具體補強目標').text;return text.includes('完成二面')&&text.includes('部門主管')&&action.includes('目前到哪一關');});
console.log(`\nRESULT ${pass}/${pass+fail} passed`);if(fail)process.exit(1);
